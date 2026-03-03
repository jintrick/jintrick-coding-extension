# Configure Gemini Code Assist tools

This document describes how to configure Gemini Code Assist tools for
use in your IDE.

To learn more about Gemini Code Assist tools and view all available
tools, read the [Gemini Code Assist tools overview](https://developers.google.com/gemini-code-assist/docs/tools-agents/tools-overview).

## Before you begin

1. Ask your administrator to do the following:

   1. [Set up Gemini Code Assist Standard and Enterprise](https://developers.google.com/gemini-code-assist/docs/set-up-gemini-standard-enterprise).
   2. [Enable Gemini Code Assist tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/enable-tools-standard-enterprise).
2. [Install the Gemini Code Assist plugin in your IDE](https://developers.google.com/gemini-code-assist/docs/set-up-gemini-standard-enterprise#use-ide).

### Required roles

To get the permissions that you need to use Gemini Code Assist tools,
ask your administrator to grant you the following IAM roles on
the Google Cloud project:

* [Gemini Code Assist Tools User](https://cloud.google.com/iam/docs/roles-permissions/cloudaicompanion#cloudaicompanion.codeToolsUser) (`roles/cloudaicompanion.codeToolsUser`)

For more information about granting roles, see
[Manage access to projects, folders, and organizations](https://cloud.google.com/iam/docs/granting-changing-revoking-access).

You might also be able to get the required permissions through
[custom roles](https://cloud.google.com/iam/docs/creating-custom-roles) or
other [predefined roles](https://cloud.google.com/iam/docs/understanding-roles).

Individual tools might require additional Google Cloud or third-party roles and
permissions to use, or for specific use cases. If you encounter permissions
errors, check with your administrator to make sure you have the correct roles
and permissions.

### Dependencies

Some tools have dependencies you must install or enable before use. Some
examples of dependencies that might be required are:

* An extension might need to be installed in your IDE.
* A product or service might need to be enabled in your Google Cloud project.
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

   You are prompted to connect the tool.
2. Click the link to connect the tool. The Gemini Code Assist
   **Agents & Tools** page opens.
3. Locate the tool that you want to use and then click
   **Connect your account**. The tool details page opens.
4. In the tool details page, click **Connect** and then follow the instructions
   to authenticate to the tool service and connect your account.

For a list of tools and some suggested prompts, see
[available tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/tools-overview#available-tools-standard-enterprise).

To remove authorization from a tool in your IDE, complete the following steps:

1. Navigate to Developer Connect.

   [Go to Developer Connect](https://console.cloud.google.com/developer-connect)
2. Click **Account Connectors**.
3. Find the account connector for the tool service you want to remove, and then
   click the name of the account connector. The connector details page opens.
4. In the row containing your account, click
   **More options**.
5. Click **Delete**.

   Your account is removed from the account connector. The tool is no longer
   authorized to access its service from your IDE.

## What's next

* Try out the GitHub or GitLab tool by following the instructions in
  [Get started with Gemini Code Assist tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/get-started-with-tools-standard-enterprise).