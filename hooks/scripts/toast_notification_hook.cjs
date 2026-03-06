const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function sendAllow(reason) {
    process.stdout.write(JSON.stringify({ decision: 'allow' }) + '\n');
}

function processEvent(inputData) {
    const { hook_event_name, session_id, cwd } = inputData;
    if (!session_id || !cwd) {
        return sendAllow();
    }

    const cacheDir = path.join(__dirname, '..', '..', 'hooks', 'cache');
    if (!fs.existsSync(cacheDir)) {
        try {
            fs.mkdirSync(cacheDir, { recursive: true });
        } catch (e) {
            console.error(`Failed to create cache dir: ${e.message}`);
        }
    }

    const lockFile = path.join(cacheDir, `${session_id}.lock`);

    if (hook_event_name === 'BeforeModel') {
        try {
            // Create empty file exclusively. If it exists, this throws EEXIST, which is expected.
            const fd = fs.openSync(lockFile, 'wx');
            fs.closeSync(fd);
        } catch (e) {
            if (e.code !== 'EEXIST') {
                console.error(`Failed to create lock file: ${e.message}`);
            }
        }
    } else if (hook_event_name === 'AfterAgent') {
        if (fs.existsSync(lockFile)) {
            try {
                const stats = fs.statSync(lockFile);
                const durationMs = Date.now() - stats.mtimeMs;
                fs.unlinkSync(lockFile); // Cleanup

                // 10,000ms 以上のタスクに対してトースト通知
                if (durationMs >= 10000) {
                    showToast(cwd, durationMs);
                }
            } catch (e) {
                console.error(`Failed to process lock file: ${e.message}`);
            }
        }
    }

    // Hook 完了。メインプロセスをブロックしないために即座に allow を返す
    sendAllow();
}

function showToast(cwd, durationMs) {
    const projectName = path.basename(cwd);
    const durationSec = (durationMs / 1000).toFixed(1);

    // XML のエスケープ
    const title = `Gemini CLI: ${projectName}`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const body = `タスク完了: 実行時間 ${durationSec}s`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const psScript = `
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text>${title}</text><text>${body}</text></binding></visual></toast>')
$toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Gemini.CLI').Show($toast)
  `;

    // PowerShell コマンドを Base64 エンコードしてエスケープ問題を回避
    const encodedCommand = Buffer.from(psScript, 'utf16le').toString('base64');

    try {
        const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-EncodedCommand', encodedCommand], {
            detached: true,
            stdio: 'ignore', // 完全に切り離す
            windowsHide: true,
        });
        child.unref(); // メインプロセスが子プロセスを待たないようにする
    } catch (e) {
        console.error(`Failed to spawn powershell: ${e.message}`);
    }
}

// ---------------------------------------------------------
// CLI本体からの JSON（標準入力）の読み込み
// ---------------------------------------------------------
let chunks = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
    chunks += chunk;
});

process.stdin.on('end', () => {
    try {
        const inputData = JSON.parse(chunks);
        processEvent(inputData);
    } catch (e) {
        console.error(`JSON Parse Error: ${e.message}`);
        sendAllow();
    }
});
