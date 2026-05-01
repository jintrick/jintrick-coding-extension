#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * single_edit_per_turn_hook.cjs
 *
 * 同一ターン内での同一ファイルに対する複数回の編集（replace, write_file 等）を阻止するフック。
 * ターンの不整合（古い行番号やコンテキストへの適用、Race Condition）を防ぐことを目的とする。
 * 制限対象ツールを replace および write_file とし、ロック情報の構造を Record<FilePath, ToolName> とする。
 */
function main() {
  let input;
  try {
    const rawInput = fs.readFileSync(0, 'utf8');
    if (!rawInput) process.exit(0);
    input = JSON.parse(rawInput);
  } catch (e) {
    process.exit(0);
  }

  const { hook_event_name, tool_name, tool_input, session_id } = input;
  if (!session_id) {
    allow();
  }

  // 規約遵守: プロジェクト外（OSの一時ディレクトリ）にロックファイルを作成
  const cacheFile = path.join(os.tmpdir(), `gemini_cli_modified_${session_id}.json`);

  // ターン開始時にロックを確実に初期化
  if (hook_event_name === 'BeforeAgent') {
    try {
      if (fs.existsSync(cacheFile)) {
        fs.unlinkSync(cacheFile);
      }
    } catch (e) {
      // ignore
    }
    allow();
  } else if (hook_event_name === 'BeforeTool') {
    // replace と write_file を制限対象とする
    if (!['replace', 'write_file'].includes(tool_name)) {
      allow();
    }
    const filePath = tool_input && tool_input.file_path;
    if (!filePath) {
      allow();
    }

    // 古いロック（5分以上経過）のクリーンアップ
    if (fs.existsSync(cacheFile)) {
      try {
        const stats = fs.statSync(cacheFile);
        if (Date.now() - stats.mtimeMs > 300000) {
          fs.unlinkSync(cacheFile);
        }
      } catch (e) {
        // ignore
      }
    }

    let modifiedFiles = {};
    if (fs.existsSync(cacheFile)) {
      try {
        modifiedFiles = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        // 以前の配列形式との後方互換性または移行エラー対策
        if (Array.isArray(modifiedFiles)) {
          modifiedFiles = {};
        }
      } catch (e) {
        modifiedFiles = {};
      }
    }

    const waitForPrevious = tool_input && tool_input.wait_for_previous === true;
    if (modifiedFiles[filePath] && !waitForPrevious) {
      const previous_tool = modifiedFiles[filePath];
      const reason = `[PHYSICAL CONCURRENCY ERROR] File is LOCKED: ${filePath}`;
      const systemMessage = `【物理的並列実行エラー】対象ファイルは現在ロックされています。
同一ターン内に同一ファイルに対して複数の編集ツール（replace, write_file 等）を並列にプランニングすることは物理的に不可能です。
ツールを変更（例: replace から write_file へ）しても、同一ファイルへの並列アクセスである限り、このエラーは回避できません。

原因: あなたの現在の実行プランは、物理的な不整合（Race Condition）を引き起こす構成になっています。
解決策:
1. プランを修正し、同一ファイルへの操作には 'wait_for_previous: true' を付与して直列化してください。
2. または、複数の変更を1つのツール呼び出しに集約してください。

競合ツール: ${tool_name} (現在) vs ${previous_tool} (実行待ち)`;

      deny(reason, systemMessage);
    } else {
      if (!modifiedFiles[filePath]) {
        modifiedFiles[filePath] = tool_name;
        fs.writeFileSync(cacheFile, JSON.stringify(modifiedFiles));
      }
      allow();
    }
  } else if (hook_event_name === 'AfterAgent') {
    // ターン終了時にもクリーンアップを行う
    try {
      if (fs.existsSync(cacheFile)) {
        fs.unlinkSync(cacheFile);
      }
    } catch (e) {
      // ignore
    }
    allow();
  } else {
    allow();
  }
}

function allow() {
  console.log(JSON.stringify({ decision: 'allow' }));
  process.exit(0);
}

function deny(reason, systemMessage) {
  console.log(JSON.stringify({
    decision: 'deny',
    reason: reason,
    systemMessage: systemMessage
  }));
  process.exit(0);
}

main();
