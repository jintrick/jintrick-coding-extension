# Gemini Code Assist tools overview

This document describes Gemini Code Assist tools for developers. Tools
let developers connect to external services without leaving the IDE in order to
get tasks, summarize design documents and more. Tools are available in
Gemini Code Assist for individuals, which is available at no cost, and
the Gemini Code Assist Standard and Enterprise editions.

You can send prompts to specific tools in the Gemini Code Assist chat
in your IDE by starting your prompt with `@TOOL_NAME`. To try out tools in your
IDE, follow the instructions in the following resources:

* Gemini Code Assist for individuals:
  [Get started with tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/get-started-with-tools)
* Gemini Code Assist Standard and Enterprise Editions:
  [Get started with tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/get-started-with-tools-standard-enterprise)

## Limitations

Gemini Code Assist tools have the following limitations:

* Tools are only available in VS Code and JetBrains IDEs.
* Tools can't perform operations that create, edit, or delete a resource
  in an external service.
* Each tool supports a limited number of use-cases and might give errors
  outside of the recommended use-cases.
* The tool operator (`@`) followed by the tool name must be at the
  beginning of your prompt.

The following table lists available Gemini Code Assist tools.

| Product or service | Available in Gemini Code Assist editions | Example prompt | Service documentation |
| --- | --- | --- | --- |
| [Apigee](https://cloud.google.com/apigee) | Enterprise | `@Apigee create an API to manage users` | [Tutorial: Use Gemini Code Assist to design, develop, and test APIs in Apigee](https://cloud.google.com/apigee/docs/api-platform/local-development/vscode/tutorial-gemini) |
| [Atlassian Rovo](https://github.com/marketplace/atlassian) | All editions | `@AtlassianRovo get tasks assigned to me` | [Atlassian Rovo for Google Gemini Code Assist](https://rovo-for-gemini.atlassian.net/wiki/external/MWViM2ZlYjQwNWJjNGJiZmIyODdiY2Y5NjAyOGNhZTM) |
| [GitHub](https://github.com/) | All editions | `@GitHub list issues assigned to me` | * [GitHub Docs](https://docs.github.com/) * [Use the GitHub Gemini Code Assist for tool to view issues and pull requests for individuals](https://developers.google.com/gemini-code-assist/docs/tools-agents/get-started-with-tools#use-github-tool) * [Use the GitHub Gemini Code Assist tool to view issues and pull requests Standard and Enterprise Editions](https://developers.google.com/gemini-code-assist/docs/tools-agents/get-started-with-tools-standard-enterprise#use-github-tool) |
| [GitLab](https://about.gitlab.com/) | All editions | `@GitLab list open pull requests assigned to me` | * [GitLab Docs](https://docs.gitlab.com//) * [Use the GitLab tool to get details on pull requests and issues for individuals](https://developers.google.com/gemini-code-assist/docs/tools-agents/get-started-with-tools#use-gitlab-tool) * [Use the GitLab tool to get details on pull requests and issues Standard and Enterprise Editions](https://developers.google.com/gemini-code-assist/docs/tools-agents/get-started-with-tools-standard-enterprise#use-gitlab-tool) |
| [Google Databases](https://cloud.google.com/products/databases) | Standard and Enterprise | `@GoogleDatabases add a function to get customers by ID in @File` | * MySQL: [Generate database-aware code with Google Databases Gemini Code Assist tool](https://cloud.google.com/sql/docs/mysql/generate-functions-with-googledatabases-gemini-tool) * PostgreSQL: [Generate database-aware code with Google Databases Gemini Code Assist tool](https://cloud.google.com/sql/docs/postgres/generate-functions-with-googledatabases-gemini-tool) * SQL Server: [Generate database-aware code with Google Databases Gemini Code Assist tool](https://cloud.google.com/sql/docs/sqlserver/generate-functions-with-googledatabases-gemini-tool) |
| [Google Docs](https://workspace.google.com/products/docs/) | All editions | `@GoogleDocs list my docs` | [Read documents while coding with Gemini Code Assist](https://developers.google.com/workspace/docs/api/how-tos/read-docs-gemini-tool) |
| [MongoDB](https://www.mongodb.com/) | All editions | `@MongoDB how can I optimize my query?` | [MongoDB Documentation](https://www.mongodb.com/docs/) |
| [Neo4j](https://neo4j.com/) | All editions | `@neo4j How do I configure the Java driver?` | [Neo4j Documentation](https://neo4j.com/docs/) |
| [New Relic](https://newrelic.com/) | All editions | `@NewRelic how do I install the python agent?` | [New Relic agent for Google Gemini Code Assist](https://docs.newrelic.com/docs/agentic-ai/agentic-integration/gemini-integration/) |
| [Redis](https://redis.io/) | All editions | `@Redis what is Redis Cloud?` | [Redis Docs](https://redis.io/docs/latest/) |
| [Sentry](http://sentry.io/welcome/) | All editions | `@Sentry list issues in project my-project` | [Sentry.io Docs](https://docs.sentry.io/) |
| [Snyk](https://snyk.io/) | All editions | `@Snyk scan for issues` | [Snyk User Docs](https://docs.snyk.io/) |

Each tool has its own private chat history and context. When you use a tool,
your prompts and the tool's responses are only used when interacting with that
tool—other tools can't access this information.

Keeping chat history and retrieved data from each tool separate ensures that
only the tool you're using has access to its data. To learn more about what
API calls a specific tool can make on your behalf, see
[Gemini Code Assist tools permissions](https://developers.google.com/gemini-code-assist/docs/tools-agents/tools-permissions).

For more information on how
Gemini Code Assist handles your data, see
[How Gemini Code Assist uses your data](https://developers.google.com/gemini-code-assist/docs/data-governance).

## Authentication

Gemini Code Assist tools require you to:

* Authenticate to Google Cloud to verify your identity and access privileges.
* Authenticate to the Google or third-party service or API you're
  accessing with each tool.

For more information on security and privacy, see the
[Gemini Code Assist Security and privacy overview](https://developers.google.com/gemini-code-assist/resources/privacy-notices).

## What's next

* [Configure Gemini Code Assist for individuals tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/configure-tools)
  in your IDE.
* [Get started with Gemini Code Assist for individuals tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/get-started-with-tools).
* [Configure Gemini Code Assist Standard or Enterprise Edition tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/configure-tools-standard-enterprise)
  in your IDE.
* [Get started with Gemini Code Assist Standard or Enterprise Edition tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/get-started-with-tools-standard-enterprise).