---
name: image2-codex-pet
description: Generate a Codex-selectable animated desktop pet from one or more character reference images using Image2/image_gen row-strip generation, then package the final spritesheet, per-state GIF previews, and editable intermediate frames. Use when the user wants a cute custom Codex pet, asks to turn an image into a desktop pet, wants a pet like the built-in pets with multiple actions, or wants to improve stiff pet motion with freshly generated per-frame art.
---

# Image2 Codex Pet

Create a Codex custom pet that feels like a real animated desktop companion, not a static image being moved around.

Use this skill together with:

- `$imagegen` / built-in `image_gen` for visual generation.
- This skill's `scripts/package_from_strips.js` for deterministic packaging.

## Output Contract

Create these outputs every time:

- Codex package under `${CODEX_HOME:-$HOME/.codex}/pets/<pet-id>/`
  - `pet.json`
  - `spritesheet.webp`
- Working run folder with:
  - `final/spritesheet.webp`
  - `final/spritesheet.png`
  - `final/validation.json`
  - `qa/contact-sheet.png`
  - `qa/previews/*.gif`
  - `intermediate/generated-strips/*.png`
  - `intermediate/frames/<state>/*.png`
  - `intermediate/frame-manifest.json`

Atlas requirements:

- `1536x1872`
- `8` columns x `9` rows
- `192x208` per cell
- transparent background
- unused cells fully transparent

Rows use Codex's fixed state names. By default, make the running rows literal cute locomotion so the pet behaves like Codex's built-in desktop pets. Use the non-running action taxonomy only when the user explicitly asks to cancel running or replace locomotion with richer semantic actions.

0. `idle` - 6 frames
1. `running-right` - 8 frames, cute right-facing run cycle
2. `running-left` - 8 frames, usually derived by mirroring `running-right`
3. `waving` - 4 frames
4. `jumping` - 5 frames
5. `failed` - 8 frames
6. `waiting` - 6 frames
7. `running` - 6 frames, forward-facing active run / dash / excited movement
8. `review` - 6 frames

Default fixed-row mapping:

- `idle`: Basic standing plus subtle happy/thinking variation.
- `running-right` / `running-left`: A readable chibi run cycle with alternating feet, arm swing, hair bounce, and lively expression.
- `waving`: Basic waving or welcome.
- `jumping`: Emotion happy/laughing or Status success/upgrade.
- `failed`: Status failure/warning plus Emotion crying/surprised.
- `waiting`: Emotion thinking/surprised or user-input expectation.
- `running`: Active movement, dash-in-place, energetic trot, or excited quick step.
- `review`: Office reading documents plus Emotion thinking.

Optional action categories to draw from when the user asks for richer or non-running behavior:

- Basic: standing, waving, hands on hips, arms crossed
- Emotion: happy, laughing, surprised, angry, crying, thinking
- Office: coding, meeting, reading documents, overtime
- Guidance: welcome, thumbs up, OK, pointing
- Status: success, failure, warning, upgrade

Optional non-running fixed-row mapping:

- `idle`: Basic standing plus subtle happy/thinking variation.
- `running-right` / `running-left`: Guidance movement, such as welcome, pointing, OK, or thumbs-up while sliding/floating sideways.
- `waving`: Basic waving or welcome.
- `jumping`: Emotion happy/laughing or Status success/upgrade.
- `failed`: Status failure/warning plus Emotion crying/surprised.
- `waiting`: Emotion thinking/surprised or Guidance pointing/OK while waiting for user input.
- `running`: Office coding/meeting/document/overtime, shown through gestures and expression only.
- `review`: Office reading documents plus Emotion thinking.

## Workflow

1. Inspect the user's reference image(s).
   - Prefer a clean, full-body or chibi reference for identity.
   - Use extra references only for outfit, expressions, mood, and props.
   - Infer a pet id and display name if the user does not provide them.

2. Define a concise visual lock.
   - Identify the 5-8 traits that must survive at pet size: hair shape, palette, eyes, head accessory, outfit silhouette, signature prop.
   - Make the pet cuter and more compact than the source unless the user asks for strict fidelity.

3. Generate one base reference with Image2.
   - Use a full-body chibi mascot on flat `#00ff00`.
   - Avoid scenery, text, shadows, glows, floating symbols, and detached effects.
   - The base reference locks identity for all row prompts.

4. Generate row strips with Image2.
   - Generate one horizontal strip per state except `running-left`.
   - Do not make the pet by moving one static image around.
   - Generate literal running by default for `running-right`, mirrored `running-left`, and the `running` row.
   - Use guidance/office alternatives for the fixed `running-*` state names only when the user explicitly asks for no running or non-running actions.
   - Each strip must contain distinct full-body poses arranged left-to-right on flat `#00ff00`.
   - Keep poses complete, separated, centered, and uncropped.
   - Use the prompt recipes in `references/prompts.md`.
   - Read `references/actions.md` when the user asks for named action categories or non-running behavior.

5. Save generated files in order.
   - Create a run folder.
   - Copy generated images to `intermediate/generated-strips/` as:
     - `00-base.png`
     - `01-idle.png`
     - `02-running-right.png`
     - `03-waving.png`
     - `04-jumping.png`
     - `05-failed.png`
     - `06-waiting.png`
     - `07-running.png`
     - `08-review.png`
   - Leave originals in `$CODEX_HOME/generated_images` unless the user explicitly asks to delete them.

6. Package with the script.

   ```powershell
   $env:NODE_PATH = "<workspace>\\.pet-tools\\node_modules"
   node "<skill-dir>\\scripts\\package_from_strips.js" `
     --run-dir "<absolute run dir>" `
     --pet-id "<pet-id>" `
     --display-name "<Display Name>" `
     --description "<short description>" `
     --strips-dir "<absolute run dir>\\intermediate\\generated-strips"
   ```

   If `sharp` or `gifenc` is missing, install locally in the workspace:

   ```powershell
   npm install sharp gifenc --no-save --prefix "<workspace>\\.pet-tools"
   ```

7. QA the result.
   - Open `qa/contact-sheet.png`.
   - Inspect GIFs under `qa/previews`.
   - Reject the package if any row has blank frames, cropped bodies, green residue, isolated fragments, wrong state semantics, or identity drift.
   - Regenerate only failing rows, replace their numbered strip files, and rerun the package script.

## Quality Rules

- Prefer cute, readable acting over exact costume detail.
- Use distinct expressions and poses in every row.
- Use the largest connected subject only; detached hearts, punctuation, sparkle marks, speed lines, dust, shadows, and UI are not part of the pet.
- Keep running rows cute and readable: clear alternating foot poses, arm swing, squash/stretch, and hair/accessory bounce. Avoid speed lines, dust, floor shadows, and cropped limbs.
- Use the action taxonomy in `references/actions.md` when the user wants richer behavior or explicitly cancels running.
- Derive `running-left` from `running-right` only when mirroring preserves identity; otherwise generate a left-facing strip and modify the script workflow accordingly.
- Preserve final outputs and intermediate frames so the pet can be edited later.

## Notes

The script intentionally:

- removes flat green backgrounds
- detects character components instead of blindly equal-slicing when possible
- keeps the largest component in each cell to remove detached effects
- exports both `spritesheet.webp` and GIF previews

This deterministic cleanup does not replace visual QA. Always inspect the contact sheet and the GIFs.
