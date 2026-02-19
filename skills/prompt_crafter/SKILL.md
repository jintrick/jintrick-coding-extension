---
name: prompt_crafter
description: Workflow for producing high-quality agent specifications (prompts) aligned with strict design principles.
---

# Prompt Crafter

Generate and refine robust, verifiable, and structure-constrained agent specifications.

This skill enforces strict Prompt Engineering Best Practices defined within this document.

---

## Core Principles (The Standard)

Adhere to these 14 principles strictly during the Refinement phase.

1.  **Define Deliverables (Not Concepts)**
    - Output file paths must be explicit.
    - Output formats (Markdown/JSON) must be fixed.
    - Mandatory sections must be enumerated.
    - Completion criteria must be measurable.

2.  **Eliminate Abstract Words**
    - **PROHIBITED**: "properly", "appropriately", "maintain", "ensure", "consider", "follow best practices".
    - **ACTION**: Convert all into verifiable actions or checks (e.g., "Ensure traceability" -> "Include Requirement ID in every section").

3.  **Fix Output Structure**
    - Explicitly define header structures.
    - Enumerate required fields.
    - Prohibit empty fields.
    - Provide examples where possible.

4.  **Checklist Completion Criteria**
    - Define completion not by philosophy, but by verifiable conditions (e.g., "All tests passed", "File exists").

5.  **Explicit Prohibitions**
    - List what NOT to do (e.g., "Do not modify existing logic", "Do not add new top-level sections").
    - Negative constraints are easier for models to follow.

6.  **Minimize Flow Control**
    - Avoid sequential "steps" unless necessary. Use "Modes" instead.

7.  **Prioritize Artifacts over Roles**
    - Instead of "Act as a Lead Architect", say "The output must be an atomic implementation plan."

8.  **Structure Investigation Results**
    - Prohibit free-form investigation reports. Force a structured format (e.g., "Verified Files:", "Feasibility:", "Risks:").

9.  **Define Fallbacks**
    - Explicitly state what to do if a tool fails (e.g., "If `codebase_investigator` fails, use `grep_search`").

10. **Zero "Philosophy" Sections**
    - Remove abstract "Operating Principles". Replace them with concrete checklists or constraints.

11. **One Prompt = One Responsibility**
    - Do not mix Drafting, Validation, and Implementation in one prompt. Separate them if complex.

12. **Specific Granularity**
    - Avoid vague instructions like "Create a plan".
    - Use specific instructions: "List changes per file", "Enumerate test cases".

13. **Handle Uncertainty**
    - Require "UNKNOWN" for missing information. Prohibit guessing.

14. **Eliminate Redundancy**
    - Remove repeated goals or descriptions.

---

## Workflow

### Step 1 — Draft Mode (Structure the Requirements)

Transform user requirements into a structured draft.

Requirements:
- Define the primary **Goal** as a concrete output (e.g., specific file, format).
- Identify mandatory sections and output structures.
- Define initial success criteria.

Output:
- Full Markdown draft of the agent specification.
- A summary of identified constraints.

Set:
`mode: drafting`

---

### Step 2 — Refine Mode (Critical Review & Hardening)

Apply the **Core Principles** (above) to the draft.

**MANDATORY Checklist for Refinement:**
1.  **Output defined?** (Path, Format, Sections specified?)
2.  **Zero abstract words?** (Replace "properly", "ensure" with specific actions.)
3.  **Structure fixed?** (Fixed headers, no empty fields.)
4.  **Completion criteria measurable?** (Boolean/verifiable conditions.)
5.  **Boundaries/Prohibitions clear?** (Negative constraints defined.)
6.  **Flow control minimized?** (Use mode switching.)
7.  **Output-centric over role-centric?** (Focus on the artifact.)
8.  **Investigation results structured?** (Fixed format.)
9.  **Fallback defined?** (Alternative tools included.)
10. **Zero "Philosophy" sections?** (Use checklists.)
11. **One Prompt = One Responsibility?** (Separate complex tasks.)
12. **Granularity specific?** (Atomic steps.)
13. **Uncertainty handling defined?** (Require "UNKNOWN".)
14. **Zero redundancy?** (Remove repetitions.)

**Action:**
- Perform a point-by-point critique of the draft.
- Rewrite the prompt to eliminate all violations.

Output:
- Final, implementation-ready Agent Specification.
- A verification report showing compliance with all 14 principles.

Set:
`mode: finalized`

---

## Implementation-Ready Definition

A prompt is complete only if:
- It contains **zero** prohibited abstract words.
- All success criteria are binary/verifiable.
- The output format is strictly defined (Markdown/JSON/etc.).
- It includes a "Boundaries" or "Prohibitions" section.
- It is less than 300 lines (Instruction Budget).
