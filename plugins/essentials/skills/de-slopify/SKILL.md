---
name: de-slopify
description: Remove code slop from the current branch
disable-model-invocation: true
---

# Remove AI code slop

The branch to diff against is $1. If no branch was provided, default to `main`.

Check the diff against the branch, and remove all AI generated slop introduced in this branch.

This includes:

- Extra comments that a human wouldn't add or is inconsistent with the rest of the file (useful doc comments are good to keep)
- Extra defensive checks or try/catch blocks that are abnormal for that area of the codebase (especially if called by trusted / validated codepaths)
- Casts to any to get around type issues
- Any other style that is inconsistent with the file

Report at the end with only a 1-3 sentence summary of what you changed
