# Antigravity Artifact Review

When starting an Agent conversation, there are two primary execution modes:
- **Planning Mode**: The agent plans thoroughly, organizes work in task groups, produces structured implementation plans (Artifacts), and researches the codebase.
- **Fast Mode**: The agent executes tasks directly without a dedicated planning phase (best for quick, localized tasks like bash commands or variable renaming).

## Artifact Review Policy
In Planning Mode, you can customize the review workflow via the Agent Settings:

### 1. Request Review (Recommended)
- The agent **halts** and requests explicit approval before proceeding with proposed changes.
- When an implementation plan or code diff is generated, execution pauses and the user is notified.
- You can thoroughly review, add inline comments, and verify the plan before clicking Approve.

### 2. Always Proceed
- The agent **never halts** for manual review and immediately executes its plans.
- If the agent decides to request a review, it will bypass the pause and continue implementation.
- Use this for fully autonomous workflows where manual verification is not needed.
