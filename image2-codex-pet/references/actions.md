# Action Taxonomy For Codex Pets

Codex pet atlases have fixed row names. Use literal running by default for the running rows so the pet behaves like built-in Codex pets. Use this table when the user asks for richer actions, mascot gestures, office states, guidance states, status reactions, or explicitly asks to replace running.

| Category | Actions | Good Row Targets |
| --- | --- | --- |
| Basic | standing, waving, hands on hips, arms crossed | idle, waving |
| Emotion | happy, laughing, surprised, angry, crying, thinking | idle, jumping, failed, waiting, review |
| Locomotion | running right, running left, dash-in-place, excited trot | running-right, running-left, running |
| Office | coding, meeting, reading documents, overtime | running only when user asks for non-running office behavior, review |
| Guidance | welcome, thumbs up, OK, pointing | waving, waiting, or running-right/running-left only when user asks for non-running guidance behavior |
| Status | success, failure, warning, upgrade | jumping, failed, waiting |

## Fixed Row Mapping

- `idle`: standing, happy, thinking, arms crossed, hands clasped. Keep it calm.
- `running-right`: right-facing cute run cycle with alternating legs, arm swing, hair bounce, and lively expression.
- `running-left`: mirror `running-right` unless asymmetrical props make mirroring wrong.
- `waving`: waving or welcome.
- `jumping`: success, upgrade, happy, laughing. Use vertical pose changes only.
- `failed`: failure, warning, surprised, crying, angry. Keep effects attached to the pet.
- `waiting`: thinking, surprised, pointing, OK, user-input expectation.
- `running`: energetic forward-facing run, dash-in-place, quick step, or excited movement.
- `review`: reading documents, thinking, checking, nodding.

## Non-Running Override

Use these alternatives only when the user explicitly asks for no running, cancels running, or asks for the running rows to carry semantic actions:

- `running-right`: right-facing guidance movement. Use pointing, welcome, OK, thumbs up, or a gentle sideways float. Do not show foot-running.
- `running-left`: mirror the guidance movement unless asymmetrical props make mirroring wrong.
- `running`: coding, meeting, reading documents, overtime, focused effort. This is active task work, not locomotion.

Add this prompt constraint for non-running overrides only:

```text
Do not show walking, jogging, sprinting, foot-running cadence, speed lines, dust, floor shadows, or motion trails.
```

## Prompt Constraints

For all generated rows, avoid detached visual clutter:

```text
No detached symbols, no readable text, no UI, no logos, no speed lines, no dust, no floor shadows, no motion trails.
```

For office actions, avoid readable text and UI:

```text
Use tiny abstract props only if needed, with no readable text, no UI, no code, no logos, and no detached icons.
```
