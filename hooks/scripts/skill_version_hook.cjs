const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// スキルのソースコードが置かれている絶対パス（引数から取得、デフォルトは旧パスだが事実上必須）
const SKILLS_SOURCE_ROOT = process.argv[2] || "C:\\Synology Drive\\2way-sync\\work\\agent-skills";
const SKILLS_DIR = path.join(SKILLS_SOURCE_ROOT, 'skills');

/**
 * SKILL.md から version を抽出する
 */
function parseSkillVersion(content) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) return null;

  const yaml = frontmatterMatch[1];
  const versionMatch = yaml.match(/^version:\s*['"]?([^'"\r\n\s]+)['"]?/m);
  
  return versionMatch ? versionMatch[1].trim() : null;
}

// stdin から BeforeTool の入力を受け取る
let input;
try {
  const rawInput = fs.readFileSync(0, 'utf8');
  input = JSON.parse(rawInput);
} catch (e) {
  process.exit(0);
}

// activate_skill ツールの実行時のみ介入
if (input.tool_name === 'activate_skill') {
  const skillName = input.tool_input.name;
  const userSkillsDir = path.join(process.env.USERPROFILE || process.env.HOME, '.gemini', 'skills');
  const installedSkillMdPath = path.join(userSkillsDir, skillName, 'SKILL.md');

  // ソースディレクトリ内で SKILL.md を探す（複数の可能性を試行）
  const possiblePaths = [
    path.join(SKILLS_DIR, skillName, 'SKILL.md'),
    path.join(SKILLS_DIR, skillName, 'skill.md'),
    path.join(SKILLS_DIR, skillName, skillName, 'SKILL.md'),
    path.join(SKILLS_DIR, skillName, skillName, 'skill.md')
  ];

  const sourceSkillMdPath = possiblePaths.find(p => fs.existsSync(p));

  // ソース側に SKILL.md が存在する場合のみチェック
  if (sourceSkillMdPath) {
    const sourceContent = fs.readFileSync(sourceSkillMdPath, 'utf8');
    const sourceVersion = parseSkillVersion(sourceContent);

    // ソース側にバージョンが記述されている場合のみ実行
    if (sourceVersion !== null) {
      let installedVersion = null;
      if (fs.existsSync(installedSkillMdPath)) {
        installedVersion = parseSkillVersion(fs.readFileSync(installedSkillMdPath, 'utf8'));
      }

      // バージョン不一致（または未インストール）の場合
      if (sourceVersion !== installedVersion) {
        try {
          const managerPath = path.join(SKILLS_DIR, 'skill-installer', 'skill-installer', 'scripts', 'manager.cjs');
          
          // パッケージ化の対象を決定（スキル名のディレクトリがあればそれを使用）
          const skillSourcePath = path.join(SKILLS_DIR, skillName);
          const namedPath = path.join(skillSourcePath, skillName);
          const packageTargetPath = fs.existsSync(namedPath) ? namedPath : skillSourcePath;

          // 1. パッケージ化
          execSync(`node "${managerPath}" package "${packageTargetPath}"`, { stdio: 'ignore' });
          
          // 2. インストール (user tier)
          const skillFile = path.join(SKILLS_DIR, skillName + '.skill');
          execSync(`node "${managerPath}" install "${skillFile}" user`, { stdio: 'ignore' });

          console.error(`\n[Version Hook] ${skillName} の不一致を検知: ソース(${sourceVersion}) != ロード済み(${installedVersion || 'なし'})`);
          console.error(`最新版を自動インストールしました。変更を反映するため '/skills reload' を実行してください。`);
          
          // システムブロック (exit 2) で現在の activate_skill を中断
          process.exit(2);
        } catch (e) {
          console.error(`\n[Version Hook] 自動更新中にエラーが発生しました: ${e.message}`);
          process.exit(1);
        }
      }
    }
  }
}

// 正常終了
console.log(JSON.stringify({ decision: 'allow' }));
process.exit(0);
