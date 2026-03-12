const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const cacheDir = path.resolve(__dirname, '..', '..', 'hooks', 'cache');
const debugLog = path.join(cacheDir, 'debug.log');

function log(msg) {
    const time = new Date().toISOString();
    try {
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        fs.appendFileSync(debugLog, `[${time}] ${msg}\n`, 'utf8');
    } catch (e) {}
}

function sendAllow() {
    process.stdout.write(JSON.stringify({ decision: 'allow' }) + '\n');
}

function processEvent(inputData) {
    const { hook_event_name, session_id, cwd } = inputData;
    
    if (!session_id || !cwd) {
        return sendAllow();
    }

    const lockFile = path.join(cacheDir, `${session_id}.lock`);
    const thresholdMs = parseInt(process.env.JINTRICK_TOAST_THRESHOLD_MS || '30000', 10);

    if (hook_event_name === 'BeforeAgent') {
        try {
            fs.writeFileSync(lockFile, Date.now().toString(), 'utf8');
            log(`Timer started: BeforeAgent (session: ${session_id})`);
        } catch (e) {
            log(`Failed to start timer: ${e.message}`);
        }
    } else if (hook_event_name === 'AfterAgent') {
        if (fs.existsSync(lockFile)) {
            try {
                const startTimeStr = fs.readFileSync(lockFile, 'utf8');
                const startTimeMs = parseInt(startTimeStr, 10);
                const now = Date.now();
                const durationMs = now - startTimeMs;

                if (durationMs >= thresholdMs) {
                    log(`Task completed. Duration ${durationMs}ms >= Threshold ${thresholdMs}ms. Sending robust toast.`);
                    showToast(cwd, durationMs);
                }

                fs.unlinkSync(lockFile);
                log(`Timer cleaned up: AfterAgent (session: ${session_id})`);
            } catch (e) {
                log(`AfterAgent logic failed: ${e.message}`);
            }
        }
    }

    sendAllow();
}

function showToast(cwd, durationMs) {
    const projectName = path.basename(cwd);
    const durationSec = (durationMs / 1000).toFixed(1);
    const title = `Gemini CLI: ${projectName}`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const body = `タスク完了: 実行時間 ${durationSec}s`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Robust Delivery Settings (Lessons from v2.5.0):
    // 1. Use 'Microsoft.Windows.Explorer' AppID to bypass terminal-specific suppression.
    // 2. Set Priority to 'High' to ensure it's not discarded by Windows Focus Assist.
    const appId = 'Microsoft.Windows.Explorer';

    const psScript = `\uFEFF
$ErrorActionPreference = 'SilentlyContinue'
try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    [Windows.UI.Notifications.ToastNotificationPriority, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null

    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text>${title}</text><text>${body}</text></binding></visual></toast>')
    
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    $toast.Priority = [Windows.UI.Notifications.ToastNotificationPriority]::High
    
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('${appId}').Show($toast)
    # Ensure registration is processed by OS
    [System.Threading.Thread]::Sleep(500)
} catch {}
`;

    const tmpFile = path.join(cacheDir, `toast_runner.ps1`);
    try {
        fs.writeFileSync(tmpFile, psScript, 'utf8');
        spawnSync('powershell.exe', [
            '-NoProfile',
            '-ExecutionPolicy', 'Bypass',
            '-File', tmpFile
        ], { windowsHide: true });
        
        log(`Toast delivered successfully (Sync/HighPriority).`);
    } catch (e) {
        log(`Failed to deliver toast: ${e.message}`);
    }
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
