# Use Gemini Code Assist code customization

[Skip to main content](#main-content)

* [Home](https://developers.google.com/gemini-code-assist)
  + [Home](https://developers.google.com/gemini-code-assist)
  + [Guides](https://developers.google.com/gemini-code-assist/docs/overview)
  + [Resources](https://developers.google.com/gemini-code-assist/resources/faqs)

* [Overview](https://developers.google.com/gemini-code-assist/docs/overview)
* [Gemini in Android Studio](https://developers.google.com/gemini-code-assist/docs/android-studio-overview)
* [Gemini CLI](https://developers.google.com/gemini-code-assist/docs/gemini-cli)
* [Supported languages, IDEs, and interfaces](https://developers.google.com/gemini-code-assist/docs/supported-languages)
* [How Gemini Code Assist works](https://developers.google.com/gemini-code-assist/docs/works)
* [How Gemini Code Assist Standard and Enterprise use your data](https://developers.google.com/gemini-code-assist/docs/data-governance)
* [Responsible AI](https://developers.google.com/gemini-code-assist/docs/responsible-ai)
* [Set up Gemini Code Assist for individuals](https://developers.google.com/gemini-code-assist/docs/set-up-gemini)
* [Use the Gemini Code Assist for individuals chat](https://developers.google.com/gemini-code-assist/docs/use-gemini-code-assist-chat)
* [Get started with Gemini Code Assist for individuals tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/get-started-with-tools)
* [Code features overview](https://developers.google.com/gemini-code-assist/docs/code-overview)
* [Code with Gemini Code Assist for individuals](https://developers.google.com/gemini-code-assist/docs/write-code-gemini)
* [Chat features overview](https://developers.google.com/gemini-code-assist/docs/chat-overview)
* [Chat with Gemini Code Assist for individuals](https://developers.google.com/gemini-code-assist/docs/chat-gemini)
* [Agent mode](https://developers.google.com/gemini-code-assist/docs/agent-mode)
* [Use agentic chat as a pair programmer](https://developers.google.com/gemini-code-assist/docs/use-agentic-chat-pair-programmer)
* [Gemini Code Assist tools overview](https://developers.google.com/gemini-code-assist/docs/tools-agents/tools-overview)
* [Code customization overview](https://developers.google.com/gemini-code-assist/docs/code-customization-overview)
* [Configure code customization](https://developers.google.com/gemini-code-assist/docs/code-customization)
* [Use code customization](https://developers.google.com/gemini-code-assist/docs/use-code-customization)
* [Encrypt data with customer-managed encryption keys](https://developers.google.com/gemini-code-assist/docs/encrypt-data-cmek)
* [Review GitHub code with Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/review-github-code)
* [Customize Gemini Code Assist behavior in GitHub](https://developers.google.com/gemini-code-assist/docs/customize-gemini-behavior-github)
* [Keyboard shortcuts](https://developers.google.com/gemini-code-assist/docs/keyboard-shortcuts)
* [Exclude files from Gemini Code Assist use](https://developers.google.com/gemini-code-assist/docs/create-aiexclude-file)
* [Configure local codebase awareness](https://developers.google.com/gemini-code-assist/docs/configure-local-codebase-awareness)
* [Use pre-release features in Gemini Code Assist for VS Code](https://developers.google.com/gemini-code-assist/docs/use-pre-release-features-gemini-code-assist)
* [Configure Gemini Code Assist for individuals tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/configure-tools)
* Standard and Enterprise

  + [Configure Gemini Code Assist logging](https://developers.google.com/gemini-code-assist/docs/configure-logging)
  + [Manage your Gemini Code Assist subscription](https://developers.google.com/gemini-code-assist/docs/admin)
  + [Manage Gemini Code Assist licenses](https://developers.google.com/gemini-code-assist/docs/manage-licenses)
  + [Configure VPC Service Controls](https://developers.google.com/gemini-code-assist/docs/configure-vpc-service-controls)
  + [Control Network Access with User Domain Restrictions](https://developers.google.com/gemini-code-assist/docs/network-access)
  + [Turn off Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/turn-off-gemini)
  + [Configure Gemini Code Assist tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/configure-tools-standard-enterprise)
* [Troubleshoot access to Gemini Code Assist features](https://developers.google.com/gemini-code-assist/docs/troubleshoot-code-assist)
* [Provide feedback](https://developers.google.com/gemini-code-assist/docs/feedback)

## Use Gemini Code Assist code customization



This document describes how to use
[Gemini Code Assist code customization](https://developers.google.com/gemini-code-assist/docs/code-customization-overview)
and provides a few best practices. This feature lets you receive code
recommendations, which draw from the internal libraries, private APIs, and the
coding style of your organization.

## Before you begin

1. [Set up Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/set-up-gemini-standard-enterprise)
   with an [Enterprise subscription](https://developers.google.com/gemini-code-assist/docs/overview#supported-features).
2. [Set up Gemini Code Assist code customization](https://developers.google.com/gemini-code-assist/docs/code-customization-console).

The following table lists ways to use
Gemini Code Assist code customization:

| Form | How to trigger | Notes and resources |
| --- | --- | --- |
| Natural language chat | Enter a natural language prompt in Gemini Code Assist chat in the IDE. | Consider the following:   * Chat history is not available. Avoid multi-step queries. * You can ask for more details about sources, including links to   the specific sources. * If you highlight or select code when you send a message in chat,   Gemini Code Assist uses that code to improve code   customization and chat quality.   For more information, see [Chat with Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/write-code-gemini#chat). |
| Generate code | In the quick pick bar in your IDE, either with or without selected code, press `Command+Enter` (on macOS) or `Control+Enter`. | For more information, see [Generate code with prompts](https://developers.google.com/gemini-code-assist/docs/write-code-gemini#generate_code_with_prompts). |
| Transform code | In the quick pick bar in your IDE, either with or without selected code, enter `/fix`. | For more information, see [Generate code with prompts](https://developers.google.com/gemini-code-assist/docs/write-code-gemini#generate_code_with_prompts). |
| Autocomplete | Code customization is automatically triggered and provides suggestions based on what you write. | Consider the following:   * Code completion needs a certain level of confidence to propose a   suggestion. Ensure that a substantial amount of code is available   so that relevant snippets are retrieved. * Code completion checks if you have required libraries in order   to use certain elements of the function.   For more information, see [Get code completions](https://developers.google.com/gemini-code-assist/docs/write-code-gemini#get_code_completions). |
| Remote repository context | 1. Start your prompt with the `@` symbol. A list of available remote    repositories that are indexed appears. 2. Select the repository you want to use for context from the list.    You can also start typing the repository name to filter the list. 3. After selecting the repository, write the rest of your prompt. | Consider the following:   * This is useful when you are working on a task that is mostly   related to a specific set of microservices, libraries, or modules.   For more information, see [Get more relevant suggestions with remote repository context](https://developers.google.com/gemini-code-assist/docs/write-code-gemini#get_more_relevant_suggestions_with_remote_repository_context). |

## Use cases and prompt examples

The following table provides guidance and examples about using
code customization in specific use cases:

| Use case | Things worth trying |
| --- | --- |
| Writing new code | Try the following to generate code in your IDE or Gemini Code Assist chat:   * Generate code that would use terms which are already mentioned   in your codebase. * Paste in your code, such as a functional signature or code with   `TODO` comments, and then ask   Gemini Code Assist to fill in or replace   `TODO` comments with code. Add comments with explanation   from context.   Try generating code with the following prompts in Gemini Code Assist chat:   * "Write a main function where a connection to   `DATABASE` is created. Include health   checks." * "Write a `FUNCTION_OR_CLASS` in the   following structure:   `EXPLAIN_STRUCTURE`."   After you generate some code, try using a follow-up prompt to improve it:   * "Try the `/fix` command to adjust the generated   code—for example, syntax errors." * "Add missing imports." * "Try `/fix` on chat-generated code." |
| Cleaning, simplifying, and refactoring code | Try the following prompts in Gemini Code Assist chat:   * "Can you merge   `IMPORTS_VARIABLES_OR_NOTE_EXPORTED_FUNCTIONS`   in this file?" * "How would you simplify the   `FUNCTION_NAME` function?" * "Can you merge `FUNCTION_NAME_1` and   `FUNCTION_NAME_2` into one function?" * "Could you inline some variables in   `FUNCTION_NAME`?" * "Could you simplify variable naming in the function   `FUNCTION_NAME`?" |
| Readability | Try the following prompts in Gemini Code Assist chat:   * "Write the function `FUNCTION_NAME` in   fewer lines of code, if possible." * "Add comments to the function   `FUNCTION_NAME`." * "Remove unnecessary whitespaces in the function   `FUNCTION_NAME`." * "Format the function `FUNCTION_NAME` in a   similar way as the rest of the code." |
| Code review | Try the following prompts in Gemini Code Assist chat:   * "Split the code in parts and explain each part using our   codebase." * "Are there variables or keywords that could be shorter and more   self-explanatory?" * "Can you give me useful code from the   `REPOSITORY_NAME_PACKAGE_MODULE` context for   this code?" * "What do you think about the function   `FUNCTION_NAME`?" |
| Debugging | Try the following prompts in Gemini Code Assist chat:   * "I am getting an error when I try to do X/add Y. Why?" * "Can you spot an error in the function   `FUNCTION_NAME`?" * "How would you fix the function   `FUNCTION_NAME` given this error   message?" |
| Learning and onboarding | Try the following prompts in Gemini Code Assist chat:   * "Split this code in parts and explain each of them using our   codebase." * "Show how to call function   `FUNCTION_NAME`?" * "Show how to run the main function in the   `ENVIRONMENT_NAME` environment?" * "What is the key technical improvement we can do to make this   code more performant?" * "Show me the implementation of   `FUNCTION_OR_CLASS_NAME` to achieve better   results and add what that specific element is"—for example,   "Show me the implementation of function foo where foo is the name of   the function." |
| Migration | Try the following prompts in Gemini Code Assist chat:   * "Give me a strategy for how I can migrate   `FILE_NAME` from   `LANGUAGE_1` to   `LANGUAGE_2`"—for example, from Go to   Python. * "Given the function `FUNCTION_NAME` in   repository `REPOSITORY_NAME`, find me an   equivalent function in language   `LANGUAGE_NAME` that I can use."   Try the following chat-based or code generation transformation workflow using prompts:   1. "Take `FILENAME_COMPONENT` code    already written in `LANGUAGE_1` and refactor    and migrate it to `LANGUAGE_2`"—for example,    from Go to Python. 2. After you migrate some code, try the following:    * Select smaller chunks and use `/fix` to get      it into a state that you want.    * Try the following prompts:    + "Is there something which can be improved?"    + "Give me possible pain points."    + "How would you test this code if that migration is      correct?" |
| Generating documentation | Try the following prompts in Gemini Code Assist chat:   * "Summarize the code in package or folder   `X` and provide documentation for the top five   important methods." * "Generate documentation for   `FUNCTION_OR_CLASS_NAME`." * "Shorten the documentation while preserving the key   information." |
| Unit test generation | Try the following prompts in Gemini Code Assist chat:   * "Generate unit tests for `FILENAME`." * "Add the most relevant test cases for the   `FUNCTION_NAME` function." * "Remove test cases that you think don't bring much value." |

## Best practices

* **Use relevant variable and function names or code snippets.** This guides
  code customization towards the most pertinent code examples.
* **Use index repositories that you want to scale, and avoid adding deprecated
  functionality.** Code customization helps to scale to the code style,
  patterns, code semantics, knowledge, and implementations across the codebase.
  Bad examples of repositories to scale are deprecated functionalities,
  generated code, and legacy implementations.
* **For code retrieval use cases, use code generation functionality instead of
  code completion**. Prompt using language such as "Using the definition of
  `FUNCTION_NAME`, generate the exact same function," or
  "Generate the exact implementation of `FUNCTION_NAME`."
* **Have includes or imports present in the file for the code that you want to
  retrieve** to improve Gemini contextual awareness.
* **Execute only one action for each prompt.** For example, if you want to
  retrieve code and have this code be implemented in a new function, perform
  these steps over two prompts.
* **For use cases where you want more than just code** (such as code
  explanation, migration plan, or error explanation), use
  code customization for chat, where you have a conversation with
  Gemini with your codebase in context.
* **Note that AI model generation is non-deterministic**. If you aren't
  satisfied with the response, executing the same prompt again might achieve a
  better result.
* **Note that generating unit tests** generally works better if you open the
  file locally, and then from chat, ask to generate unit tests for this file or
  a specific function.

### **Get more relevant suggestions with remote repository context**

You can get more contextually aware and relevant code suggestions by directing Gemini Code Assist to focus on specific remote repositories. By using the `@` symbol in the chat, you can select one or more repositories to be used as a primary source of context for your prompts. This is useful when you are working on a task that is mostly related to a specific set of microservices, libraries, or modules.

To use a remote repository as context, follow these steps in your IDE's chat:

1. Start your prompt with the `@` symbol. A list of available remote repositories that are indexed will appear.
2. Select the repository you want to use for context from the list. You can also start typing the repository name to filter the list.
3. After selecting the repository, write the rest of your prompt.

Gemini will then prioritize the selected repository when generating a response.

#### **Example Prompts**

Here are some examples of how you can use this feature:

* **To understand a repository:**
  + "`@``REPOSITORY_NAME` What is the overall structure of this repository?"
  + "`@``REPOSITORY_NAME` I'm a new team member. Can you give me an overview of this repository's purpose and key modules?"
* **For code generation and modification:**
  + "`@``REPOSITORY_NAME` Implement an authentication function similar to the one in this repository."
  + "`@``REPOSITORY_NAME` Refactor the following code to follow the conventions in the selected repository."
  + "`@``REPOSITORY_A_NAME` How can I use the latest functions from this repository to improve my code in `REPOSITORY_B_NAME`?"
* **For testing:**
  + "`@``UNIT_TEST_FILE_NAME` Generate unit tests for `MODULE` based on the examples in the selected file."

By using remote repositories as a focused source of context, you can get more accurate and relevant suggestions from Gemini Code Assist, which can help you code faster and more efficiently.

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2025-09-08 UTC.