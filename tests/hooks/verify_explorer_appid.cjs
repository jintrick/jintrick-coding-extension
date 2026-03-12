const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cacheDir = path.resolve(__dirname, '..', '..', 'hooks', 'cache');
const tmpFile = path.join(cacheDir, 'verify_explorer.ps1');

const title = 'AppId Verification';
const body = 'Explorer AppId: Should appear IMMEDIATELY';

const psScript = `\uFEFF
$ErrorActionPreference = 'SilentlyContinue'
try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text>${title}</text><text>${body}</text></binding></visual></toast>')
    $appId = 'Microsoft.Windows.Explorer'
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
    Write-Host "Toast Registration Successful (Explorer AppID)"
} catch {
    Write-Error $_.Exception.Message
}
`;

fs.writeFileSync(tmpFile, psScript, 'utf8');

console.log('Sending toast with Explorer AppID...');
const result = spawnSync('powershell.exe', [
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', tmpFile
], { encoding: 'utf8' });

console.log(result.stdout);
if (result.stderr) console.error('Error:', result.stderr);
