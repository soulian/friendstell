---
name: backlog-to-epic
description: Convert a raw idea into a well-scoped epic with stories, dependencies, metrics, and release slices.
---

# When to Use
Use this when the user says things like:
- "turn this idea into backlog"
- "make an epic"
- "scope this feature"
- "what should we build first?"
- "break this into stories"

# Inputs
Expected inputs:
- problem statement or product idea
- target user / audience if known
- business goal or success metric if known
- constraints and deadlines if known

# Workflow
1. Clarify the user problem, business goal, and constraints.
2. Produce one epic statement.
3. Break the epic into the smallest meaningful stories.
4. For each story, define acceptance criteria and dependencies.
5. Separate must-have, should-have, and later.
6. Identify one recommended first shipping slice.
7. Add metrics, flags, and rollout notes if risk exists.

# Output Format
Return:
- Epic title
- Problem statement
- Target user / JTBD
- Scope / out-of-scope
- Stories
- Dependencies / blockers
- Metrics
- Recommended first slice
