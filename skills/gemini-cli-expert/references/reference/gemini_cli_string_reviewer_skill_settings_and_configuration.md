---
source_url: https://github.com/google-gemini/gemini-cli/blob/main/.gemini/skills/string-reviewer/references/settings.md
original_title: settings
fetched_at: 2026-03-11T11:00:42.504018+00:00
---

# Settings

## Noun-First Labeling (Scannability)

Labels must start with the subject of the setting, not the action. This allows
users to scan for the feature they want to change.

- **Rule:** `[Noun]` `[Attribute/Action]`
- **Example:** `Show line numbers` becomes simply `Line numbers`

## Positive Boolean Logic (Cognitive Ease)

Eliminate "double negatives." Booleans should represent the presence of a
feature, not its absence.

- **Rule:** Replace `Disable {feature}` or `Hide {Feature}` with
  `{Feature} enabled` or simply `{Feature}`.
- **Example:** Change "Disable auto update" to "Auto update".
- **Implementation:** Invert the boolean value in your config loader so true
  always equals `On`

## Verb Stripping (Brevity)

Remove redundant leading verbs like "Enable," "Use," "Display," or "Show" unless
they are part of a specific technical term.

- **Rule**: If the label works without the verb, remove it
- **Example**: Change `Enable prompt completion` to `Prompt completion`
