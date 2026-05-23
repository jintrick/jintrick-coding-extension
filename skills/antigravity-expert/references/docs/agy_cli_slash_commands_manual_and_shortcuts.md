# Antigravity CLI Slash Commands

Antigravity CLI supports slash commands typed directly into the prompt box to manage conversations, settings, and agent capabilities.

## Core Slash Commands

| Command | Category | Purpose |
| :--- | :--- | :--- |
| `/resume` (alias `/switch`) | Conversation | Open the conversation picker to resume or switch sessions. |
| `/rewind` (alias `/undo`) | Conversation | Roll back conversation history to a previous checkpoint. |
| `/rename <name>` | Conversation | Rename the active conversation thread for easier tracking. |
| `/fork` | Conversation | Branches the current conversation from an earlier point into a new workspace. |
| `/clear` | Conversation | Clears the prompt and starts a fresh conversation session. |
| `/permissions` | Configuration | Select agent autonomy level (`request-review`, `always-proceed`, or `strict`). |
| `/model` | Configuration | Select the default reasoning model (persists across sessions). |
| `/keybindings` | Configuration | Open the interactive keyboard shortcut editor. |
| `/config` (alias `/settings`) | Configuration | Opens the full-screen overlay menu for all options. |
| `/tasks` | Tools & Monitoring | Monitor, view logs for, or terminate active background tasks. |
| `/hooks` | Tools & Monitoring | List, enable/disable, or view logs for active event hooks. |
| `/skills` | Tools & Monitoring | Browse local and global encapsulated agent workflows. |
| `/mcp` | Tools & Monitoring | Open the panel to configure and manage Model Context Protocol servers. |
| `/open <path>` | Utility | Immediately open a file in your preferred external editor. |
| `/usage` (alias `?`) | Utility | Open the inline interactive help manual inside the terminal. |
| `/logout` | Account | Log out of your Google session and clear cached credentials. |

## Advanced & Specialized Commands

- **/goal**: Executes the agent until the specified task is completely finished, without asking for intermediate user input (Autonomous Mode).
- **/grill-me**: Forces the agent to ask clarifying questions before implementation to align on the details of a plan.
- **/schedule**: Schedule an instruction for a future time or recurring Cron-based execution.
- **/browser**: Explicitly triggers browser-based tool usage. Requires Google Chrome and user permission for remote debugging.
- **/teamwork-preview**: (Ultra Plan Only) Launches advanced multi-agent orchestration for extremely complex goals.
