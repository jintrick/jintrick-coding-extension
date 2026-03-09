/**
 * Gemini CLI System Prompt Builder (Stand-alone Version)
 * 
 * 役割: このディレクトリ内の各モジュールを結合し、
 *       実機用のクリーンな system.md を生成する。
 */

const fs = require('node:fs');
const path = require('node:path');

const OUTPUT_FILE = path.join(__dirname, 'system.md');

// 結合順序の定義
const FILES = [
  'PREAMBLE.md',
  'CORE_MANDATES.md',
  'AVAILABLE_SUB_AGENTS.md',
  'AVAILABLE_AGENT_SKILLS.md',
  'HOOK_CONTEXT.md',
  'PRIMARY_WORKFLOWS.md',
  'OPERATIONAL_GUIDELINES.md',
  'GIT.md'
];

function build() {
  console.log('Building system.md from local modules...');

  try {
    const combinedContent = FILES.map(file => {
      const filePath = path.join(__dirname, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`Warning: File not found: ${file}`);
        return '';
      }

      let content = fs.readFileSync(filePath, 'utf8');

      // 1. 出典タグの削除: [GC], [CC], [J], [GC/CC] 等
      //    タグ直後のスペースも一緒に消す
      content = content.replace(/\[(GC|CC|J|GC\/CC|GC\/CC\/J)\]\s*/g, '');

      // 2. 識別番号の削除: "- **S1 ", "- **T1 " 等の直後の番号と空白を消す
      content = content.replace(/- \*\*([S|E|T|W|O|C|G|F]\d+\s+)/g, '- **');

      // 3. 補正: もし置換の結果アスタリスクが3つ並んでしまったら2つに戻す
      content = content.replace(/\*\*\* /g, '** ');

      return content.trim();
    }).filter(c => c !== '').join('\n\n');

    fs.writeFileSync(OUTPUT_FILE, combinedContent, 'utf8');
    console.log(`Successfully generated: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
