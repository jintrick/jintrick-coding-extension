const { spawnSync } = require('child_process');
const readline = require('readline');

console.log('--- SOUND PENETRATION TEST ---');
console.log('Step 1: Playing System Sound (Asterisk)...');

// 音を鳴らすコマンドを実行
spawnSync('powershell.exe', [
    '-NoProfile',
    '-Command',
    '[System.Media.SystemSounds]::Asterisk.Play(); Start-Sleep -Milliseconds 500'
]);

console.log('Step 2: Entering Input Prompt (UI LOCK SIMULATION)...');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('>> 音は聞こえましたか？（Enterを押す前に聞こえれば成功です） [Enter] を押して終了: ', () => {
    rl.close();
    console.log('--- TEST FINISHED ---');
});
