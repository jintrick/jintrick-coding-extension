const fs = require('fs');
const path = require('path');

/**
 * getCurrentVersion
 * 
 * package.json から現在のバージョンを取得する。
 * 
 * @returns {string} 現在のバージョン (取得失敗時は '0.0.0')
 */
function getCurrentVersion() {
  try {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version || '0.0.0';
  } catch (e) {
    return '0.0.0';
  }
}

/**
 * inferNextVersion
 * 
 * セマンティックバージョニングに基づき、現在のバージョンと変更タイプから次期バージョンを推論する。
 * 
 * @param {string} version - 現在のバージョン (例: 1.0.0)
 * @param {string} type - 変更タイプ (feat, fix, refactor, docs, chore)
 * @returns {string} v-prefixed 推論された次期バージョン
 */
function inferNextVersion(version, type) {
  const cleanVersion = version.startsWith('v') ? version.substring(1) : version;
  const parts = cleanVersion.split('.');
  if (parts.length < 3) return version;
  
  let [major, minor, patch] = parts.map(Number);
  if (type === 'feat' || type === 'refactor') {
    minor++;
    patch = 0;
  } else {
    patch++;
  }
  return `v${major}.${minor}.${patch}`;
}

// CLI インターフェース
if (require.main === module) {
  let version = process.argv[2];
  let type = process.argv[3];

  // 第一引数がタイプ（feat, fix等）として指定されている、または引数がない場合
  if (!version || ['feat', 'fix', 'refactor', 'docs', 'chore'].includes(version)) {
    type = version || 'feat';
    version = getCurrentVersion();
  } else if (!type) {
    type = 'feat';
  }
  
  console.log(inferNextVersion(version, type));
}

module.exports = { inferNextVersion, getCurrentVersion };
