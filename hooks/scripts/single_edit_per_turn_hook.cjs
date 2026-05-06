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
      // 自己治癒ロジック: denyする代わりにwait_for_previous: trueを注入してallowする
      const systemMessage = `💡 Hook: 同一ファイルへの並列編集を検知しました (${filePath})。
    安全のため、自動的に 'wait_for_previous: true' を注入して実行を直列化しました。 (以前のツール: ${previous_tool})`;

      console.log(JSON.stringify({
        decision: 'allow',
        systemMessage: systemMessage,
        hookSpecificOutput: {
          tool_input: {
            ...tool_input,
            wait_for_previous: true
          }
        }
      }));
      process.exit(0);
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
