const { spawn } = require('child_process');
const readline = require('readline');

console.log('--- GRAND ESCAPE SOUND TEST ---');
console.log('Step 1: Dispatching independent sound process via cmd /c start...');

// cmd /c start を使うことで、Nodeの管理外のプロセスとしてPowerShellを立ち上げる
spawn('cmd.exe', [
    '/c', 
    'start /min powershell.exe -NoProfile -Command "[System.Console]::Beep(880, 500)"'
], {
    detached: true,
    stdio: 'ignore'
}).unref();

console.log('Step 2: Entering Input Prompt (UI LOCK SIMULATION)...');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('>> 音は今（Enterを押す前に）聞こえましたか？ [Enter] を押して終了: ', () => {
    rl.close();
    console.log('--- TEST FINISHED ---');
});
