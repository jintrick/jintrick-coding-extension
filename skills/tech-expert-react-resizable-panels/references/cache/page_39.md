# Review GitHub code using Gemini Code Assist

Gemini Code Assist for GitHub brings the power of
Gemini to the pull request process by acting as a code reviewer.
Gemini Code Assist speeds up and increases the quality of code
using a Gemini-powered agent that automatically summarizes pull
requests and provides in-depth code reviews. You can invoke
Gemini Code Assist at any stage of the pull request to review the code.

You can interact with Gemini in the pull request comments directly by:

* Asking clarifying questions on the review that Gemini creates.
* Prompting Gemini by adding the `/gemini` tag to your comments
  to ask questions in the context of the pull request.

Gemini will automatically retrieve helpful information from the
repository and pull request to perform its tasks.

This document is intended for developers of all skill levels. It assumes that
you have a working knowledge of GitHub.

## Before you begin

To test the steps in this document, make sure you do one of the following:

* Use your own GitHub repository. Gemini Code Assist
  doesn't support organizations that enable private connectivity.
* Create a fork of [our sample repository](https://github.com/GoogleCloudPlatform/microservices-demo).

## Install Gemini Code Assist for GitHub

You can install Gemini Code Assist by following these
steps:

1. Go to the [Gemini Code Assist for GitHub](https://github.com/apps/gemini-code-assist)
   app page.
2. Sign in to your GitHub account if you haven't already.
3. Click **Install**.

   A prompt to install Gemini Code Assist for a user or
   organization is displayed.
4. When prompted to install Gemini Code Assist for a user or
   organization, select the organization you intend to use it on.

   After you've installed Gemini Code Assist for your
   GitHub organization, you're prompted to select the repositories to
   enable the Code Review integration.

   You're redirected to the Gemini Code Assist Admin Console.
5. Login with your GitHub account.
6. Select a GitHub organization or personal account from the drop-down
   menu.
7. Review and accept the Google Terms of Service, Generative AI Prohibited Use
   Policy and Privacy Policy, and then click **Complete setup**.

   Gemini Code Assist is added to the pull requests within your
   selected repositories.

After creation, Gemini Code Assist provides suggestions to your
code review every time the pull request author or other human reviewers add
comments with the `/gemini` tag on the pull request.

Gemini Code Assist is now active for all the pull
requests within your selected repositories! In the next section, you learn
how to get pull request summaries and feedback.

## Get pull request summary and feedback

To get an initial review for a pull request from
Gemini Code Assist, create a new pull request.

When you open the new pull request, Gemini Code Assist provides
an initial review. After the review is ready,
`gemini-code-assist[bot]` is automatically added as a reviewer to the pull
request. Gemini Code Assist adds an issue comment in the
**Conversation** tab of the pull request with its feedback, and proceeds to add
comments about modified portions of the code.

Review comments contain the following information:

* Severity of the issue, given as Critical, High, Medium, and Low
* Feedback on the issue
* Code suggestion that can be committed directly from GitHub
* References to a user-provided style guide

## Manually invoke Gemini Code Assist

Gemini Code Assist listens to comments from any pull request
contributor, and decides whether it should respond.

To manually invoke Gemini Code Assist, you can use the
following commands in the main comments page on the pull request as an issue
comment.

| Command | Description |
| --- | --- |
| `/gemini summary` | Posts a summary of the changes in the pull request |
| `/gemini review` | Posts a code review of the changes in the pull request |
| `/gemini` | Manually invokes Gemini Code Assist in comments |
| `/gemini help` | Overview of the available commands |

## Manage the Gemini Code Assist settings

Anyone with permissions to modify GitHub App settings for the
organization can manage the Gemini Code Assist settings. You can review
the permissions provided to the Gemini Code Assist, manage repository
access, and uninstall Gemini Code Assist.

To modify the settings, follow these steps:

1. On GitHub, click your profile photo and then click **Settings**.
2. In the **Integrations** section, click **Applications**.
   A list of GitHub Apps is displayed.
3. Beside Gemini Code Assist, click **Configure**.

## What's next

* Learn how to
  [customize Gemini Code Assist behavior in GitHub](https://developers.google.com/gemini-code-assist/docs/customize-gemini-behavior-github).