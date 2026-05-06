import type {
  ExtensionAPI,
  ExtensionContext,
} from '@mariozechner/pi-coding-agent';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Type } from 'typebox';

type QuestionOption = { label: string; description?: string };
type Question = {
  question: string;
  header: string;
  options: QuestionOption[];
  multiSelect: boolean;
};

type CompatTask = {
  id: string;
  subject: string;
  description?: string;
  activeForm?: string;
  status: string;
  blockedBy: string[];
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
};

const MAX_TOOL_TEXT_BYTES = 50 * 1024;
let taskQueue = Promise.resolve();
let todos: unknown[] = [];

function truncateText(text: string, maxBytes = MAX_TOOL_TEXT_BYTES) {
  const bytes = Buffer.byteLength(text, 'utf8');
  if (bytes <= maxBytes) return text;

  let out = text;
  while (Buffer.byteLength(out, 'utf8') > maxBytes) {
    out = out.slice(0, Math.floor(out.length * 0.9));
  }
  return `${out}\n\n[Truncated from ${bytes} bytes to ${Buffer.byteLength(out, 'utf8')} bytes.]`;
}

function optionDisplay(option: QuestionOption) {
  return option.description
    ? `${option.label} — ${option.description}`
    : option.label;
}

async function askQuestions(ctx: ExtensionContext, questions: Question[]) {
  const answers: Array<{
    header: string;
    question: string;
    answer: string | string[];
  }> = [];

  if (!ctx.hasUI) {
    return {
      content: [
        {
          type: 'text' as const,
          text:
            'Structured questions require Pi interactive/RPC UI. Ask the user these questions in plain text instead:\n\n' +
            questions
              .map(
                (q, i) =>
                  `${i + 1}. ${q.question}\n` +
                  q.options.map(o => `   - ${optionDisplay(o)}`).join('\n'),
              )
              .join('\n\n'),
        },
      ],
      details: { questions, answers: [] },
    };
  }

  for (const q of questions) {
    if (q.multiSelect) {
      const selected: string[] = [];
      const remaining = [...q.options];

      while (remaining.length > 0) {
        const done = selected.length > 0 ? 'Done' : 'Skip';
        const choices = [...remaining.map(optionDisplay), done];
        const choice = await ctx.ui.select(
          selected.length > 0
            ? `${q.question} (selected: ${selected.join(', ')})`
            : q.question,
          choices,
        );

        if (!choice || choice === done) break;
        const index = remaining.findIndex(
          option => optionDisplay(option) === choice,
        );
        if (index >= 0) {
          selected.push(remaining[index]!.label);
          remaining.splice(index, 1);
        }
      }

      answers.push({
        header: q.header,
        question: q.question,
        answer: selected,
      });
    } else {
      const choices = q.options.map(optionDisplay);
      const choice = await ctx.ui.select(q.question, choices);
      const option = q.options.find(
        candidate => optionDisplay(candidate) === choice,
      );
      answers.push({
        header: q.header,
        question: q.question,
        answer: option?.label ?? choice ?? '',
      });
    }
  }

  return {
    content: [
      {
        type: 'text' as const,
        text:
          'User answered structured questions:\n' +
          answers
            .map(answer => {
              const value = Array.isArray(answer.answer)
                ? answer.answer.join(', ')
                : answer.answer;
              return `- ${answer.header}: ${value}`;
            })
            .join('\n'),
      },
    ],
    details: { questions, answers },
  };
}

function taskFile(ctx: ExtensionContext) {
  return join(ctx.cwd, '.pi', 'claude-compat', 'tasks.json');
}

async function readTasks(ctx: ExtensionContext): Promise<CompatTask[]> {
  try {
    const raw = await readFile(taskFile(ctx), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.tasks) ? parsed.tasks : [];
  } catch {
    return [];
  }
}

