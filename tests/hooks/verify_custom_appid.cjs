const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cacheDir = path.resolve(__dirname, '..', '..', 'hooks', 'cache');
const tmpFile = path.join(cacheDir, 'verify_custom.ps1');

const title = 'Custom AppId Verification';
const body = 'Unique AppId: Should bypass ALL suppression';

// 完全に独立した文字列を AppID に使用
const appId = 'Gemini.CLI.Notifier.v1';

const psScript = `\uFEFF
$ErrorActionPreference = 'SilentlyContinue'
try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text>${title}</text><text>${body}</text></binding></visual></toast>')
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('${appId}').Show($toast)
    Write-Host "Toast Sent with AppID: ${appId}"
    [System.Threading.Thread]::Sleep(500)
} catch {
    Write-Error $_.Exception.Message
}
`;

fs.writeFileSync(tmpFile, psScript, 'utf8');

console.log(`Sending toast with AppID: ${appId}...`);
spawnSync('powershell.exe', [
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', tmpFile
], { stdio: 'inherit' });
