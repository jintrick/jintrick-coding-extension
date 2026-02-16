const fs = require('fs');
const path = require('path');

// 設定
const API_URL = 'https://api.github.com/repos/google-gemini/gemini-cli/commits?path=docs&per_page=1';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24時間

// パス解決 (dist/hooks/scripts/ -> ../../skills/...)
const EXTENSION_ROOT = path.resolve(__dirname, '../../'); 
const DISCOVERY_PATH = path.join(EXTENSION_ROOT, 'skills/gemini-cli-expert/references/discovery.json');

async function main() {
  // stdin から入力を読む
  const inputData = fs.readFileSync(0, 'utf-8');
  const input = JSON.parse(inputData);
  const toolInput = input.tool_input || {};

  // 1. gemini-cli-expert スキル以外は無視
  if (toolInput.name !== 'gemini-cli-expert') {
    console.log(JSON.stringify({ decision: "allow" }));
    return;
  }

  try {
    const discovery = loadDiscovery();
    const lastChecked = discovery.metadata.last_checked ? new Date(discovery.metadata.last_checked).getTime() : 0;
    const now = Date.now();

    // 2. 更新チェック間隔の確認
    if ((now - lastChecked) > CHECK_INTERVAL_MS) {
      // API から最新コミット情報を取得
      const remoteCommit = await fetchLatestCommit();
      
      if (remoteCommit) {
        const localHash = discovery.metadata.commit_hash;
        
        // 3. 更新検知
        if (localHash && remoteCommit.sha !== localHash) {
          const message = `[gemini-cli-expert] Documentation update detected.\nRemote: ${remoteCommit.sha.substring(0, 7)} (${remoteCommit.date})\nLocal:  ${localHash.substring(0, 7)}`;
          
          // 通知を表示 (更新はユーザーに任せる)
          // last_checked は更新するが、commit_hash は更新しない（通知を継続するため）
          updateDiscoveryMetadata(discovery, { last_checked: new Date().toISOString() });
          
          console.log(JSON.stringify({ 
            decision: "allow",
            systemMessage: message
          }));
          return;
        } else {
          // 更新なし、または初回（localHashがない場合）
          // 初回の場合は現在のハッシュを保存して基準点とする
          const updates = { last_checked: new Date().toISOString() };
          if (!localHash) {
            updates.commit_hash = remoteCommit.sha;
          }
          updateDiscoveryMetadata(discovery, updates);
        }
      }
    }
  } catch (error) {
    console.error(`[expert-docs-hook] Check failed: ${error.message}`);
  }

  // デフォルトは許可
  console.log(JSON.stringify({ decision: "allow" }));
}

function loadDiscovery() {
  if (fs.existsSync(DISCOVERY_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(DISCOVERY_PATH, 'utf-8'));
      if (!data.metadata) data.metadata = {};
      return data;
    } catch (e) {
      return { metadata: {} };
    }
  }
  return { metadata: {} };
}

function updateDiscoveryMetadata(discovery, updates) {
  try {
    discovery.metadata = { ...discovery.metadata, ...updates };
    fs.writeFileSync(DISCOVERY_PATH, JSON.stringify(discovery, null, 2));
  } catch (e) {
    console.error(`Failed to update discovery.json: ${e.message}`);
  }
}

async function fetchLatestCommit() {
  try {
    const response = await fetch(API_URL, {
      headers: { 'User-Agent': 'Gemini-CLI-Extension' }
    });
    
    if (!response.ok) return null;

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        sha: data[0].sha,
        date: data[0].commit.committer.date
      };
    }
    return null;
  } catch (error) {
    console.error(`Fetch failed: ${error.message}`);
    return null;
  }
}

main().catch(err => {
  console.error(err);
  console.log(JSON.stringify({ decision: "allow" }));
});
