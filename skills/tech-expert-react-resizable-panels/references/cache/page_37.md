# Get started with Gemini Code Assist for Individuals tools

This document describes example prompts you can use with the GitLab and
GitHub Gemini Code Assist tools in your IDE. Developers can
use tools in the IDE to pull information from external services.

For more information about Gemini Code Assist tools and a full list of
the services and products available, see the
[Gemini Code Assist tools overview](https://developers.google.com/gemini-code-assist/docs/tools-agents/tools-overview).

## Before you begin

1. [Set up Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/set-up-gemini).
2. To connect your GitHub or GitLab account, follow the
   instructions in
   [Configure tools](https://developers.google.com/gemini-code-assist/docs/tools-agents/configure-tools).

You can use the GitHub tool to view issues assigned to you, and search for
issues and code using GitHub
[search capabilities](https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-commits)
from within your IDE.

You must have a GitHub account

### Search issues with the GitHub tool

To search for all issues assigned to you, in the Gemini Code Assist
chat, enter a prompt similar to the following:

```
@GitHub list issues assigned to me

```

The GitHub tool lists all issues assigned to you.

To search for issues associated with a specific project and repository, in the
Gemini Code Assist chat, enter a prompt similar to the following:

```
@GitHub what issues are assigned to me in PROJECT_NAME/REPOSITORY

```

Replace the following:

* `PROJECT_NAME` with the name of the GitHub project.
* `REPOSITORY` with the name of the GitHub repository.

The GitHub tool lists issues assigned to you in the specified
repository.

### Search pull requests with the GitHub tool

To search for all open pull requests assigned to you, in the
Gemini Code Assist chat, enter a prompt similar to the following:

```
@GitHub list pull requests assigned to me

```

To search for all pull requests assigned to you in a specific project and
repository, in the Gemini Code Assist chat, enter a prompt similar to
the following:

```
@GitHub what are the pull requests assigned to me in PROJECT/REPOSITORY?

```

Replace the following:

* `PROJECT_NAME` with the name of the GitHub project.
* `REPOSITORY` with the name of the GitHub repository.

### Additional recommended prompts for the GitHub tool

Before using the following prompts, replace the following:

* `PULL_REQUEST_NUMBER`
  is the pull request number in GitHub.
* `REPOSITORY_NAME`
  is the name of your GitHub repository.
* `KEY_WORD` is a keyword
  to use in a search.
* `ISSUE_NAME` the name
  of a GitHub issue

The following prompts are recommended for the GitHub tool:

* `@GitHub list issues assigned to me`
* `@GitHub list my open pull requests`
* `@GitHub list comments for pull request
  PULL_REQUEST_NUMBER
  in
  REPOSITORY_NAME`
* `@GitHub find open issues for
  KEY_WORD`
* `@GitHub find code relating to
  KEY_WORD`
* `@GitHub get comments on my issue
  ISSUE_NAME`
* `@GitHub what are the comments on my pr
  PULL_REQUEST_NUMBER`

You can use the GitLab tool to list your pull requests and issues from your
GitLab projects.

To list pull requests in a GitLab project, in the Gemini Code Assist
chat, enter a prompt similar to the following:

```
@gitlab list my open pull requests in project PROJECT_NAME

```

Where `PROJECT_NAME` is
your GitLab project name.

The `@gitlab` tool lists your open pull requests.

To list issues assigned to you in GitLab, in the Gemini Code Assist
chat, enter a prompt similar to the following:

```
@gitlab list issues assigned to me

```

The `@gitlab` tool lists issues assigned to you.

### Additional recommended prompts

Before using the following prompts, replace the following:

* GITLAB\_PROJECT is your GitLab
  project name.
* MERGE\_REQUEST\_NUMBER
  is the merge request number in GitLab.
* ISSUE\_NAME is the name of a
  GitLab issue.

The following prompts are recommended for the GitLab tool:

* `@gitlab list my issues in the project
  GITLAB_PROJECT?`
* `@gitlab list all my open merge requests for
  MERGE_REQUEST_NUMBER`
* `@gitlab what's the status of the CI pipeline for merge request
  ISSUE_NAME in
  PROJECT_NAME?`

## What's next

* Learn more about Gemini Code Assist tools by reading the
  [overview](https://developers.google.com/gemini-code-assist/docs/tools-agents/tools-overview)