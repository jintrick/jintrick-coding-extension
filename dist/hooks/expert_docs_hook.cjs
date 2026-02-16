// hooks/scripts/expert_docs_hook.cjs
var fs = require("fs");
var path = require("path");
var API_URL = "https://api.github.com/repos/google-gemini/gemini-cli/commits?path=docs&per_page=1";
var CHECK_INTERVAL_MS = 24 * 60 * 60 * 1e3;
var EXTENSION_ROOT = path.resolve(__dirname, "../../");
var DISCOVERY_PATH = path.join(EXTENSION_ROOT, "skills/gemini-cli-expert/references/discovery.json");
async function main() {
  const inputData = fs.readFileSync(0, "utf-8");
  const input = JSON.parse(inputData);
  const toolInput = input.tool_input || {};
  if (toolInput.name !== "gemini-cli-expert") {
    console.log(JSON.stringify({ decision: "allow" }));
    return;
  }
  try {
    const discovery = loadDiscovery();
    const lastChecked = discovery.metadata.last_checked ? new Date(discovery.metadata.last_checked).getTime() : 0;
    const now = Date.now();
    if (now - lastChecked > CHECK_INTERVAL_MS) {
      const remoteCommit = await fetchLatestCommit();
      if (remoteCommit) {
        const localHash = discovery.metadata.commit_hash;
        if (localHash && remoteCommit.sha !== localHash) {
          const message = `[gemini-cli-expert] Documentation update detected.
Remote: ${remoteCommit.sha.substring(0, 7)} (${remoteCommit.date})
Local:  ${localHash.substring(0, 7)}`;
          updateDiscoveryMetadata(discovery, { last_checked: (/* @__PURE__ */ new Date()).toISOString() });
          console.log(JSON.stringify({
            decision: "allow",
            systemMessage: message
          }));
          return;
        } else {
          const updates = { last_checked: (/* @__PURE__ */ new Date()).toISOString() };
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
  console.log(JSON.stringify({ decision: "allow" }));
}
function loadDiscovery() {
  if (fs.existsSync(DISCOVERY_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(DISCOVERY_PATH, "utf-8"));
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
      headers: { "User-Agent": "Gemini-CLI-Extension" }
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
main().catch((err) => {
  console.error(err);
  console.log(JSON.stringify({ decision: "allow" }));
});
