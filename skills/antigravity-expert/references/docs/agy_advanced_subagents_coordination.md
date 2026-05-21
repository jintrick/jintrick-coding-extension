# Antigravity Subagents & Multi-Agent Coordination

Subagents parallelize complex tasks (e.g., running tests, codebase searches) and preserve the main agent's context window by offloading work to dedicated sessions.

## Invoking Subagents
The parent agent uses the `invoke_subagent` tool.
- **Workspace**: Can inherit the parent's workspace or create an isolated Git worktree.
- **Context Isolation**: Uses the same model but starts with a clean context slate (no inherited history).
- **Execution**: Starts immediately. Multiple subagents can be invoked at any time.

## Subagent Lifecycle States
1. **Running**: Actively executing. Can be canceled via UI, interrupted by parent, or killed.
2. **Idle**: Task completed, results sent. Can be re-awoken by receiving a message from any agent. Retains prior context.
3. **Killed**: Permanently terminated. Temporary Git worktrees are cleaned up. Transcripts remain visible.

## Inter-Agent Communication
Agents communicate via unique IDs.
- **Routing**: Agents can message parents, subagents, or any active agent with a known ID.
- **Auto-Wake**: Receiving a message automatically re-awakens an Idle agent.
- **Shared Transcripts**: Agents can view each other's transcripts.

## Built-In vs. Custom Subagents
### Built-In
- `research`: Codebase research and navigation.
- `browser`: Sandboxed web automation (invoked exclusively via `/browser`).
- `self`: Clone of the calling agent (same system prompt and toolsets).

### Custom
Agents can use the `define_subagent` tool to create custom personas dynamically with specific prompts and tool capabilities (read, write, terminal, delegation).

## Limits & Security
- **Nesting Limit**: Strictly enforced maximum depth of **10 levels**.
- **Inherited Permissions**: Subagents inherit the parent's terminal and file scopes. They cannot bypass user-defined parent limits.
- **Approval Bubbling**: Tool calls requiring user confirmation bubble up to the subagent panel UI.

## Multi-Agent Teamwork
- **`/teamwork-preview`**: An exclusive feature for the **Ultra Plan**, triggering advanced orchestration with built-in error recovery and coordination logic for highly complex goals.
