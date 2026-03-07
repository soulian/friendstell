# AGENTS.md

## Mission
Build backlog-driven products quickly without losing the operating discipline of a senior product team.
Optimize for:
1. fast learning cycles
2. small vertical slices
3. reliable previews and safe releases
4. measurable outcomes
5. maintainable architecture

## Team model
Treat this repository like a cross-functional team made of:
- Senior PM/PO
- Senior GUI Designer
- Senior FE Engineer
- Senior BE Engineer
- Senior Data Engineer
- Senior Infra Engineer
- Senior QA / Release Manager

Delegate work to the matching subagent when the task naturally fits that role.

## Product operating model
Use this sequence by default:
1. Clarify the problem, target user, and success metric.
2. Convert the request into a backlog item or link to an existing one.
3. Slice work into the smallest shippable vertical increment.
4. Plan before coding.
5. Build behind flags when risk or uncertainty is non-trivial.
6. Validate in preview before merge.
7. Ship only when Definition of Done is met.
8. Capture learnings in docs if architecture or behavior changed.

## Backlog hierarchy
Use this hierarchy consistently:
- Initiative: multi-epic business goal
- Epic: coherent product outcome
- Story: user-visible increment
- Task: implementation or enabling work
- Bug: defect
- Tech Debt: maintainability / reliability / performance work
- Experiment: hypothesis-driven change with clear success metric

## Standard delivery cadence
For every new request:
1. Use the PM/PO subagent to produce a concise problem statement, scope, assumptions, and acceptance criteria.
2. Use the design subagent if UI, navigation, states, or usability are involved.
3. Use FE/BE/Data/Infra subagents to propose implementation workstreams.
4. Prefer one vertical slice that can be previewed and reviewed end-to-end.
5. Use the QA/Release subagent to define test scope and rollout checks.

## Definition of Ready
A story is ready only if it has:
- user/problem context
- explicit scope and out-of-scope
- acceptance criteria
- dependencies and blockers
- analytics / logging needs
- rollout notes when risk exists
- open questions called out explicitly

## Definition of Done
A change is done only if:
- acceptance criteria are met
- tests relevant to the change pass
- docs are updated if behavior, API, or operations changed
- analytics / logs / errors are addressed
- feature flag and rollback notes are defined if needed
- preview validation is complete
- PR description explains risk, test evidence, and rollout impact

## Branch / PR policy
Prefer short-lived branches and small PRs.
Default branch naming:
- feat/<issue-id>-<slug>
- fix/<issue-id>-<slug>
- chore/<issue-id>-<slug>

Default PR shape:
- one user-visible change or one tightly-related technical change
- include screenshots or preview links for UI work
- include migration / rollback notes for schema or config changes

## Planning policy
Before editing code:
1. summarize the request in 3-7 bullets
2. list affected files/modules
3. identify dependencies, risks, and unknowns
4. propose the smallest useful increment
5. wait for approval when the change is destructive, expensive, or architecture-altering

## Architecture / docs policy
When architecture changes, update:
- docs/adr
- docs/runbooks
- docs/prd or backlog notes if scope changed

## Analytics policy
Every user-facing feature should consider:
- success metric
- guardrail metric
- events / properties
- experiment or flag strategy if relevant

## Release policy
For risky work:
- use preview deployments
- validate happy path + edge cases
- gate rollout behind flags when possible
- document rollback path before merge

## Escalation rules
Stop and ask before:
- destructive database changes
- auth / permissions changes
- billing / payment changes
- secret or environment variable changes
- deleting large code paths
- disabling tests or protections

## Review style
When reviewing generated work:
- optimize for correctness first
- then safety, observability, UX, performance, and maintainability
- prefer simple solutions that fit existing patterns
