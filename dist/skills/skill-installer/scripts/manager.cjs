const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Runs a shell command and handles errors gracefully for the agent.
 * @param {string} cmd The command to execute.
 */
function run(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    console.error(`\nError: Command failed - ${cmd}`);
    if (e.message) console.error(`Reason: ${e.message}`);
    process.exit(1);
  }
}

/**
 * Extracts a .skill file to a target directory.
 * @param {string} skillFile Absolute path to the .skill file.
 * @param {string} targetDir Absolute path to the destination directory.
 */
function extract(skillFile, targetDir) {
  if (!fs.existsSync(skillFile)) {
    console.error(`Error: ${skillFile} not found.`);
    process.exit(1);
  }

  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  if (process.platform === 'win32') {
    const tempZip = skillFile.replace(/\.skill$/, '.zip');
    if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);
    fs.copyFileSync(skillFile, tempZip);
    
    try {
      const psCommand = `Expand-Archive -Path '${tempZip}' -DestinationPath '${targetDir}' -Force`;
      run(`powershell.exe -NoProfile -Command "${psCommand}"`);
    } finally {
      if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);
    }
  } else {
    run(`tar -xf "${skillFile}" -C "${targetDir}"`);
  }
}

const command = process.argv[2];
const skillDir = process.argv[3];

if (!command || !skillDir) {
  console.log('Usage: node manager.cjs [package|install|unpack|uninstall] <skill-directory-or-file> [options]');
  console.log('  package   <dir>           - Create a .skill file from a directory');
  console.log('  install   <file> [scope]  - Install a .skill file (scope: user|workspace)');
  console.log('  unpack    <file> [dest]   - Extract a .skill file to a directory');
  console.log('  uninstall <name> [scope]  - Uninstall a skill by name (scope: user|workspace)');
  process.exit(1);
}

if (command === 'package') {
  const absolutePath = path.resolve(skillDir);
  const skillName = path.basename(absolutePath);
  const outputFile = path.resolve(`${skillName}.skill`);
  const tempZip = path.resolve(`${skillName}.zip`);

  console.log(`Packaging ${skillName} into ${outputFile}...`);

  if (process.platform === 'win32') {
    if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);
    const psCommand = `Compress-Archive -Path '${absolutePath}\\*' -DestinationPath '${tempZip}' -Force`;
    run(`powershell.exe -NoProfile -Command "${psCommand}"`);
    if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    fs.renameSync(tempZip, outputFile);
  } else {
    run(`tar -czf "${outputFile}" -C "${absolutePath}" .`);
  }
  console.log('Packaging complete.');

} else if (command === 'install') {
  const skillFile = path.resolve(skillDir);
  const skillName = path.basename(skillFile, '.skill');
  const scope = process.argv[4] || 'user';
  
  const targetBase = scope === 'user' 
    ? path.join(process.env.USERPROFILE || process.env.HOME, '.gemini', 'skills')
    : path.join(process.cwd(), '.gemini', 'skills');
  
  const targetDir = path.join(targetBase, skillName);

  console.log(`Installing ${skillName} to ${targetDir} (${scope} scope)...`);
  extract(skillFile, targetDir);

  console.log(`\nSuccessfully installed ${skillName}!`);
  console.log(`IMPORTANT: Run '/skills reload' in your interactive Gemini CLI session.`);

} else if (command === 'unpack') {
  const skillFile = path.resolve(skillDir);
  const skillName = path.basename(skillFile, '.skill');
  const destDir = path.resolve(process.argv[4] || skillName);

  console.log(`Unpacking ${skillFile} to ${destDir}...`);
  extract(skillFile, destDir);
  console.log('Unpacking complete.');

} else if (command === 'uninstall') {
  const skillName = skillDir; // In this case, it's the name, not a path
  const scope = process.argv[4] || 'user';
  
  const targetBase = scope === 'user' 
    ? path.join(process.env.USERPROFILE || process.env.HOME, '.gemini', 'skills')
    : path.join(process.cwd(), '.gemini', 'skills');
  
  const targetDir = path.join(targetBase, skillName);

  if (fs.existsSync(targetDir)) {
    console.log(`Uninstalling ${skillName} from ${targetDir}...`);
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.log('Uninstallation complete.');
    console.log(`IMPORTANT: Run '/skills reload' in your interactive Gemini CLI session.`);
  } else {
    console.warn(`Warning: Skill '${skillName}' not found in ${scope} scope.`);
  }
}
