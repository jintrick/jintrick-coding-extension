# Use the Gemini Code Assist chat

This document describes how to get AI-powered assistance in the
[Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/overview) chat in your integrated
development environment (IDE).

Gemini Code Assist chat lets you write natural language statements
or questions (called *prompts*) to get in-depth explanations of your code,
suggested actions, or guided workflows that help you complete tasks quickly and
efficiently without leaving the IDE.

[Learn how and when Gemini for Google Cloud uses your data](https://developers.google.com/gemini-code-assist/docs/data-governance).

To open Gemini Code Assist chat in the IDE:

### VS Code

1. In the activity bar of your IDE, click
   spark
   **Gemini Code Assist**.
2. In the **Gemini Code Assist** chat, enter a prompt and then click
   send
   **Send**.

### IntelliJ

In the Gemini Code Assist tool window, enter a prompt and
then click **Submit**.

## View query history

### VS Code

Query history isn't available for VS Code.

### IntelliJ

If you want to re-use your previous prompts, you can find them in your
**Query History** in the **Gemini Code Assist** tool window by clicking
schedule **Show Query History**.

![Gemini Query History in the tool window.](https://cloud.google.com/code/docs/intellij/images/gemini-code-assist-query-history.png)

## Clear chat history

Gemini Code Assist uses the chat history for additional context
when responding to your prompts. If your chat history is no longer relevant to
what you're trying to achieve, you can clear the chat history:

### VS Code

1. In the **Gemini Code Assist** pane, click
   history **Resume
   Previous Chat**.
2. When the previous chats appear in the **Select chat** menu, hold your
   pointer over the chat that you want to clear, and select **Delete**.

   ![Button to clear conversation history in Gemini VS Code.](https://cloud.google.com/gemini/images/vscode-clear-history.png)
3. When prompted to confirm the deletion of the chat thread, select
   **Delete**.

### IntelliJ

1. In the **Gemini Code Assist** tool window, click
   chat\_bubble **Recent
   Chats**.
2. When the previous chats appear in the **Recent Chats** menu, hold your
   pointer over the chat that you want to clear, and select
   delete **Delete**.

   ![Button to clear conversation history in Gemini tool window.](https://cloud.google.com/gemini/images/intellij-clear-history.png)

## What's next

For more information on using Gemini Code Assist in the IDE, see
[Code with Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/write-code-gemini-standard-enterprise).