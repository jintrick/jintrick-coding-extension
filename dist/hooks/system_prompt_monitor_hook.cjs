// hooks/scripts/system_prompt_monitor_hook.cjs
var fs = require("fs");
var path = require("path");
var { execSync } = require("child_process");
async function main() {
  const inputData = fs.readFileSync(0, "utf-8");
  const input = JSON.parse(inputData);
  const eventName = input.hook_event_name;
  if (eventName !== "SessionStart") {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }
  try {
    const version = execSync("gemini --version").toString().trim();
    const vDir = `v${version}`;
    const extensionRoot = path.resolve(__dirname, "../../");
    const targetDir = path.join(extensionRoot, "skills/gemini-cli-expert/references/system_prompts", vDir);
    const originalPath = path.join(targetDir, "original.md");
    if (fs.existsSync(originalPath)) {
      process.stdout.write(JSON.stringify({
        decision: "allow"
      }));
      return;
    }
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const npmGlobalRoot = execSync("npm root -g").toString().trim();
    const snippetsPath = path.join(
      npmGlobalRoot,
      "@google/gemini-cli/node_modules/@google/gemini-cli-core/dist/src/prompts/snippets.js"
    ).replace(/\\/g, "/");
    if (!fs.existsSync(snippetsPath)) {
      console.error(`[system-prompt-monitor] snippets.js not found at: ${snippetsPath}`);
      process.stdout.write(JSON.stringify({ decision: "allow" }));
      return;
    }
    const snippets = await import(`file://${snippetsPath}`);
    const options = {
      preamble: { interactive: true },
      coreMandates: { contextFilenames: ["GEMINI.md"] },
      subAgents: [
        { name: "codebase_investigator", description: "The specialized tool for codebase analysis..." },
        { name: "cli_help", description: "Specialized in answering questions..." }
      ],
      agentSkills: [
        { name: "skill-creator", description: "Guide for creating effective skills.", location: "/path/to/skill" }
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
    const rawPrompt = snippets.getCoreSystemPrompt(options);
    const rawPath = path.join(targetDir, "system-prompt-raw.md");
    fs.writeFileSync(rawPath, rawPrompt);
    let content = rawPrompt;
    content = content.replace(/(<available_subagents>)[\s\S]*?(<\/available_subagents>)/g, "$1\n${SubAgents}\n$2");
    content = content.replace(/(<available_skills>)[\s\S]*?(<\/available_skills>)/g, "$1\n${AgentSkills}\n$2");
    content = content.replace(/# Contextual Instructions \(GEMINI\.md\)[\s\S]*?<\/loaded_context>/g, "");
    content = content.replace(/\n{3,}/g, "\n\n");
    fs.writeFileSync(originalPath, content.trim() + "\n");
    process.stdout.write(JSON.stringify({
      decision: "allow",
      systemMessage: `[system-prompt-monitor] New Gemini CLI version (${version}) detected. System prompt archived to skills/gemini-cli-expert/references/system_prompts/${vDir}/original.md`
    }));
  } catch (err) {
    console.error(`[system-prompt-monitor] Error: ${err.message}`);
    process.stdout.write(JSON.stringify({ decision: "allow" }));
  }
}
main().catch((err) => {
  console.error(`[system-prompt-monitor] Fatal error: ${err.stack}`);
  process.stdout.write(JSON.stringify({ decision: "allow" }));
});
