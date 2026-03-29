/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const path = require('path');

const { execSync } = require('child_process');

function main() {
  const version = execSync('gemini --version').toString().trim();
  const vDir = `v${version}`;
  
  const inputPath = path.join(__dirname, '../docs/system_prompt', vDir, 'system-prompt-raw.md');
  const outputPath = path.join(__dirname, '../docs/system_prompt', vDir, 'original.md');

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(inputPath, 'utf8');

  // 1. Available Sub-Agents セクションの置換
  // タグ構造を維持し、内部のみを ${SubAgents} に置き換える
  content = content.replace(/(<available_subagents>)[\s\S]*?(<\/available_subagents>)/g, '$1\n${SubAgents}\n$2');

  // 2. Available Agent Skills セクションの置換
  // タグ構造を維持し、内部のみを ${AgentSkills} に置き換える
  content = content.replace(/(<available_skills>)[\s\S]*?(<\/available_skills>)/g, '$1\n${AgentSkills}\n$2');


  // 3. User Memory (Contextual Instructions) セクションの削除
  // # Contextual Instructions (GEMINI.md) から </loaded_context> までを削除
  // 前後の余分な改行も調整する
  content = content.replace(/# Contextual Instructions \(GEMINI\.md\)[\s\S]*?<\/loaded_context>/g, '');

  // 連続する改行を整理（3つ以上の改行を2つにする）
  content = content.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(outputPath, content.trim() + '\n');
  console.log(`Expected system prompt generated: ${outputPath}`);
}

main();
