const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cacheDir = path.resolve(__dirname, '..', '..', 'hooks', 'cache');
const tmpFile = path.join(cacheDir, 'verify_alarm.ps1');

const psScript = `\uFEFF
$ErrorActionPreference = 'SilentlyContinue'
try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    
    # scenario='alarm' is the key to bypass Windows Focus Assist/Suppression
    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml('<toast scenario=\"alarm\"><visual><binding template=\"ToastGeneric\"><text>ALARM TEST</text><text>This should BYPASS ALL suppression</text></binding></visual></toast>')
    
    $appId = 'Microsoft.Windows.Explorer'
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
    Write-Host "Alarm Scenario Toast Sent."
    [System.Threading.Thread]::Sleep(500)
} catch {
    Write-Error $_.Exception.Message
}
`;

fs.writeFileSync(tmpFile, psScript, 'utf8');

console.log('Sending ALARM scenario toast...');
spawnSync('powershell.exe', [
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', tmpFile
], { stdio: 'inherit' });
