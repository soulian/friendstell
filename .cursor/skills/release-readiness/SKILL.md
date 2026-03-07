---
name: release-readiness
description: Check whether a change is ready to merge and release using preview, tests, flags, and rollback criteria.
---

# When to Use
Use this when the user says things like:
- "is this ready to ship?"
- "release check"
- "what is left before merge?"
- "prepare launch notes"
- "do a QA pass"

# Inputs
- PR or diff
- preview URL if available
- tests / screenshots / notes if available

# Workflow
1. Re-read acceptance criteria.
2. Verify tests, preview evidence, and documentation.
3. Check risky areas: auth, payments, env, migrations, observability.
4. Confirm rollout and rollback notes.
5. Separate must-fix blockers from follow-ups.
6. Produce merge/release recommendation.

# Output Format
Return:
- release verdict
- blockers
- follow-ups
- validation evidence needed
- rollout / rollback checklist
