# Gemini Code Assist tools permissions

This notice describes how Gemini Code Assist tools use your data and
make API calls on your behalf.

When you use Gemini Code Assist tools, Gemini Code Assist
tools collect your prompts and make API calls that include data taken from your
prompt to third-party services. This document outlines what API calls each tool
can make and what data is shared with the third party service.

Gemini Code Assist tools can share any data sent to them using the
`@TOOL_NAME` syntax with their third-party service. Gemini Code Assist
tools don't share data between tools. Gemini Code Assist tools don't
share your Gemini Code Assist chat history with third-party services
except when you prompt them using the `@TOOL_NAME` syntax.

The following sections list the REST API calls each third-party tool can make
on your behalf when you prompt them from the Gemini Code Assist chat.

### GitHub

The GitHub tool can use the following REST API calls on your behalf when you
prompt it from the Gemini Code Assist chat:

* `issues-and-pull-requests.create-issue`: This REST API call creates an issue
  in a GitHub repository given a GitHub repository, owner, and an issue title.
* `issues-and-pull-requests.list-comments`: This REST API call gets the
  comments associated with a pull request or an issue. given a GitHub
  repository, owner, and an issue number.
* `search.code`: Searches for code across all of GitHub.
* `search.commits`: You can search for commits globally across all of GitHub,
  or search for commits within a particular repository or organization."
* `search.issues-and-pull-requests`: This REST API call lets you search for
  specific issues and pull requests to retrieve all information related to
  them across all repositories you have permission to access based on their
  state (e.g. open or closed) and keywords.

API permissions:

* `repo`: Grants full access to public and private repositories. This scope
  includes `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`,
  `security_events`, `administration`, `read:org`, `write:org`,
  `read:public_key`, `write:public_key`, `read:gpg_key`, `write:gpg_key`,
  `gist`, `workflow`, and `codespace`.

### GitLab

The GitLab tool can use the following REST API calls on your behalf when you
prompt it from the Gemini Code Assist chat:

* `ListProjects`: Retrieves a list of projects for the current user.
* `ListIssues`: Retrieves a list of issues for a specified project.
* `CreateIssue`: Creates a new issue in a specified project.
* `ListMergeRequests`: Retrieves a list of merge requests for a specified
  project.
* `ListMergeRequestPipelines`: Retrieves a list of pipelines for a specified
  merge request.

API permissions:

* `read_api`: Grants read-only access to the authenticated user's API.
* `read_repository`: Grants read-only access to the repository.
* `read_user`: Grants read-only access to the authenticated user's profile information.
* `api`: Grants complete read/write access to the authenticated user's API.

### Google Docs

The Google Docs tool can use the following REST API calls on your behalf when
you prompt it from the Gemini Code Assist chat:

* `ListFiles`: Retrieve a list of files in the user's Google Drive based on a
  given query or filters.
* `Export`: Export the contents of a Google Doc in order to inspect its
  contents. If the user is asking for any information that may be contained
  within a given file, this is the REST API that should be called.

API permissions:

* `drive.readonly`: Allows read-only access to your Google Drive files,
  including all files you own and files have access to.

### Sentry

The Sentry tool can use the following REST API calls on your behalf when you
prompt it from the Gemini Code Assist chat:

* `organizations`: Return the current `organization_id_or_slug`.
* `getIssue`: Return details on an individual issue. This returns the basic
  stats for the issue (title, last seen, first seen), some overall numbers
  (number of comments, user reports) as well as the summarized event data.
* `transactions`: Return a list of transactions affected by an issue
* `issues`: Return a list of issues and errors assigned for the given
  organization and project.

API permissions:

* `event:read`: Allows reading events.
* `projects.read`: Allows reading project-related information.
* `org.read`: Allows reading organization-related information.

### Atlassian Rovo

The Atlassian Rovo tool can use the following REST API calls on your behalf when
you prompt it from the Gemini Code Assist chat:

* `completions`: Send a request to Atlassian Rovo in OpenAI format (a list of
  chat messages)

API permissions:

* `rovo`: Grants access to Atlassian Rovo in the user's account.

### MongoDB

The MongoDB tool tool can use the following REST API calls on your behalf when
you prompt it from the Gemini Code Assist chat:

* `createConversation`: This chatbot can answer any question about databases
  or MongoDB, provide examples of code, explain topics, etc. This operation
  initializes the conversation.
* `addMessage`: This chatbot can answer any question about databases or
  MongoDB, provide examples of code, explain topics, etc. This operation adds
  a new message to the conversation.

API permissions:

* Not user-authenticated. Accesses the general MongoDB docs chatbot.

### New Relic

The New Relic tool can use the following REST API calls on your behalf when you
prompt it from the Gemini Code Assist chat:

* `completions`: Endpoint to send user prompts to New Relic AI and
  receive responses

API permissions:

* Access to New Relic's AI endpoint for the user's account.

### Redis

The Redis tool can use the following REST API calls on your behalf when you
prompt it from the Gemini Code Assist chat:

* `chat`: Endpoint to send user prompts to Redis AI and receive responses

API permissions:

* Not user-authenticated. Accesses the general Redis chatbot.

### Neo4j

The Neo4j tool can use the following REST API calls on your behalf when you prompt
it from the Gemini Code Assist chat:

* `invoke`: Endpoint to send user prompts to Neo4j AI Chatbot and receive
  responses

API permissions:

* Not user-authenticated. Accesses the general Neo4j docs chatbot.

### Snyk

The Snyk tool can perform the following operations on your behalf when you
prompt it from the Gemini Code Assist chat:

* `/scan`: Fetches vulnerability logs from Snyk Extension
* `/scan new`: Fetches latest vulnerability logs

## What's next

* Read
  [Gemini Code Assist: Terms of Service and Privacy Policies](https://developers.google.com/gemini-code-assist/resources/privacy-notices).
* Learn more about [how Gemini Code Assist works](https://developers.google.com/gemini-code-assist/docs/works).