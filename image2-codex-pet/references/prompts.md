# Image2 Codex Pet Prompt Recipes

Use these as compact prompt recipes. Replace bracketed text.

## Base Reference

```text
Create a chibi anime desktop pet BASE reference from the provided character image(s). Compact full-body desktop buddy, oversized head, tiny rounded body, [key hair], [key accessory], [key eye style], [key outfit colors], simplified for 192x208 cells. Make it adorable, soft, lively, and readable as a small desktop mascot. Sticker-like crisp line art, rounded silhouette, generous padding. Perfectly flat solid #00ff00 chroma-key background, no shadows, no scenery, no text, no watermark, no detached effects.
```

## Shared Row Prefix

```text
Using the same chibi desktop pet identity from the base reference, create one horizontal sprite strip for [STATE]. [N] separate full-body frames arranged left to right, equal spacing, no borders or labels. Same mascot every frame: [identity lock]. Soft cute lively sticker style, compact readable desktop pet proportions. Complete centered poses, no cropping, no overlap. Perfectly flat solid #00ff00 chroma-key background, no shadows, no scenery, no text, no watermark.
```

## Row Acting Notes

### IDLE, 6 frames

```text
Make it cuter than a simple bob: frame 1 hands clasped smiling, frame 2 tiny bounce with hair lift, frame 3 slow blink and blush, frame 4 eyes open with tiny head tilt, frame 5 shy smile with hands squeezed, frame 6 relaxed return. No floating hearts or symbols.
```

### RUNNING-RIGHT, 8 frames

```text
Make this a cute right-facing chibi run cycle like a built-in desktop pet. Frame 1 ready lean, frame 2 right foot forward with arm swing, frame 3 passing pose with tiny squash, frame 4 left foot forward with hair bounce, frame 5 airborne happy step, frame 6 landing step, frame 7 energetic push-off, frame 8 loop return. Keep limbs complete and readable. No speed lines, no dust, no floor shadows, no motion trails.
```

### WAVING, 4 frames

```text
Make it extremely cute: frame 1 shy hands near chest, frame 2 one hand lifts with bright smile, frame 3 big cheerful high wave with closed smiling eyes, frame 4 returns with tiny happy bounce. Wave shown only by arm and hand pose, no wave marks, no floating hearts, no symbols.
```

### JUMPING, 5 frames

```text
Make it very cute and bouncy: frame 1 tiny crouch anticipation with cheeks puffed, frame 2 spring upward arms open, frame 3 peak jump with feet tucked and delighted face, frame 4 descending with hair floating, frame 5 soft landing with happy smile. No shadows, no dust, no floor, no floating effects.
```

### FAILED, 8 frames

```text
Make it adorable and expressive, not dramatic: frame 1 surprised little O mouth, frame 2 nervous clasped hands, frame 3 teary pout, frame 4 shoulders droop, frame 5 eyes closed tiny slump, frame 6 peek up shyly, frame 7 small hopeful recovery, frame 8 soft embarrassed smile. Tears may be attached on cheek only, no detached tear drops, no red X, no floating symbols.
```

### WAITING, 6 frames

```text
Make it sweet and expectant: frame 1 looks up with hands clasped, frame 2 head tilt left curious, frame 3 raises one tiny hand as if asking, frame 4 bright hopeful smile, frame 5 shy little bounce, frame 6 patient waiting pose. No question marks, no floating symbols, no detached effects.
```

### RUNNING, 6 frames

```text
Make an energetic front-facing active run / dash-in-place strip. Frame 1 ready crouch with determined smile, frame 2 tiny quick step right, frame 3 quick step left, frame 4 bouncy airborne step, frame 5 excited forward dash pose, frame 6 loop return with bright expression. Keep it cute, compact, full-body, and readable. No speed lines, no dust, no floor shadows, no motion trails.
```

### REVIEW, 6 frames

```text
Make it cute and thoughtful: frame 1 curious neutral, frame 2 tiny head tilt with hand near chin, frame 3 leans forward inspecting, frame 4 slow blink thinking, frame 5 small satisfied nod with smile, frame 6 calm confident return. No magnifying glass, no papers, no laptop, no UI, no punctuation, no floating symbols.
```

## Optional Action Swap Prompts

Use these when the user asks for specific categories.

### NON-RUNNING GUIDANCE SWAP FOR RUNNING-RIGHT

```text
Do not make this a run. Make it a cute right-facing guidance movement: the pet gently slides or floats to the right while welcoming, pointing, giving OK, or giving a thumbs-up. Frame 1 faces right with friendly smile, frame 2 points right, frame 3 tiny sideways bounce, frame 4 OK gesture, frame 5 thumbs-up, frame 6 welcoming open hand, frame 7 determined guide pose, frame 8 soft return. No walking, no jogging, no foot-running cadence, no speed lines, no dust, no motion trails.
```

### NON-RUNNING OFFICE SWAP FOR RUNNING

```text
This is office/task work, not running. Make it cute and busy using office-style acting: frame 1 coding concentration gesture with tiny abstract keyboard-like prop or hand pose, frame 2 meeting/listening pose, frame 3 reading document pose with no readable text, frame 4 overtime sleepy-but-working pose, frame 5 idea/successful fix pose, frame 6 satisfied focused smile. No walking, no jogging, no foot-running cadence, no readable text, no UI, no code, no logos, no floating symbols.
```

### BASIC: hands on hips / arms crossed

```text
Make a basic confidence strip: standing, hands on hips, arms crossed, tiny nod, proud smile, relaxed return. Keep it cute, compact, and readable. No props, no text.
```

### EMOTION: happy / laugh / surprise / angry / cry / think

```text
Make an emotion strip with clear expression changes: happy smile, big laugh, surprised O mouth, tiny angry pout, teary-eyed cry with tears attached to cheeks only, thoughtful hand-near-chin return. No detached symbols.
```

### OFFICE: coding / meeting / docs / overtime

```text
Make an office strip: coding concentration with abstract hand pose, meeting/listening nod, reading a blank document, tired overtime blink, idea moment, satisfied finish. No readable text, no UI, no code, no logos.
```

### GUIDANCE: welcome / thumbs up / OK / pointing

```text
Make a guidance strip: welcoming open hand, thumbs up, OK gesture, pointing direction, cheerful nod, soft return. No arrows, no floating icons, no text.
```

### STATUS: success / failure / warning / upgrade

```text
Make a status strip: success cheer, failure pout, warning surprised pose, upgrade excited pose, confident recovery. Use only body pose and expression; avoid detached badges, warning icons, arrows, or text.
```
