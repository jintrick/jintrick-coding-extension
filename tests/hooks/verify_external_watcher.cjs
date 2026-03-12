const fs = require('fs');
const readline = require('readline');

console.log('--- EXTERNAL WATCHER TEST ---');
console.log('Step 1: Creating trigger file for the other window...');

// 別のウィンドウが監視しているファイルを作成
fs.writeFileSync('trigger_sound.txt', 'beep');

console.log('Step 2: Entering Input Prompt (UI LOCK SIMULATION)...');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('>> 別のウィンドウから音は聞こえましたか？ [Enter] を押して終了: ', () => {
    rl.close();
    console.log('--- TEST FINISHED ---');
});
