/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const path = require('path');

const { execSync } = require('child_process');

async function main() {
  // 1. バージョンの動的取得 (例: "0.35.3")
  const version = execSync('gemini --version').toString().trim();
  const vDir = `v${version}`;

  // 2. npm グローバルルートの取得
  const npmGlobalRoot = execSync('npm root -g').toString().trim();
  const snippetsPath = path.join(
    npmGlobalRoot,
    '@google/gemini-cli/node_modules/@google/gemini-cli-core/dist/src/prompts/snippets.js'
  ).replace(/\\/g, '/');

  if (!fs.existsSync(snippetsPath)) {
    throw new Error(`snippets.js not found at: ${snippetsPath}`);
  }

  // ESM モジュールを動的にインポート
  const snippets = await import(`file://${snippetsPath}`);

  // (options の構築部分は省略しない ...)
  const options = {
    preamble: { interactive: true },
    coreMandates: { contextFilenames: ['GEMINI.md'] },
    subAgents: [
      { name: 'codebase_investigator', description: 'The specialized tool for codebase analysis...' },
      { name: 'cli_help', description: 'Specialized in answering questions...' }
    ],
    agentSkills: [
      { name: 'skill-creator', description: 'Guide for creating effective skills.', location: '/path/to/skill' }
    ],
    primaryWorkflows: {
      enableEnterPlanModeTool: true,
      enableGrep: true,
      enableGlob: true,
      enableCodebaseInvestigator: true,
      interactive: true
    },
    operationalGuidelines: {
      interactive: true,
      interactiveShellEnabled: true
    },
    gitRepo: { interactive: true }
  };

  const prompt = snippets.getCoreSystemPrompt(options);
  
  const outputDir = path.join(__dirname, '../docs/system_prompt', vDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, 'system-prompt-raw.md');
  fs.writeFileSync(outputPath, prompt);
  console.log(`System prompt extracted to: ${outputPath}`);
}

main().catch(console.error);
