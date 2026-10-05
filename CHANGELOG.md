# Changelog

## 4.3.2 — Claude Code edition (`@patabrava/bridgecode-cli-claude`)

First release of the Claude Code edition. It is forked from the Codex edition 4.3.2 and coexists with it in the same repository.

- **Ownership.** The core and specialists are installed under `.claude/bridgecode/` and imported by a marked block in `CLAUDE.md`. A read-only `bridgecode-reviewer` subagent (`model: inherit`) is added. Hooks live in `.claude/settings.json`, with portable `$CLAUDE_PROJECT_DIR` commands, and metadata in `.bridgecode/claude-installation.json`. The edition never writes the Codex edition's `AGENTS.md`, `bridgecode/`, `.codex/` or metadata. Both editions share `agentic/` memory, and Codex bootstraps found in `CLAUDE.md` are reported, not edited.
- **Harness.** The policy names AskUserQuestion, Agent subagents (never `fork` for review), plan mode, the `!` prefix and the permission/sandbox model. Compaction recovery points to `agentic/analysis.md` instead of re-injecting the core.
- **Deeper Best Agent.** It loads for every task that changes code, content or configuration. The third move is an explicit error forecast revisited after research, before the first edit and before handoff; every item is closed with evidence or reported.
- **Memory over context anxiety.** `analysis.md` is written as work proceeds, with an evidence log and the specialists in use, and becomes the resume point. Claude trusts `analysis.md` and `architecture.md` for settled facts, re-verifies only what the next action depends on, never re-reads the loaded core, and never wraps up early for context.
- **Creative latitude.** Taste becomes "widen, then commit" with perspectives as lenses and a light quality floor. Writing separates editing fidelity from creative freedom. Prompting adopts Claude-oriented craft (explain why, generous varied examples, structure for parsing) and covers skills, subagents and hook messages. Copywriting explores concepts before committing.
- **Design without image generation.** The three generated reference images are replaced by a written direction plan in `agentic/design/DESIGN.md`: style direction, system grammar, and a wireframed representative view. The twelve failure models serve critique rather than gate first ideas.
- **CLI.** The AGENTS.md managed core, legacy rule migration and Codex snapshots are removed. Payload targets are restricted to the edition's own paths. Tests cover coexistence, settings preservation and canonical tampering, and fix two macOS temp-path test failures.

## Codex edition lineage

### 4.3.2

Embed proportionate engineering and stable acceptance/relevance gates in shared research, planning, execution, review and condensation stages. Preserve supported-path correctness and safety while excluding speculative requirements and optional refinements.

Replace recursive review with a fresh same-model/same-effort first verdict, at most one coherent correction stage, and a terminal same-model/same-effort PASS/UNRESOLVED verdict. Recovery preserves the cycle budget; no third implementation reviewer or reviewer-driven correction pass. Update hook/guide wording and include the exact 4.3.1 migration snapshot.

### 4.3.1

Restore the explicit every-turn route and analysis-file pointer, with a first-block three-move Best-Agent decision brief before task work. Follow-ups update one temporary board; completion condenses durable knowledge and removes completed state while preserving unfinished work.

Remove the AGENTS.md size rejection. Updates transactionally transfer recognized repo rules into architecture.md as binding, initially unverified constraints, preserve existing memory, and retain unrelated AGENTS blocks after the core. Add the exact 4.3.0 migration snapshot alongside 4.1.0. Size diagnostics and installed-hook checks remain informational about host behavior.

### 4.3.0

A compact permanent core replaces the always-loaded multi-process payload. Six specialists load at their action boundaries. ROBUST pauses on unresolved user decisions or requested checkpoints; native question cards compare evidenced perspectives or minimal complementary amalgams. Direct frontend authorship retains three-reference design exploration, shared Taste, and real UI acceptance. One coordinated regression block and a fresh native same-model reviewer govern implemented work, with a persistent second-REPLAN stop.

Architecture memory now points to verified code, constraints, and regression protection. Causal defects are corrected in code, with architectural change when structurally warranted. Legacy rules remain temporarily visible and urgent until individually reconciled; schema-2 installation separates them from package-owned instructions.

CLI changes add bounded Codex heartbeat/compact hooks, exact canonical verification, complete ownership coverage, linked-path rejection, collision checks, clean obsolete-file retirement, projected dry-run verification, genuine no-op validation, journaled recovery, and exact-artifact release testing. Known 4.1.0 migrations are supported through a trusted snapshot. Live hook delivery and model compliance are not certified by installation.

### 4.1.0

Initial public CLI release with repo-local installation, bounded instruction blocks, legacy repo rules, dry-run, doctor, custom harness bootstraps, and checksum-based updates.
