# Gemini CLI

The [Gemini command line interface (CLI)](https://github.com/google-gemini/gemini-cli) is an open source
AI agent that provides access to Gemini directly in your terminal. The
Gemini CLI uses a reason and act (ReAct) loop with your built-in tools
and local or remote MCP servers to complete complex use cases like fixing bugs,
creating new features, and improving test coverage. While the Gemini
CLI excels at coding, it's also a versatile local utility that you can use for
a wide range of tasks, from content generation and problem solving to deep
research and task management.

Gemini Code Assist for individuals, Standard, and Enterprise each
[provide quotas](https://developers.google.com/gemini-code-assist/resources/quotas) for using the Gemini CLI. Note that these
quotas are shared between Gemini CLI and Gemini Code Assist
agent mode.

The Gemini CLI is available without additional setup in
[Cloud Shell](https://cloud.google.com/shell/docs/use-cloud-shell-terminal). To get
started with Gemini CLI in other environments, see the
[Gemini CLI documentation](https://github.com/google-gemini/gemini-cli).

## Gemini Code Assist agent mode

[Gemini Code Assist agent mode](https://developers.google.com/gemini-code-assist/docs/use-agentic-chat-pair-programmer) in VS Code is powered by
Gemini CLI. A subset of Gemini CLI functionality is
available directly in the Gemini Code Assist chat within your IDE.

The following Gemini CLI features are available in
Gemini Code Assist for VS Code.

* [Model Context Protocol (MCP) servers](https://developers.google.com/gemini-code-assist/docs/use-agentic-chat-pair-programmer#configure-mcp-servers)
* Gemini CLI [commands](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/commands.md): `/memory`, `/stats`, `/tools`,
  `/mcp`
* [Yolo mode](https://developers.google.com/gemini-code-assist/docs/use-agentic-chat-pair-programmer#yolo-mode)
* built-in tools like grep, terminal, file read or file write
* Web search
* Web fetch