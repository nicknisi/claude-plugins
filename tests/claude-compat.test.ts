import test from 'node:test';
import assert from 'node:assert/strict';

import { askQuestions } from '../pi/extensions/claude-compat';

test('askQuestions allows a custom single-select answer via input', async () => {
  const selectCalls: Array<{ title: string; options: string[] }> = [];

  const result = await askQuestions(
    {
      hasUI: true,
      ui: {
        async select(title: string, options: string[]) {
          selectCalls.push({ title, options });
          return 'Other... (type your own answer)';
        },
        async input() {
          return 'Completely custom answer';
        },
      },
    } as any,
    [
      {
        header: 'Scope',
        question: 'What should we build?',
        options: [{ label: 'Option A' }, { label: 'Option B' }],
        multiSelect: false,
      },
    ],
  );

  assert.equal(
    selectCalls[0]?.options.at(-1),
    'Other... (type your own answer)',
  );
  assert.deepEqual(result.details.answers, [
    {
      header: 'Scope',
      question: 'What should we build?',
      answer: 'Completely custom answer',
    },
  ]);
});

test('askQuestions allows custom answers during multi-select prompts', async () => {
  const selections = [
    'Other... (type your own answer)',
    'Option B — Recommended',
    'Done',
  ];
  const inputs = ['Custom choice'];

  const result = await askQuestions(
    {
      hasUI: true,
      ui: {
        async select() {
          return selections.shift();
        },
        async input() {
          return inputs.shift();
        },
      },
    } as any,
    [
      {
        header: 'Features',
        question: 'Which items belong in scope?',
        options: [
          { label: 'Option A' },
          { label: 'Option B', description: 'Recommended' },
        ],
        multiSelect: true,
      },
    ],
  );

  assert.deepEqual(result.details.answers, [
    {
      header: 'Features',
      question: 'Which items belong in scope?',
      answer: ['Custom choice', 'Option B'],
    },
  ]);
});
