---
name: image-gen
description: >-
  Generate or edit images via Google Gemini (nano-banana-pro) or OpenAI
  gpt-image-2. Trigger on "generate image", "create diagram", "edit image",
  or "make illustration". Supports 1K/2K/4K resolution, masked inpainting,
  and text-accurate generation.
---

# Image Generation & Editing

Multi-provider image generation. Default provider is Gemini (nano-banana-pro); pass `--provider openai` to use gpt-image-2.

## Which provider to pick

- **Gemini (default):** general illustrations, quick diagrams, visual imagery. Accepts `--input-image` repeatedly for multi-image composition.
- **OpenAI:** anything where text rendering matters (infographics, slide-like images, dense-label diagrams, logos with text), or when you need masked inpainting on edits.

## Usage

The skill ships a pre-bundled Node script — no tsx or dependency install needed. The script's `--help` is the authoritative flag reference; run it rather than guessing:

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/image-gen/dist/generate_image.js --help
```

Generate:

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/image-gen/dist/generate_image.js \
  --prompt "your description" --filename "output.png"
```

Edit (image-to-image):

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/image-gen/dist/generate_image.js \
  --prompt "editing instructions" --filename "output.png" \
  --input-image "path/to/input.png"
```

## API keys

Read from the environment unless `--api-key` overrides: Gemini uses `GEMINI_API_KEY` or `GOOGLE_API_KEY`; OpenAI uses `OPENAI_API_KEY`. If only `OPENAI_API_KEY` is set, the provider defaults to OpenAI.

## Conventions

- Name files `YYYY-MM-DD-HH-MM-SS-descriptive-name.png`.
- For blog diagrams, use OpenAI at `2K` — anything with readable labels or callouts needs its text fidelity. Save to the post's content dir (e.g. `src/content/blog/post-name/`) and prefer clean, minimalist styles.
- The script prints the saved path. Report that path to the user; do not read the image back.
