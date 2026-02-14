# Feedback Loop Design Guide

Use this guide when generating feedback loops for implementation specs. Each iterative component should define a playground, experiment, and check command so the executing agent can validate its work *during* implementation.

## Component-Type Mapping

Match the feedback mechanism to the component type:

| Component Type | Feedback Mechanism | Example |
|---|---|---|
| Data/logic layers | Test file — create a spec file with a describe block before writing the implementation | `pnpm test -- --filter bookmark-store` |
| UI components | Dev server or storybook — start before building, check renders after each change | `pnpm dev`, `pnpm storybook` |
| API endpoints | curl/httpie script or test harness — hit the endpoint after each route is added | `curl -s localhost:3000/api/bookmarks \| jq .` |
| CLI tools | The tool itself — run with test inputs after each subcommand is added | `./my-cli --help`, `./my-cli generate --dry-run` |
| Config/types/constants | Skip — no feedback loop needed, typecheck covers it | `pnpm typecheck` |

## Three Design Questions

For each component, answer:

### 1. What's the playground?

What environment lets the agent interact with its changes? The playground should be set up *before* writing implementation code.

- **Test suite**: Create the test file with a describe block and one smoke test before writing the module
- **Dev server**: Start it and navigate to the relevant page before building the component
- **Storybook**: Start it and create a story file before building the component
- **Script harness**: Create a shell script that exercises the module before implementing it
- **The tool itself**: For CLIs, the tool's own `--help` and subcommands are the playground

### 2. What's the experiment?

A parameterized, reproducible check. Not "does it work?" but "does it work with *these specific inputs*?" Good experiments:

- Exercise edge cases: empty state, single item, many items
- Test error paths: invalid input, missing data, network failure
- Use specific values: "test with 0, 1, and 100 bookmarks" not "test with some bookmarks"
- Are reproducible: same inputs produce same outputs every time

### 3. What's the fastest check?

A single command that runs in seconds and produces text output. The agent will run this dozens of times during implementation. Prefer:

- `pnpm test -- --filter {module}` over `pnpm test` (scoped, fast)
- `curl -s ... | jq .` over "open browser and check" (text, automatable)
- `pnpm typecheck` over `pnpm build` (faster, sufficient for type-only changes)

The inner-loop command should **run in seconds, not minutes**. If the check takes longer than 10 seconds, scope it tighter.

## When to Skip

Not every component needs a feedback loop. Skip it for:

- Type definition files
- Config changes
- Constant files
- Simple re-exports
- Migration files verified by the data layer's tests

**Rule of thumb**: "Will the agent make multiple iterations on this component?" If yes, add a loop. If it's write-once, skip it.

## Mapping Discovered Infrastructure to Playgrounds

When codebase exploration (Phase 2.2) discovers existing feedback tools, prefer them over creating new ones:

| Discovered Infrastructure | Use As Playground For |
|---|---|
| Test runner (jest, vitest, pytest, go test) | Data layers, logic modules, utilities |
| Dev server (vite, next, webpack-dev-server) | UI components, pages, layouts |
| Storybook | Isolated UI components, design system pieces |
| API testing tools (httpie, postman collections, test scripts) | API endpoints, middleware |
| Makefile / script harnesses | CLI tools, build tools, multi-step processes |

If the project has Storybook, prefer it as the UI playground over the dev server — it provides isolated component rendering. If the project has a test runner with watch mode, note it in the inner-loop command (e.g., `pnpm test --watch --filter {module}`).
