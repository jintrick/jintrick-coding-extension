const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const cacheDir = path.resolve(__dirname, '..', '..', 'hooks', 'cache');

function sendAllow() {
    process.stdout.write(JSON.stringify({ decision: 'allow' }) + '\n');
}

function processEvent(inputData) {
    const { hook_event_name, session_id, cwd } = inputData;
    
    if (!session_id || !cwd) {
        return sendAllow();
    }

    if (!fs.existsSync(cacheDir)) {
        try {
            fs.mkdirSync(cacheDir, { recursive: true });
        } catch (e) {}
    }

    const lockFile = path.join(cacheDir, `${session_id}.lock`);

    if (hook_event_name === 'BeforeAgent') {
        try {
            // BeforeAgent はユーザー入力ごとに1回だけ発火するため、wx モードで確実に新規作成
            const fd = fs.openSync(lockFile, 'w'); // 上書きして時間をリセット
            fs.closeSync(fd);
        } catch (e) {}
    } else if (hook_event_name === 'AfterAgent') {
        if (fs.existsSync(lockFile)) {
            try {
                const stats = fs.statSync(lockFile);
                const durationMs = Date.now() - stats.mtimeMs;
                
                fs.unlinkSync(lockFile);

                // 10,000ms (10秒) 以上のタスクに対して通知
                if (durationMs >= 10000) {
                    showToast(cwd, durationMs);
                }
            } catch (e) {}
        }
    }

    sendAllow();
}

function showToast(cwd, durationMs) {
    const projectName = path.basename(cwd);
    const durationSec = (durationMs / 1000).toFixed(1);
    const title = `Gemini CLI: ${projectName}`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const body = `タスク完了: 実行時間 ${durationSec}s`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const psScript = `\uFEFF
$ErrorActionPreference = 'SilentlyContinue'
try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text>${title}</text><text>${body}</text></binding></visual></toast>')
    $appId = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe'
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
} catch {}
`;

    const tmpFile = path.join(cacheDir, 'toast_runner.ps1');
    try {
        fs.writeFileSync(tmpFile, psScript, 'utf8');

        // 非同期だと親が死ぬ際に子も死ぬ可能性があるため、spawnSync で確実に実行
        spawnSync('powershell.exe', [
            '-NoProfile',
            '-ExecutionPolicy', 'Bypass',
            '-File', tmpFile
        ], {
            windowsHide: true,
            timeout: 5000 // 5秒以上かかることはまずないのでタイムアウト設定
        });
    } catch (e) {}
}

let chunks = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
    chunks += chunk;
});

process.stdin.on('end', () => {
    try {
        if (!chunks) return sendAllow();
        const inputData = JSON.parse(chunks);
        processEvent(inputData);
    } catch (e) {
        sendAllow();
    }
});
