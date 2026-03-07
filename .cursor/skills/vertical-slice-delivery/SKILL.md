---
name: vertical-slice-delivery
description: Orchestrate PM, design, FE, BE, data, infra, and QA to deliver one small production-ready slice.
---

# When to Use
Use this when the user says things like:
- "implement this feature"
- "ship the next slice"
- "build this story"
- "take this from backlog to code"

# Inputs
- story or PRD
- current codebase context
- constraints and deadlines if known

# Workflow
1. Ask the pm-po subagent to restate scope and acceptance criteria.
2. Ask gui-designer if UI or interaction is involved.
3. Ask fe-engineer, be-engineer, data-engineer, and infra-engineer as needed.
4. Synthesize a small implementation plan.
5. Build in the smallest safe sequence.
6. Ask qa-release for validation and release notes.
7. Summarize risks, tests, and rollout.

# Output Format
Return:
- plan
- delegated concerns by role
- affected files/modules
- tests and preview steps
- rollout / rollback notes
