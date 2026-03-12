const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const logFile = path.join(__dirname, 'race_test.log');
function log(msg) {
    const time = new Date().toISOString();
    console.log(`[${time}] ${msg}`);
    fs.appendFileSync(logFile, `[${time}] ${msg}\n`, 'utf8');
}

const psScript = `
$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text>Race Test</text><text>Testing notification timing</text></binding></visual></toast>')
$appId = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe'
$toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
`;
const tmpFile = path.join(__dirname, 'test_toast.ps1');
fs.writeFileSync(tmpFile, psScript, 'utf8');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function runTest(mode) {
    log(`--- START TEST: ${mode} ---`);
    
    if (mode === 'sync') {
        log('Spawning PowerShell (Sync)...');
        spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tmpFile]);
        log('PowerShell finished. Now blocking for user input (Simulating ask_user)...');
    } else {
        log('Spawning PowerShell (Async/Detached)...');
        const child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tmpFile], {
            detached: true,
            stdio: 'ignore'
        });
        child.unref();
        log('PowerShell spawned asynchronously. Now blocking for user input (Simulating ask_user)...');
    }

    return new Promise(resolve => {
        rl.question('>> トーストが表示されましたか？ [Enter] を押して終了: ', () => {
            log('User unblocked the script.');
            resolve();
        });
    });
}

(async () => {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
    
    console.log('【実験 A: 同期実行の検証】');
    await runTest('sync');
    
    console.log('\n【実験 B: 非同期実行の検証】');
    await runTest('async');
    
    rl.close();
    log('--- ALL TESTS FINISHED ---');
})();
