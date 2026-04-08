#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * single_edit_per_turn_hook.cjs
 *
 * 同一ターン内での同一ファイルに対する複数回の外科的編集（replace）を阻止するフック。
 * ターンの不整合（古い行番号やコンテキストへの適用）を防ぐことを目的とする。
 * write_file は副作用がないため制限から除外する。
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
    // replace ツールのみを制限対象とする
    if (tool_name !== 'replace') {
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

    let modifiedFiles = [];
    if (fs.existsSync(cacheFile)) {
      try {
        modifiedFiles = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch (e) {
        modifiedFiles = [];
      }
    }

    const waitForPrevious = tool_input && tool_input.wait_for_previous === true;
    if (modifiedFiles.includes(filePath) && !waitForPrevious) {
      deny(
        "Duplicate file edit (replace) in a single turn",
        "同一ターン内での同一ファイルに対する並列した複数回の外科的編集（replace）は禁止されています。外科的編集はファイルの状態を変化させるため、複数の編集が必要な場合は `wait_for_previous: true` を指定して順次実行するか、ターンを分けて実行してください。"
      );
    } else {
      if (!modifiedFiles.includes(filePath)) {
        modifiedFiles.push(filePath);
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
