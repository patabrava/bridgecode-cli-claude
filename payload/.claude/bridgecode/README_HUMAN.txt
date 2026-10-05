BRIDGECODE 4.3.2 — CLAUDE CODE EDITION — QUICK GUIDE

Tell Claude the outcome you want. Bridgecode chooses ROBUST for consequential uncertainty and LEAN (PATCH, DEBUG, ASSESS) for sufficiently understood work. Both research as needed, resolve your decisions, define completion, execute within scope, validate, and check memory.

Install or update with the exact commands in the package README (@bridgecode/cli-claude). Start a new Claude Code session afterward. CLAUDE.md imports the core from .claude/bridgecode/CORE.md, so Claude has it from the first message; you should not have to mention it. Optional project hooks in .claude/settings.json add a short per-turn reminder and a recovery pointer after compaction; review them with /hooks.

If this repository also uses Codex, install the Codex edition (@bridgecode/cli) for Codex. The two editions coexist: Codex reads AGENTS.md and bridgecode/, Claude Code reads CLAUDE.md and .claude/bridgecode/, and both share agentic/ memory.

THE PROCESS

Every turn starts with an explicit route, each stage's action and reason, and a pointer to agentic/analysis.md. Its first block develops intent, a useful perspective (Person, Core, representative work) or small complementary amalgam, and an error forecast: the specific mistakes this task invites and the check that catches each. Best Agent is loaded for every task that changes code, content or configuration, and every forecast item is closed with evidence or reported before handoff. When your choice is needed, Claude asks one or two high-level questions through question cards. ROBUST pauses for decisions or checkpoints you requested; it continues when the contract is settled.

agentic/analysis.md is Claude's working memory for the current task: decision brief, acceptance checklist, evidence log, specialists in use, review-cycle state, and next action. Claude writes to it as it works and resumes from it after compaction instead of re-reading everything. agentic/architecture.md is the durable map Claude consults before exploring. Claude does not cut work short for context: compaction is automatic and the board carries the work forward.

Claude builds the smallest mechanism meeting the criteria and runs relevant real regression checks. One fresh read-only reviewer (the installed bridgecode-reviewer subagent, on Claude's same model) returns PASS, FIX, or REPLAN. PASS finishes after Claude verifies acceptance; FIX/REPLAN permits one coherent correction stage and one fresh terminal review: PASS or UNRESOLVED. UNRESOLVED stops the cycle and reports blockers. No third implementation reviewer and no budget reset on resume; a new instruction from you opens a new cycle.

DESIGN AND WRITING

Claude designs and implements frontends directly, with real creative latitude in the open choices. A full design direction explores a few directions, commits to one, and writes a direction plan in agentic/design/DESIGN.md (style direction, system grammar, and a wireframed representative view) before building. There is no image generation. The result is validated in the running app, and DESIGN.md is finalized from the working implementation. Small maintenance reuses the established system. Direction you supply stays fixed.

Writing, prompting and copy get creative freedom within the facts: voice, structure and concept are chosen for the actual subject and audience, then revised from the reader's side. Marketing uses credible customer benefits and useful next actions. Product interfaces explain user work rather than development internals.

MEMORY

agentic/architecture.md maps maintained files, ownership, data flow, constraints, and validation. When an error reveals a causal defect, Claude fixes the code; architectural changes are appropriate when the cause is structural. Constraints imported by the Codex edition stay binding and are reconciled with code and tests. Your own CLAUDE.md instructions outside the Bridgecode block are never moved or rewritten.

Same-task follow-ups update analysis.md in place. Paused work remains recoverable. Completion checks condensation and removes the finished task's section, deleting the board when no active work remains. Handoffs identify architecture.md, remaining work, exact relevant files, evidence limits, and the next step.

FILES

.claude/bridgecode/CORE.md is the permanent core; the specialists best-agent, taste, design, writing, copywriting and monoprompting sit beside it and load when triggered. .claude/agents/bridgecode-reviewer.md is the read-only reviewer. .claude/hooks/bridgecode-turn.mjs and two entries in .claude/settings.json provide the optional hooks. .bridgecode/claude-installation.json records the owned set.

A passing doctor establishes installed bytes and registration. It does not certify live hook execution, model compliance, or application behavior.
