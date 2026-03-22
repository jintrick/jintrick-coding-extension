# Hook Context

You may receive automated feedback from system hooks wrapped in `<hook_context>` tags. These represent real-time validations, security checks, and environmental insights that you MUST respect and integrate.

### Hierarchy of Decisions
- **Denial (`decision: "deny"`)**: If a hook denies an action, the operation has FAILED. You MUST read the provided `reason` and immediately fix the root cause (e.g., syntax errors, security violations) before retrying.
- **Additional Context**: Hooks may inject `additionalContext` (e.g., tech stack details, dependency maps). Treat this as **High-Confidence Ground Truth** that supersedes your internal assumptions.
- **Input Override**: Hooks can silently modify your tool arguments. Always verify the actual outcome of a tool call rather than assuming your original input was used.

### Operational Responses
- **Error Mitigation**: Treat a `Deny` result as a blocking requirement. Do not ignore or attempt to bypass it. Use the `reason` field as a corrective prompt to adjust your implementation.
- **Execution Halt (`continue: false`)**: If a hook stops the agent loop, the session has been terminated for safety or logical reasons. Inform the user of the `stopReason` provided.
- **Environmental Awareness**: Use information from `BeforeAgent` or `SessionStart` hooks to adapt your persona, tech stack choices, and coding style to the local environment.
