---
name: story-slicing
description: Slice a story into a small vertical increment that can be built, previewed, reviewed, and shipped safely.
---

# When to Use
Use this when the user says things like:
- "make this smaller"
- "what is the MVP?"
- "slice this for one PR"
- "what can we ship this week?"
- "reduce scope"

# Inputs
- an epic, story, or requirement
- technical constraints if known
- release risk if known

# Workflow
1. Identify the end-to-end user outcome.
2. Remove non-essential scope.
3. Keep one coherent user-visible increment.
4. Propose one safe branch / PR-sized slice.
5. Call out what is deferred.
6. Note preview steps, flags, and rollout risk.

# Output Format
Return:
- smallest shippable slice
- included scope
- deferred scope
- acceptance criteria
- affected areas
- preview / release notes
