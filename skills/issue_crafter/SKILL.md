---
name: issue_crafter
description: Structured workflow for producing technically-validated, implementation-ready Issue documents.
---

# Issue Crafter

Produce implementation-ready Issue documents aligned with project development guidelines.

Output must be technically sound, traceable, and directly executable.

---

## Operating Principles

Comply with:
   - Headless Architecture constraints
   - `docs/issue/REVIEW.md` (if present)
   - `docs/reference/` guidelines

---

## Workflow

### Step 1 — Draft the Issue

Create `docs/issue/vX.Y.Z.md` (or equivalent).

Requirements:
- Follow `docs/issue/TEMPLATE.md` exactly.
- Do not introduce new top-level sections.
- Fill all required fields with concrete, technical content.
- Define measurable acceptance criteria.
- Define non-goals where relevant.

Set:
`status: drafting`

Output the full Markdown draft.
Wait for approval.

---

### Step 2 — Validate Against Codebase (MANDATORY)

Investigate using `codebase_investigator`.

Identify:
- Relevant files
- Existing patterns
- Dependencies
- Architectural constraints
- Potential conflicts

Output structured findings:

- Verified Files
- Feasibility: High / Medium / Low
- Risks
- Missing Context
- Critical Blockers (if any)

If critical blockers exist, revise the draft and return to Step 1.

---

### Step 3 — Plan the Implementation

Do not implement changes. Define execution only.

Produce a step-by-step plan including:

- Exact file paths
- Specific tool calls (`write_file`, `replace`, `run_shell_command`)
- Scope of modifications
- Migration steps (if applicable)
- Test strategy:
  - Unit tests
  - Integration tests
  - Manual validation steps

The plan must be atomic and unambiguous.

Wait for approval.

---

### Step 4 — Integrate and Finalize

Integrate the approved plan into the Issue document (e.g., `## Implementation Details`).

Ensure consistency between:
- Acceptance Criteria
- Validation findings
- Implementation steps

Update:
- `status: in-progress`

Perform a final consistency review.

Request final approval.

---

## Implementation-Ready Definition

An Issue is complete only if:

- Acceptance criteria are measurable and testable
- All risks and dependencies are enumerated
- No unknown technical blockers remain (implementation path is clear)
- Architectural compliance is verified
- Testing strategy is defined
- Implementation steps are executable without clarification

---

## Tool Fallback Rule

If `codebase_investigator` is unavailable:
- Explicitly state this limitation
- Use standard search tools (`grep_search`, `glob`) to perform investigation
- Mark validation confidence level as:
  `low / medium / high`
