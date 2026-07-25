import { GoogleGenAI } from '@google/genai';
import OpenAI, { toFile } from 'openai';
import { parseArgs } from 'node:util';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

type Provider = 'gemini' | 'openai';
type Resolution = '1K' | '2K' | '4K';
type Quality = 'low' | 'medium' | 'high' | 'auto';

const OPENAI_RESOLUTION_MAP: Record<Resolution, string> = {
  '1K': '1024x1024',
  '2K': '2048x2048',
  '4K': '3840x2160',
};

// Gemini takes the resolution label verbatim as imageConfig.imageSize, so the
// valid set is just the keys above — derive it rather than spelling it twice.
const RESOLUTIONS = Object.keys(OPENAI_RESOLUTION_MAP) as Resolution[];

const { values } = parseArgs({
  options: {
    prompt: { type: 'string' },
    filename: { type: 'string' },
    'input-image': { type: 'string', multiple: true },
    mask: { type: 'string' },
    resolution: { type: 'string', default: '1K' },
    size: { type: 'string' },
    quality: { type: 'string' },
    provider: { type: 'string' },
    'api-key': { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
  strict: true,
});

const HELP = `Usage: generate_image.js --prompt <text> --filename <path> [options]

Generate or edit images via Google Gemini (nano-banana-pro) or OpenAI (gpt-image-2).

Required:
  --prompt <text>         Prompt describing the image to generate or edit.
  --filename <path>       Output PNG path.

Provider & auth:
  --provider <name>       gemini | openai. Default: gemini, unless only
                          OPENAI_API_KEY is set (then openai).
  --api-key <key>         API key for the selected provider. Overrides env.

Resolution / size:
  --resolution <size>     1K | 2K | 4K (default: 1K).
                          Gemini: 1024 / 2048 / 4096.
                          OpenAI: 1024x1024 / 2048x2048 / 3840x2160.
  --size <WxH>            OpenAI only. Overrides --resolution. Max edge 3840;
                          both edges must be multiples of 16.

Quality (OpenAI only):
  --quality <level>       low | medium | high | auto (default: auto).
                          Ignored on Gemini with a warning.

Editing:
  --input-image <path>    Switch to edit mode using this image as input.
                          Repeatable on Gemini for multi-image composition
                          (e.g., combine subjects from multiple photos).
                          OpenAI accepts only one.
  --mask <path>           OpenAI only. Inpainting mask. Requires --input-image.

Other:
  -h, --help              Show this help.

Env vars:
  GEMINI_API_KEY, GOOGLE_API_KEY    Gemini provider.
  OPENAI_API_KEY                    OpenAI provider.

Examples:
  node generate_image.js --prompt "sunset over mountains" --filename out.png
  node generate_image.js --prompt "add aurora" --filename out.png \\
      --input-image photo.png --provider openai --resolution 2K
  node generate_image.js --prompt "replace sky" --filename out.png \\
      --input-image photo.png --mask mask.png --provider openai`;

if (values.help) {
  console.log(HELP);
  process.exit(0);
}

function die(msg: string): never {
  console.error(
    `Error: ${msg}\n\nRun with --help for the full flag reference.`,
  );
  process.exit(1);
}

if (!values.prompt || !values.filename) {
  die('--prompt and --filename are required.');
}

const resolution = values.resolution as Resolution;
if (!RESOLUTIONS.includes(resolution)) {
  die(`Invalid --resolution "${resolution}". Use ${RESOLUTIONS.join(', ')}.`);
}

const provider = resolveProvider(values.provider, values['api-key']);
const apiKey = resolveApiKey(provider, values['api-key']);

const inputImages = values['input-image'] ?? [];

if (values.mask && provider !== 'openai') {
  die('--mask is only supported with --provider openai.');
}
if (values.mask && inputImages.length === 0) {
  die('--mask requires --input-image.');
}
if (provider === 'openai' && inputImages.length > 1) {
  die(
    "OpenAI's edit endpoint accepts only one input image. Use --provider gemini for multi-image composition.",
  );
}
if (values.quality && provider !== 'openai') {
  console.warn('Warning: --quality is ignored for Gemini.');
}
if (values.size && provider !== 'openai') {
  console.warn(
    'Warning: --size is ignored for Gemini; use --resolution instead.',
  );
}

const outPath = resolve(values.filename);
await mkdir(dirname(outPath), { recursive: true });

const imageBase64 =
  provider === 'openai'
    ? await runOpenAI({
        apiKey,
        prompt: values.prompt,
        inputImage: inputImages[0],
        mask: values.mask,
        size: values.size ?? OPENAI_RESOLUTION_MAP[resolution],
        quality: (values.quality as Quality | undefined) ?? 'auto',
      })
    : await runGemini({
        apiKey,
        prompt: values.prompt,
        inputImages,
        resolution,
      });

await writeFile(outPath, Buffer.from(imageBase64, 'base64'));
console.log(`Image saved to: ${outPath}`);

function resolveProvider(
  flag: string | undefined,
  apiKeyFlag: string | undefined,
): Provider {
  if (flag) {
    if (flag !== 'gemini' && flag !== 'openai') {
      die(`Invalid --provider "${flag}". Use "gemini" or "openai".`);
    }
    return flag;
  }
  // Default: prefer gemini for back-compat with the former nano-banana-pro skill.
  // If only OPENAI_API_KEY is set (and no Gemini key, and no --api-key), route to openai.
  const hasGemini = !!(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  );
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  if (!apiKeyFlag && !hasGemini && hasOpenAI) return 'openai';
  return 'gemini';
}

function resolveApiKey(p: Provider, flag: string | undefined): string {
  if (flag) return flag;
  if (p === 'openai') {
    const k = process.env.OPENAI_API_KEY;
    if (!k) die('No OpenAI key. Pass --api-key or set OPENAI_API_KEY.');
    return k;
  }
  const k = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!k)
    die(
      'No Gemini key. Pass --api-key or set GEMINI_API_KEY / GOOGLE_API_KEY.',
    );
  return k;
}

async function runGemini(args: {
  apiKey: string;
  prompt: string;
  inputImages: string[];
  resolution: Resolution;
}): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: args.apiKey });
  const contents: Array<
    { inlineData: { mimeType: string; data: string } } | { text: string }
  > = [];

  for (const path of args.inputImages) {
    const imageData = await readFile(path);
    contents.push({
      inlineData: {
        mimeType: 'image/png',
        data: imageData.toString('base64'),
      },
    });
  }
  contents.push({ text: args.prompt });

  const response = await ai.models.generateContent({
    model: 'nano-banana-pro-preview',
    contents,
    config: {
      responseModalities: ['image', 'text'],
      imageConfig: { imageSize: args.resolution },
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.find(p =>
    p.inlineData?.mimeType?.startsWith('image/'),
  );
  if (!part?.inlineData?.data) {
    die('Gemini returned no image in the response.');
  }
  return part.inlineData.data;
}

async function runOpenAI(args: {
  apiKey: string;
  prompt: string;
  inputImage?: string;
  mask?: string;
  size: string;
  quality: Quality;
}): Promise<string> {
  const client = new OpenAI({ apiKey: args.apiKey });

  if (args.inputImage) {
    const image = await toFile(createReadStream(args.inputImage), null, {
      type: 'image/png',
    });
    const mask = args.mask
      ? await toFile(createReadStream(args.mask), null, { type: 'image/png' })
      : undefined;

    const result = await client.images.edit({
      model: 'gpt-image-2',
      image,
      ...(mask ? { mask } : {}),
      prompt: args.prompt,
      size: args.size as never,
    });
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) die('OpenAI returned no image in the edit response.');
    return b64;
  }

  const result = await client.images.generate({
    model: 'gpt-image-2',
    prompt: args.prompt,
    size: args.size as never,
    quality: args.quality as never,
  });
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) die('OpenAI returned no image in the generate response.');
  return b64;
}
