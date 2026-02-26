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
  const toolName = input.tool_name;
  const toolInput = input.tool_input || {};
  if (toolName !== "activate_skill" || toolInput.name !== "gemini-cli-expert") {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
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
          const message = `[gemini-cli-expert] Upstream documentation update detected!
Remote: ${remoteCommit.sha.substring(0, 7)} (${remoteCommit.date})
Local:  ${localHash.substring(0, 7)}

Please update local documentation via maintenance tools.`;
          const agentReason = `The documentation for gemini-cli-expert has been updated upstream. I have blocked this tool execution once to notify the user. 
If the user wants to continue using the current local documentation anyway, please tell them to "Try activating the skill again". 
The second attempt will succeed because I only check for updates once every 24 hours.`;
          updateDiscoveryMetadata(discovery, { last_checked: (/* @__PURE__ */ new Date()).toISOString() });
          process.stdout.write(JSON.stringify({
            decision: "deny",
            reason: agentReason,
            systemMessage: message
          }));
          return;
        } else {
          const updates = { last_checked: (/* @__PURE__ */ new Date()).toISOString() };
          if (!localHash) updates.commit_hash = remoteCommit.sha;
          updateDiscoveryMetadata(discovery, updates);
        }
      }
    }
  } catch (error) {
    process.stderr.write(`[expert-docs-hook] Check failed: ${error.message}
`);
  }
  process.stdout.write(JSON.stringify({ decision: "allow" }));
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
    process.stderr.write(`Failed to update discovery.json: ${e.message}
`);
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
      return { sha: data[0].sha, date: data[0].commit.committer.date };
    }
    return null;
  } catch (error) {
    return null;
  }
}
main().catch((err) => {
  process.stdout.write(JSON.stringify({ decision: "allow" }));
});
