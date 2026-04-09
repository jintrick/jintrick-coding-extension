const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.resolve(__dirname, '../assets');
const TARGET_DIR = process.cwd();

/**
 * Atomic file copy with conflict detection.
 */
function copyDir(src, dest, force) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, force);
    } else {
      if (fs.existsSync(destPath) && !force) {
        throw new Error(`Conflict: ${destPath} already exists.`);
      }
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${entry.name} to ${destPath}`);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');

  console.log(`Initializing jintrick project in ${TARGET_DIR}...`);

  try {
    if (!fs.existsSync(ASSETS_DIR)) {
      throw new Error(`Assets directory not found at ${ASSETS_DIR}`);
    }

    // Pre-check for conflicts to remain Idempotent/Safe
    if (!force) {
      let hasConflict = false;
      const checkConflict = (src, dest) => {
        if (!fs.existsSync(src)) return;
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            checkConflict(srcPath, destPath);
          } else {
            if (fs.existsSync(destPath)) {
              console.error(`Conflict: ${destPath} already exists.`);
              hasConflict = true;
            }
          }
        }
      };
      checkConflict(ASSETS_DIR, TARGET_DIR);
      if (hasConflict) {
        console.error('Initialization aborted. Use --force to overwrite existing files.');
        process.exit(1);
      }
    }

    copyDir(ASSETS_DIR, TARGET_DIR, force);
    console.log('Project initialization completed successfully.');
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
