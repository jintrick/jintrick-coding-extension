# Configure Gemini Code Assist tools

This document describes how to configure Gemini Code Assist tools for
use in your IDE.

To learn more about Gemini Code Assist tools and view all available
tools, read the [Gemini Code Assist tools overview](https://developers.google.com/gemini-code-assist/docs/tools-agents/tools-overview).

## Before you begin

[Set up Gemini Code Assist for individuals](https://developers.google.com/gemini-code-assist/docs/set-up-gemini).

### Dependencies

Some tools have dependencies you must install or enable before use. Some
examples of dependencies that might be required are:

* An extension might need to be installed in your IDE.
* An account or project might need to be created for a service.

You will be prompted to take the required actions the first time you prompt a
tool in the Gemini Code Assist chat.

1. In your IDE, navigate to the Gemini Code Assist chat and prompt
   the tool you want to use by using the `@` symbol followed by the name of
   the tool.

   For example, the following prompt is sent to the Google Docs tool:

   ```
   @GoogleDocs get my docs

   ```

   The tool will provide the next steps required to configure the tool and
   connect your Google Account with the tool service.
2. Follow the provided instructions to authenticate to the tool service and
   connect your accounts.
3. Once you have successfully authenticated and connected your account, send
   another prompt to the tool.

   Some tools will suggest common prompts once you type in the tool name.

For a list of tools and some suggested prompts, see
[available tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/tools-overview#available-tools).

To remove authorization from a tool in your IDE, complete the following steps:

1. Navigate to the Gemini Code Assist **Agents & Tools** page.

   [Go to Agents & Tools](https://codeassist.google.com/agents-tools)
2. Locate the tool card for the tool you want to remove authorization from and
   then click **Edit**. The tool details page opens.
3. Click **Disable**.

   The tool is no longer authorized to access its service from your IDE.

## What's next

* Try out the GitHub or GitLab tool by following the instructions in
  [Get started with Gemini Code Assist tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/get-started-with-tools).