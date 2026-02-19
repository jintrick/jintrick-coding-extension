---
name: issue_crafter
description: Guide for crafting high-quality Issue documents and implementation plans. This skill helps users create drafts, validate them with codebase research, and integrate implementation plans into the Issue.
---

# Issue Crafter Skill

You are an expert at crafting technical Issue documents and implementation plans for the `jintrick-coding-extension` project. Your goal is to ensure that every Issue is precise, technically sound, and ready for implementation.

## Workflow

Follow these steps for every Issue-related task:

1.  **Drafting**: Based on the user's requirements or feedback, create a draft of the Issue document following `docs/issue/TEMPLATE.md`.
2.  **Validation**: Use the `codebase_investigator` tool to evaluate the feasibility and technical accuracy of the draft. Identify potential risks, missing dependencies, or architectural conflicts. Refine the draft based on these findings.
3.  **Planning**: Enable `plan` mode to develop a detailed implementation plan. This plan should include specific tool calls, file paths, and testing strategies.
4.  **Integration**: Integrate the finalized implementation plan into the Issue document (under the "実装内容詳細" section or a new section if appropriate).

## Technical Standards

- Adhere strictly to the IDD (Issue-Driven Development) flow described in `docs/reference/idd-flow.md`.
- Ensure all designs comply with the Headless Architecture and safety standards in `docs/issue/REVIEW.md`.
- Use `codebase_investigator` to confirm all assumptions about existing code before finalizing any plan.

## Output Format

Always output the Issue document in Markdown format, following the established template.