async function writeTasks(ctx: ExtensionContext, tasks: CompatTask[]) {
  const file = taskFile(ctx);
  await mkdir(join(ctx.cwd, '.pi', 'claude-compat'), { recursive: true });
  await writeFile(file, `${JSON.stringify({ tasks }, null, 2)}\n`, 'utf8');
}

function withTaskMutation<T>(fn: () => Promise<T>): Promise<T> {
  const run = taskQueue.then(fn, fn);
  taskQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function formatTasks(tasks: CompatTask[]) {
  if (tasks.length === 0) return 'No tasks.';
  return tasks
    .map(task => {
      const blocked =
        task.blockedBy.length > 0
          ? ` blockedBy=${task.blockedBy.join(',')}`
          : '';
      return `- ${task.id} [${task.status}]${blocked} ${task.subject}`;
    })
    .join('\n');
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function registerAskUserQuestion(pi: ExtensionAPI, name: string) {
  pi.registerTool({
    name,
    label: name,
    description:
      'Ask the user 1-4 structured clarifying questions with 2-4 options each. Claude Code compatibility shim for AskUserQuestion.',
    promptSnippet:
      'Ask the user structured clarifying questions with selectable options',
    promptGuidelines: [
      `Use ${name} when a loaded skill asks for AskUserQuestion or structured user clarification.`,
    ],
    parameters: Type.Object({
      questions: Type.Array(
        Type.Object({
          question: Type.String({
            description: 'Full question text shown to the user',
          }),
          header: Type.String({
            description: 'Short label, max 12 characters',
          }),
          options: Type.Array(
            Type.Object({
              label: Type.String(),
              description: Type.Optional(Type.String()),
            }),
            { minItems: 2, maxItems: 4 },
          ),
          multiSelect: Type.Boolean(),
        }),
        { minItems: 1, maxItems: 4 },
      ),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      return askQuestions(ctx, params.questions as Question[]);
    },
  });
}

export default function claudeCompat(pi: ExtensionAPI) {
  pi.on('before_agent_start', event => ({
    systemPrompt:
      event.systemPrompt +
      `\n\nClaude Code compatibility shims are installed for this session. When a loaded Claude Code plugin/skill mentions Claude tool names, map them as follows:\n- AskUserQuestion: use the AskUserQuestion compatibility tool.\n- WebFetch/WebSearch/TodoWrite/TaskCreate/TaskUpdate/TaskList/TaskGet: use the same-named compatibility tools.\n- Task or Agent subagents: use Pi's subagent tool from pi-subagents when available.\n- Glob: use find. Grep: use grep. LS: use ls. MultiEdit: use edit with multiple edits[].\n- MCP tools are not automatically emulated unless a dedicated Pi extension provides them; use available web/search/subagent/bash fallbacks instead.`,
  }));

  registerAskUserQuestion(pi, 'AskUserQuestion');

  pi.registerTool({
    name: 'WebFetch',
    label: 'WebFetch',
    description:
      'Fetch a URL and return readable text. Claude Code compatibility shim for WebFetch; output is truncated to 50KB.',
    promptSnippet: 'Fetch a URL and return readable text content',
    promptGuidelines: [
      "Use WebFetch when a loaded skill asks for Claude Code's WebFetch tool.",
    ],
    parameters: Type.Object({
      url: Type.String({ description: 'HTTP or HTTPS URL to fetch' }),
      prompt: Type.Optional(
        Type.String({
          description: 'Optional extraction/summarization instruction',
        }),
      ),
    }),
    async execute(_toolCallId, params, signal) {
      const url = new URL(params.url);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(`Unsupported URL protocol: ${url.protocol}`);
      }

      const response = await fetch(url, { signal });
      const contentType = response.headers.get('content-type') ?? '';
      const raw = await response.text();
      const text = contentType.includes('html') ? stripHtml(raw) : raw;
      const prompt = params.prompt ? `Prompt: ${params.prompt}\n\n` : '';

      return {
        content: [
          {
            type: 'text' as const,
            text: truncateText(
              `${prompt}Fetched ${url.toString()} (${response.status} ${response.statusText}, ${contentType || 'unknown content-type'})\n\n${text}`,
            ),
          },
        ],
        details: { url: url.toString(), status: response.status, contentType },
      };
    },
  });

  pi.registerTool({
    name: 'WebSearch',
    label: 'WebSearch',
    description:
      'Best-effort web search via DuckDuckGo HTML. Claude Code compatibility shim for lightweight research.',
    promptSnippet:
      'Search the web and return result titles, URLs, and snippets',
    promptGuidelines: [
      "Use WebSearch when a loaded skill asks for Claude Code's WebSearch tool, but prefer dedicated researcher tools when available.",
    ],
    parameters: Type.Object({
      query: Type.String(),
      allowed_domains: Type.Optional(Type.Array(Type.String())),
      blocked_domains: Type.Optional(Type.Array(Type.String())),
    }),
    async execute(_toolCallId, params, signal) {
      const searchUrl = new URL('https://html.duckduckgo.com/html/');
      searchUrl.searchParams.set('q', params.query);
      const response = await fetch(searchUrl, {
        signal,
        headers: { 'user-agent': 'pi-claude-compat/0.1' },
      });
      const html = await response.text();
      const results: Array<{ title: string; url: string; snippet: string }> =
        [];
      const linkRe =
        /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
      const allowed = new Set(
        (params.allowed_domains ?? []).map((domain: string) =>
          domain.toLowerCase(),
        ),
      );
      const blocked = new Set(
        (params.blocked_domains ?? []).map((domain: string) =>
          domain.toLowerCase(),
        ),
      );

      for (const match of html.matchAll(linkRe)) {
        let resultUrl = match[1] ?? '';
        const uddg = /[?&]uddg=([^&]+)/.exec(resultUrl);
        if (uddg) resultUrl = decodeURIComponent(uddg[1]!);

        try {
          const host = new URL(resultUrl).hostname.toLowerCase();
          if (
            allowed.size > 0 &&
            ![...allowed].some(
              domain => host === domain || host.endsWith(`.${domain}`),
            )
          ) {
            continue;
          }
          if (
            [...blocked].some(
              domain => host === domain || host.endsWith(`.${domain}`),
            )
          ) {
            continue;
          }
        } catch {
          continue;
        }

        results.push({
          title: stripHtml(match[2] ?? ''),
          url: resultUrl,
          snippet: stripHtml(match[3] ?? ''),
        });
        if (results.length >= 8) break;
      }

      return {
        content: [
          {
            type: 'text' as const,
            text:
              results.length === 0
                ? `No search results found for: ${params.query}`
                : results
                    .map(
                      (result, index) =>
                        `${index + 1}. ${result.title}\n${result.url}\n${result.snippet}`,
                    )
                    .join('\n\n'),
          },
        ],
        details: { query: params.query, results },
      };
    },
  });

  pi.registerTool({
    name: 'TodoWrite',
    label: 'TodoWrite',
    description:
      'Maintain an in-session todo list. Claude Code compatibility shim for TodoWrite.',
    promptSnippet: 'Record or update a todo list for the current task',
    promptGuidelines: [
      "Use TodoWrite when a loaded skill asks for Claude Code's TodoWrite tool.",
    ],
    parameters: Type.Object({
      todos: Type.Array(Type.Object({}, { additionalProperties: true })),
    }),
    async execute(_toolCallId, params) {
      todos = params.todos as unknown[];
      return {
        content: [
          {
            type: 'text' as const,
            text: `Updated todo list with ${todos.length} item(s).`,
          },
        ],
        details: { todos },
      };
    },
  });

  pi.registerTool({
    name: 'TaskList',
    label: 'TaskList',
    description:
      'List file-backed compatibility tasks stored in .pi/claude-compat/tasks.json.',
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      const tasks = await readTasks(ctx);
      return {
        content: [{ type: 'text' as const, text: formatTasks(tasks) }],
        details: { tasks },
      };
    },
  });

  pi.registerTool({
    name: 'TaskGet',
    label: 'TaskGet',
    description: 'Read one file-backed compatibility task by id.',
    parameters: Type.Object({ id: Type.String() }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const tasks = await readTasks(ctx);
      const task = tasks.find(candidate => candidate.id === params.id);
      if (!task) throw new Error(`Task not found: ${params.id}`);
      return {
        content: [
          { type: 'text' as const, text: JSON.stringify(task, null, 2) },
        ],
        details: { task },
      };
    },
  });

  pi.registerTool({
    name: 'TaskCreate',
    label: 'TaskCreate',
    description:
      'Create a file-backed compatibility task in .pi/claude-compat/tasks.json.',
    parameters: Type.Object({
      subject: Type.String(),
      description: Type.Optional(Type.String()),
      activeForm: Type.Optional(Type.String()),
      status: Type.Optional(Type.String()),
      blockedBy: Type.Optional(Type.Array(Type.String())),
      metadata: Type.Optional(Type.Any()),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      return withTaskMutation(async () => {
        const tasks = await readTasks(ctx);
        const now = new Date().toISOString();
        const task: CompatTask = {
          id: `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
          subject: params.subject,
          description: params.description,
          activeForm: params.activeForm,
          status: params.status ?? 'pending',
          blockedBy: params.blockedBy ?? [],
          metadata: params.metadata,
          createdAt: now,
          updatedAt: now,
        };
        tasks.push(task);
        await writeTasks(ctx, tasks);
        return {
          content: [
            {
              type: 'text' as const,
              text: `Created ${task.id}: ${task.subject}`,
            },
          ],
          details: { task, tasks },
        };
      });
    },
  });

  pi.registerTool({
    name: 'TaskUpdate',
    label: 'TaskUpdate',
    description:
      'Update a file-backed compatibility task in .pi/claude-compat/tasks.json.',
    parameters: Type.Object({
      id: Type.String(),
      subject: Type.Optional(Type.String()),
      description: Type.Optional(Type.String()),
      activeForm: Type.Optional(Type.String()),
      status: Type.Optional(Type.String()),
      blockedBy: Type.Optional(Type.Array(Type.String())),
      addBlockedBy: Type.Optional(Type.Array(Type.String())),
      removeBlockedBy: Type.Optional(Type.Array(Type.String())),
      metadata: Type.Optional(Type.Any()),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      return withTaskMutation(async () => {
        const tasks = await readTasks(ctx);
        const task = tasks.find(candidate => candidate.id === params.id);
        if (!task) throw new Error(`Task not found: ${params.id}`);

        if (params.subject !== undefined) task.subject = params.subject;
        if (params.description !== undefined)
          task.description = params.description;
        if (params.activeForm !== undefined)
          task.activeForm = params.activeForm;
        if (params.status !== undefined) task.status = params.status;
        if (params.blockedBy !== undefined) task.blockedBy = params.blockedBy;
        if (params.addBlockedBy !== undefined)
          task.blockedBy = [
            ...new Set([...task.blockedBy, ...params.addBlockedBy]),
          ];
        if (params.removeBlockedBy !== undefined) {
          const remove = new Set(params.removeBlockedBy);
          task.blockedBy = task.blockedBy.filter(id => !remove.has(id));
        }
        if (params.metadata !== undefined) task.metadata = params.metadata;
        task.updatedAt = new Date().toISOString();

        await writeTasks(ctx, tasks);
        return {
          content: [
            {
              type: 'text' as const,
              text: `Updated ${task.id}: ${task.subject}`,
            },
          ],
          details: { task, tasks },
        };
      });
    },
  });
}
