# Antigravity CLI Slash Commands

Antigravity CLI supports slash commands typed directly into the prompt box to manage conversations, settings, and agent capabilities.

## Core Slash Commands

| Command | Category | Purpose |
| :--- | :--- | :--- |
| `/resume` (alias `/switch`) | Conversation | Open the conversation picker to resume or switch sessions. |
| `/rewind` (alias `/undo`) | Conversation | Roll back conversation history to a previous checkpoint. |
| `/rename <name>` | Conversation | Rename the active conversation thread for easier tracking. |
| `/permissions` | Configuration | Select agent autonomy level (`request-review`, `always-proceed`, or `strict`). |
| `/model` | Configuration | Select the default reasoning model (persists across sessions). |
| `/keybindings` | Configuration | Open the interactive keyboard shortcut editor. |
| `/statusline` | Configuration | Customize real-time indicators displayed in the CLI status bar. |
| `/tasks` | Tools & Monitoring | Monitor, view logs for, or terminate active background tasks. |
| `/skills` | Tools & Monitoring | Browse local and global encapsulated agent workflows. |
| `/mcp` | Tools & Monitoring | Open the panel to configure and manage Model Context Protocol servers. |
| `/open <path>` | Utility | Immediately open a file in your preferred external editor. |
| `/usage` | Utility | Open the inline interactive help manual inside the terminal. |
| `/logout` | Account | Log out of your Google session and clear cached credentials. |

## Advanced Commands
- `/config` or `/settings`: Opens the full-screen overlay menu for all options.
- `/fork`: Branches the current conversation from an earlier point into a new workspace.
- `/clear`: Clears the prompt and starts a fresh conversation session.
- `?`: Quick alias to trigger help and list commands.
