const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const cacheDir = path.resolve(__dirname, '..', '..', 'hooks', 'cache');
const tmpFile = path.join(cacheDir, 'verify_blocking_hide.ps1');

const psScript = `\uFEFF
$ErrorActionPreference = 'SilentlyContinue'
try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    [Windows.UI.Notifications.ToastNotificationPriority, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null

    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text>Hide Test</text><text>Testing windowsHide effect</text></binding></visual></toast>')
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    $toast.Priority = [Windows.UI.Notifications.ToastNotificationPriority]::High
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Microsoft.Windows.Explorer').Show($toast)
    [System.Threading.Thread]::Sleep(500)
} catch {}
`;

fs.writeFileSync(tmpFile, psScript, 'utf8');

console.log('--- TEST START (with windowsHide: true) ---');
console.log('Step 1: Sending High Priority Toast with windowsHide...');
// フックと同じオプションを付与
spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tmpFile], { windowsHide: true });

console.log('Step 2: Entering Input Prompt...');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('>> この状態でトーストは出ていますか？ [Enter] を押して終了: ', () => {
    console.log('Step 3: User unblocked the terminal.');
    rl.close();
    console.log('--- TEST FINISHED ---');
});
