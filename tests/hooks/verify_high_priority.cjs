const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cacheDir = path.resolve(__dirname, '..', '..', 'hooks', 'cache');
const tmpFile = path.join(cacheDir, 'verify_priority.ps1');

const title = 'High Priority Test';
const body = 'This SHOULD bypass suppression and appear NOW';

const psScript = `\uFEFF
$ErrorActionPreference = 'SilentlyContinue'
try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    
    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text>${title}</text><text>${body}</text></binding></visual></toast>')
    
    $appId = 'Microsoft.Windows.Explorer'
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    
    # Set Priority to High to bypass 'User is busy' suppression
    [Windows.UI.Notifications.ToastNotificationPriority, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    $toast.Priority = [Windows.UI.Notifications.ToastNotificationPriority]::High
    
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
    Write-Host "High Priority Toast Sent."
    [System.Threading.Thread]::Sleep(500)
} catch {
    Write-Error $_.Exception.Message
}
`;

fs.writeFileSync(tmpFile, psScript, 'utf8');

console.log('Sending HIGH PRIORITY toast...');
spawnSync('powershell.exe', [
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', tmpFile
], { stdio: 'inherit' });
