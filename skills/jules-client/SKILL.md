---
name: jules-client
description: Manage AI coding sessions using the Jules REST API. Start coding sessions, approve plans, monitor activities, and manage session lifecycles. Supports JSON output for programmatic use by agents.
version: 1.0.0
---

# Jules Client

## Overview

This skill allows you to interact with the Jules AI coding agent via its REST API. You can start new coding sessions on GitHub repositories, monitor their progress, approve plans, and retrieve resulting Pull Requests.

## Prerequisites

**Environment Variable**: `JULES_API_KEY` must be set in the environment.

## Programmatic Use (JSON Output)

All commands support the `--json` flag. When this flag is used, the command outputs a structured JSON object to stdout, which can be parsed by other tools or agents.

**Example**:
```bash
node scripts/api.cjs get <session_id> --json
```

The output for a completed session will include an enriched `outputs` array with `prNumber` extracted from Pull Request URLs:
```json
{
  "name": "sessions/123",
  "state": "COMPLETED",
  "outputs": [
    {
      "pullRequest": {
        "url": "https://github.com/org/repo/pull/42",
        "prNumber": "42"
      }
    }
  ]
}
```

## Commands

### 1. Discovery

#### List Sources
Find the repositories connected to the Jules account.
```bash
node scripts/api.cjs sources [--json]
```

#### List Sessions
View the history of recent coding sessions.
```bash
node scripts/api.cjs sessions [--json]
```

### 2. Session Management

#### Start a Session
Start a new coding task. By default, it automatically detects the repository URL from the current directory using `git remote get-url origin`.
```bash
node scripts/api.cjs start [source_url_or_name] "<task_prompt>" [flags]
```
**Examples:**
*   **Auto-detect**: `node scripts/api.cjs start "Fix the bug in auth logic"` (Requires being inside a git repo)
*   **Using URL**: `node scripts/api.cjs start https://github.com/user/repo "Add unit tests"`
*   **Using Source Name**: `node scripts/api.cjs start github/user/repo "Refactor types"`

**Flags:**
*   `--branch <name>`: Branch to base the work on (default: `main`).
*   `--title "<string>"`: Custom title for the session.
*   `--auto-pr`: Automatically create a Pull Request upon completion.
*   `--no-approval`: Skip the manual plan approval step.
*   `--json`: Output the created session object as JSON.

#### Get Session Details
Retrieve status and outputs (like Pull Request URLs and PR numbers) for a session.
```bash
node scripts/api.cjs get <session_id> [--json]
```

#### Get PR Number
Extract and output only the Pull Request number (useful for `gh pr view`).
```bash
node scripts/api.cjs pr <session_id> [--json]
```

#### Get Working Branch
Extract and output the name of the working branch created by Jules.
```bash
node scripts/api.cjs branch <session_id> [--json]
```

#### Open Session in Browser
Open the session's interactive web page.
```bash
node scripts/api.cjs open <session_id> [--json]
```

#### Delete a Session
Remove a session.
```bash
node scripts/api.cjs delete <session_id> [--json]
```

### 3. Workflow Operations

#### Monitor Session (Interactive)
Stream session activities in real-time. Use flags to wait for specific events, making it ideal for automation.
```bash
node scripts/api.cjs watch <session_id> [--wait-for <event>] [--timeout <seconds>]
```
**Options:**
*   `--wait-for <event>`: Exit when a specific event occurs. Supported events: `plan`, `message`, `changes`, `finish`.
*   `--timeout <seconds>`: Exit with error if the event doesn't occur within the limit.

#### Send Message
Send feedback or instructions to the agent during a session.
```bash
node scripts/api.cjs message <session_id> "<text>"
```

#### Inspect Session (Agent Summary)
Get a structured, token-efficient summary of the session. Includes:
*   `plan_steps`: List of steps in the current plan.
*   `agent_notes`: Messages and observations from Jules.
*   `test_results`: Commands executed and their exit codes.
*   `changed_files`: List of files modified in the session.
```bash
node scripts/api.cjs inspect <session_id>
```

#### Get Code Diff
Extract the latest code changes as a standard unified diff (git patch) from the session artifacts.
```bash
node scripts/api.cjs diff <session_id>
```

#### Monitor Activities (Log)
Check progress, messages, and plan details (Snapshot).
```bash
node scripts/api.cjs activities <session_id> [--json]
```

#### Get Activity Details
Retrieve specific details of a single activity.
```bash
node scripts/api.cjs activity <session_id> <activity_id> [--json]
```

#### Approve a Plan
Authorize Jules to proceed.
```bash
node scripts/api.cjs approve <session_id> [--json]
```