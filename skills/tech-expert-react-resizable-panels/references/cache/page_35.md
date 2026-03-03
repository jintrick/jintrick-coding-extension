# Use agentic chat as a pair programmer

This document describes how to configure and use Gemini Code Assist
agent mode as a pair programmer in your integrated development environment
(IDE).

With agent mode, you can do any of the following and more:

* Ask questions about your code.
* Use context and built-in tools to improve generated content.
* Configure MCP servers to extend the agent's abilities.
* Get solutions to complex tasks with multiple steps.
* Generate code from design documents, issues, and `TODO` comments.
* Control the agent behavior by commenting on, editing, and approving plans
  and tool use during execution.

## Limitations

Some features of [standard Gemini Code Assist chat](https://developers.google.com/gemini-code-assist/docs/chat-overview)
might not be available in agent mode or might work differently than they do in
standard chat.

Recitation is not available in agent mode. While in agent mode, Gemini
doesn't [cite sources](https://developers.google.com/gemini/docs/discover/works#how-when-gemini-cites-sources) and you can't
[disable code suggestions that match cited sources](https://developers.google.com/gemini-code-assist/docs/write-code-gemini#disable_code_suggestions_that_match_cited_sources).

## Before you begin

### VS Code

1. Set up the edition of Gemini Code Assist you want to use in your IDE:
   * [Gemini Code Assist for individuals](https://developers.google.com/gemini-code-assist/docs/set-up-gemini)
   * [Gemini Code Assist Standard or Enterprise](https://developers.google.com/gemini-code-assist/docs/set-up-gemini-standard-enterprise)

### IntelliJ

Set up the edition of Gemini Code Assist you want to use in your
IDE:

* [Gemini Code Assist for individuals](https://developers.google.com/gemini-code-assist/docs/set-up-gemini)
* [Gemini Code Assist Standard or Enterprise](https://developers.google.com/gemini-code-assist/docs/set-up-gemini-standard-enterprise)

## Use agent mode

In agent mode, you can ask Gemini to complete high-level goals and
complex tasks.

To get the most out of agent mode, follow
[prompting best practices](https://cloud.google.com/gemini/docs/discover/write-prompts) and provide as much detail as
possible.

To switch to agent mode:

### VS Code

1. To open the Gemini Code Assist chat, in the activity bar of your
   IDE, click spark
   **Gemini Code Assist**.
2. Click the **Agent** toggle to enter agent mode. The toggle is highlighted
   when toggled to agent mode and grey when in regular chat.
3. In the Gemini Code Assist chat, enter your prompt.

Gemini gives you a response to your prompt, or requests permission
to use a tool.

To stop the agent, click **Stop**.

To use the standard Gemini Code Assist chat, click
**New chat** to create a new
chat.

Gemini Code Assist agent mode is powered by the
[Gemini CLI](https://developers.google.com/gemini-code-assist/docs/gemini-cli).

### IntelliJ

1. Click spark **Gemini**
   in the tool window bar. Sign in if prompted to do so.
2. Select the **Agent** tab.
3. Describe the task you want the agent to perform.
4. As the agent goes through the steps to accomplish the task, you'll have the
   option to review and approve any changes.
5. Optional: To automatically approve changes, select
   settings **Agent options** and
   click the checkbox next to **Auto-approve changes**.

*Tools* are a broad category of services that an agent can use for context and
actions in its response to your prompt. Some example tools are built-in tools
like grep and file read or write, local or remote Model Context Protocol (MCP)
servers and their executable functions, or bespoke service implementations.

### Control built-in tool use

Agent mode has access to your built-in tools like file search, file read, file
write, terminal commands, and more.

### VS Code

You can use the `coreTools` and `excludeTools` settings to control which tools
Gemini has access to in agent mode.

`coreTools`
:   Lets you specify a list of tools that you want to be available to
    the model. You can also specify command-specific restrictions for tools that
    support it. For example—adding the following to your
    Gemini settings JSON will only allow the shell `ls -l` command to
    be executed:`"coreTools": ["ShellTool(ls -l)"]`.

`excludeTools`
:   Lets you specify a list of tools that you don't want to be available to the
    model. You can also specify command-specific restrictions for tools that
    support it. For example—adding the following to your Gemini
    settings JSON will block the use of the `rm -rf` command:
    `"excludeTools": ["ShellTool(rm -rf)"]`.

A tool listed in both `excludeTools` and `coreTools` is excluded.

To configure the built-in tools available in agent mode, do the following:

1. Open your Gemini settings JSON located in
   `~/.gemini/settings.json` where `~` is your home directory.
2. To restrict agent tool use to a list of approved tools, add the
   following line to your Gemini settings JSON:

   ```
   "coreTools": ["TOOL_NAME_1,TOOL_NAME_2"]

   ```

   Replace `TOOL_NAME_1` and
   `TOOL_NAME_2` with the names of the
   [built-in tools](https://github.com/google-gemini/gemini-cli/blob/main/docs/core/tools-api.md#built-in-tools) you want the
   agent to have access to.

   You can list as many built-in tools as you want.
   By default all built-in tools are available to the agent.
3. To restrict agent tool use to specific tool commands, add the
   following line to your Gemini settings JSON:

   ```
   "coreTools": ["TOOL_NAME(COMMAND)"]

   ```

   Replace the following:

   * `TOOL_NAME`: the name of the built-in tool
   * `COMMAND`: the name of the built-in tool command
     you want the agent to be able to use.
4. To exclude a tool from agent use, add the following line to your
   Gemini settings JSON:

   ```
   "excludeTools": ["TOOL_NAME_1,TOOL_NAME_2"]

   ```

   Replace `TOOL_NAME_1` and
   `TOOL_NAME_2` with the names of the
   [built-in tools](https://github.com/google-gemini/gemini-cli/blob/main/docs/core/tools-api.md#built-in-tools) you want to exclude from agent use.
5. To exclude a tool command from agent use, add the following line to your
   Gemini settings JSON:

   ```
   "excludeTools": ["TOOL_NAME(COMMAND)"]

   ```

   Replace the following:

   * `TOOL_NAME`: the name of the built-in tool
   * `COMMAND`: the name of the built-in tool command
     you want to exclude from agent use.

For more information about the `coreTools` and `excludeTools` configuration
settings, see the
[Gemini CLI configuration documentation](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/configuration.md).

### IntelliJ

This feature isn't supported in Gemini Code Assist for IntelliJ or
other JetBrains IDEs.

### Configure MCP servers

### VS Code

To make MCP servers available for use in agent mode, add the configuration for
each server in your Gemini settings JSON file, according each
server's documentation.

1. Install any dependencies required by the MCP servers you are adding.
2. Open your Gemini settings JSON file, located at
   `~/.gemini/settings.json` where `~` is your home directory.
3. Configure each local or remote MCP server in the Gemini settings
   JSON file, according to each server's instructions.

   The following example Gemini settings JSON file configures two
   remote Cloudflare MCP servers, a remote GitLab MCP server, and a local
   GitHub MCP server for use with Gemini Code Assist in VS Code.

   ```
   {
     "mcpServers": {
       "github": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-github"],
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_example_personal_access_token12345"
         }
       },
       "gitlab": {
         "command": "npx",
         "args": ["mcp-remote", "https://your-gitlab-instance.com/api/v4/mcp"]
       },
       "cloudflare-observability": {
         "command": "npx",
         "args": ["mcp-remote", "https://observability.mcp.cloudflare.com/sse"]
       },
       "cloudflare-bindings": {
         "command": "npx",
         "args": ["mcp-remote", "https://bindings.mcp.cloudflare.com/sse"]
       }
     }
   }

   ```
4. Open the command palette and select **Developer: Reload Window**.

Your configured MCP servers are available for the agent to use in agent mode.

### IntelliJ

To make MCP servers available for use in agent mode, add the configuration for
each server in a `mcp.json` file and place the `mcp.json` file in the
[configuration directory](https://intellij-support.jetbrains.com/hc/en-us/articles/206544519-Directories-used-by-the-IDE-to-store-settings-caches-plugins-and-logs) for your IDE.

1. Install any dependencies required by the MCP servers you are adding.
2. Create a file named `mcp.json` in your IDE's
   [configuration directory](https://intellij-support.jetbrains.com/hc/en-us/articles/206544519-Directories-used-by-the-IDE-to-store-settings-caches-plugins-and-logs).
3. Configure each local or remote MCP server in the `mcp.json` file,
   according to each server's instructions.

   The following example `mcp.json` file configures two remote Cloudflare MCP
   servers, a remote GitLab MCP server, and a local GitHub MCP server for use
   with Gemini Code Assist in IntelliJ.

   ```
   {
     "mcpServers": {
       "github": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-github"],
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_example_personal_access_token12345"
         }
       },
       "gitlab": {
         "command": "npx",
         "args": ["mcp-remote", "https://your-gitlab-instance.com/api/v4/mcp"]
       },
       "cloudflare-observability": {
         "command": "npx",
         "args": ["mcp-remote", "https://observability.mcp.cloudflare.com/sse"]
       },
       "cloudflare-bindings": {
         "command": "npx",
         "args": ["mcp-remote", "https://bindings.mcp.cloudflare.com/sse"]
       }
     }
   }

   ```

Your configured MCP servers are available for the agent to use in agent mode.

#### MCP server authentication

Some MCP servers require authentication. Follow the server documentation to
create any required user tokens, and then specify them appropriately. Typically,
you specify authentication tokens for local servers using the appropriate
server-specific environment variable, and you specify authentication tokens for
remote servers using the HTTP `Authorization` header.

### VS Code

For MCP servers that require authentication, you can add them to your
Gemini settings JSON.

The following example shows how to specify a personal access token for the
GitHub local and remote MCP servers:

```
{
  "mcpServers": {
    "github-remote": {
      "httpUrl": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ACCESS_TOKEN"
      }
    },
    "github-local": {
      "command": "/Users/username/code/github-mcp-server/cmd/github-mcp-server/github-mcp-server",
      "args": ["stdio"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ACCESS_TOKEN"
      }
    }
  }
}

```

Where `ACCESS_TOKEN` is the user's access token.

### IntelliJ

For MCP servers that require authentication, you can add them to your
`mcp.json` file.

The following example adds a personal access token for the GitHub local server:

```
{
  "mcpServers": {
    "github-local": {
      "command": "/Users/username/code/github-mcp-server/cmd/github-mcp-server/github-mcp-server",
      "args": ["stdio"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ACCESS_TOKEN"
      }
    }
  }
}

```

Where `ACCESS_TOKEN` is the user's access token.

### Create a context file

Context allows an agent to generate better responses for a given prompt. Context
can be taken from files in your IDE, files in your local system folders, tool
responses, and your prompt details. For more information, see
[Agent mode context](https://developers.google.com/gemini-code-assist/docs/agent-mode#agent-mode-context).

### VS Code

1. Create a file named `GEMINI.md` in a location that matches the scope you
   want the context to apply to. The following table details the locations for
   context files for different scopes:

   | Scope | Location |
   | --- | --- |
   | All your projects | `~/.gemini/GEMINI.md` |
   | A specific project | Your working directory or any parent directories up to either your project root (identified by a `.git` folder) or your home directory. |
   | A specific component, module, or sub-section of a project | Subdirectories of your working directory. |

   The agent's memory system is created by loading context files from
   multiple locations. Context from more specific files, like those for
   specific components or modules, overrides or supplements content from
   more general context files like the global context file at
   `~/.gemini/GEMINI.md`.
2. Write any rules, style guide information, or context that you want the
   agent to use in Markdown and save the file. For more information, see
   the [example context file on GitHub](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/configuration.md#example-context-file-content-eg-geminimd).

The agent includes the information in your context file along with any prompts
you send to it.

### IntelliJ

1. Create a file named either `GEMINI.md` or `AGENT.md` at the root of your
   project.
2. Write any rules, style guide information, or context that you want the
   agent to use in Markdown and save the file.

The agent includes the information in your context file along with any prompts
you send to it. You can also add context by including a file manually with the
`@``FILENAME` syntax where
`FILENAME` is the name of the file with contextual
information you want to include.

## Use commands

Slash `/` commands let you quickly run commands similar to commands in a
terminal window.

### VS Code

You can use the following built-in Gemini CLI commands in agent
mode:

* `/tools`: Displays a list of tools that are available in your agent mode
  session.
* `/mcp`: Lists configured Model Context Protocol (MCP) servers, their
  connection status, server details, and available tools.

For more information on Gemini CLI commands, see
[Gemini CLI Commands](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/commands.md) and
[Gemini custom commands](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/commands.md#custom-commands). Note that not
all Gemini CLI commands are available in agent mode.

### IntelliJ

This feature isn't supported in Gemini Code Assist for IntelliJ or
other JetBrains IDEs.

## Always allow agent actions

You can automatically allow all agent actions.

To automatically allow all agent actions:

### VS Code

Use yolo mode to automatically allow all agent actions. Yolo mode can only be
used in a [trusted workspace](https://code.visualstudio.com/api/extension-guides/workspace-trust).

To configure yolo mode:

1. Open your VS Code user settings JSON file:

   1. Open the **Command palette** (`ctrl`/`command` + `Shift` + `P`).
   2. Select **Preferences: Open User Settings (JSON)**.
2. Add the following to your VS Code user settings JSON file:

   ```
   //other settings...

   "geminicodeassist.agentYoloMode": true,
   //other settings...

   ```
3. Open the command palette and select **Developer: Reload Window**.

Agent mode uses yolo mode, and won't ask for permission before taking actions
when you send it a prompt. When using a
[restricted workspace](https://code.visualstudio.com/docs/editing/workspaces/workspace-trust#_restricted-mode) the agent will prompt before
taking actions regardless of this setting.

### IntelliJ

To automatically approve changes, in the Gemini chat agent tab,
select settings **Agent options** and then
click the checkbox next to **Auto-approve changes**.

Agent mode automatically approves all requests, and won't ask for permission
before taking actions when you send it a prompt.

## Additional prompts

Try out the following prompts with your own information:

* "What does this repository do? Help me understand the architecture."
* "What does this [class/function] do?"
* "Add a feature to this codebase - "[link-or-path-to-codebase]"."
* "Refactor function [A] and [B] to use the common method [C]."
* "Fix the GitHub issue [link-to-github-issue]."
* "Build an application to do [goal] with a UI that lets the user do [task] in
  the [environment]."
* "Migrate library versions in this repository from [X] to [Y]."
* "Optimize performance of this Go code so that it runs faster."
* "Use [name-of-API] to build out this feature."
* "Implement an algorithm to do [x], [Y], and [Z]."

## What's next

* Read the [Gemini Code Assist overview](https://developers.google.com/gemini-code-assist/docs/overview).
* Explore some [example MCP servers](https://modelcontextprotocol.io/examples).
* Find more [MCP servers on GitHub](https://github.com/modelcontextprotocol/servers).
* [Send feedback from your IDE](https://developers.google.com/gemini-code-assist/docs/write-code-gemini#leave_feedback).