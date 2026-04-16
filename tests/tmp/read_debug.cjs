const fs = require('fs');
const path = require('path');
const os = require('os');

const debugFile = path.join(os.tmpdir(), 'gemini_cli_last_replace_input.json');
if (fs.existsSync(debugFile)) {
    console.log(fs.readFileSync(debugFile, 'utf8'));
} else {
    console.log('Debug file not found at: ' + debugFile);
}
