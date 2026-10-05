# Bridgecode 4.3.2 — Claude Code edition

Bridgecode gives Claude Code a compact operating policy, on-demand specialists, a read-only reviewer subagent, and repository memory grounded in verified code. `@patabrava/bridgecode-cli-claude` installs it locally with Node 22+ and no runtime dependencies. It does not add dependencies or lockfiles to your project. The short human guide is installed at `.claude/bridgecode/README_HUMAN.txt`.

> **Pick the edition that matches the harness doing the work.**
>
> | Harness | Package | Installs |
> | --- | --- | --- |
> | **Claude Code** | `@patabrava/bridgecode-cli-claude` (this package) | `CLAUDE.md` import, `.claude/bridgecode/`, `.claude/agents/bridgecode-reviewer.md`, `.claude/settings.json` hooks |
> | **Codex** | `@bridgecode/cli` | `AGENTS.md`, `bridgecode/`, `.codex/hooks.json` |
>
> A repository worked on by both harnesses can carry both editions. They own disjoint files and share `agentic/` memory. In that case, install the Codex edition with `--instruction-files agents` so it does not also register its bootstrap in `CLAUDE.md`.

**For agents:** read this README completely and inspect the target project before acting. Execute installation or update only when the user requests it. Preserve repository-owned content; stop on ambiguous ownership or integrity failures. Use the same exact package version for the dry-run, operation, and doctor.

## Copy into Claude Code: install

```text
Install Bridgecode 4.3.2 (Claude Code edition) in this repository. Read the package
README completely, inspect existing CLAUDE.md files, .claude/settings.json hooks and
any Codex edition files, and run the commands below in order. Proceed from dry-run
only if projected verification passes. Preserve unrelated instructions, settings,
hooks, Codex edition files and agentic/ memory. Report any conflict without
overwriting it. If the sandbox or a permission prompt blocks writes to .claude/,
stop and give me the commands to run myself with the ! prefix. Afterwards, tell me
to start a new Claude Code session and review the hooks with /hooks.

npx -y @patabrava/bridgecode-cli-claude@4.3.2 install --project . --dry-run
npx -y @patabrava/bridgecode-cli-claude@4.3.2 install --project .
npx -y @patabrava/bridgecode-cli-claude@4.3.2 doctor --project .
```

Claude Code's sandbox and permission rules usually protect `.claude/settings.json` and `.claude/hooks/`. Running the install yourself is the simplest path. Type each command with the `!` prefix in the Claude Code prompt, or run it in a normal terminal. A blocked write rolls the transaction back and leaves the project unchanged.

## Copy into Claude Code: update

```text
Update this repository to Bridgecode 4.3.2 (Claude Code edition). Read the package
README completely. Run the exact-version dry-run, update and doctor below. Preserve
unrelated CLAUDE.md content, settings, hooks, Codex edition files and agentic/
memory. Stop on integrity or ownership conflicts. Report installation integrity
separately from live hook delivery. Tell me to start a new session afterwards.

npx -y @patabrava/bridgecode-cli-claude@4.3.2 update --project . --dry-run
npx -y @patabrava/bridgecode-cli-claude@4.3.2 update --project .
npx -y @patabrava/bridgecode-cli-claude@4.3.2 doctor --project .
```

## What is installed

- **Core and specialists.** `.claude/bridgecode/CORE.md` is the package-owned core. Beside it are six specialists (Best Agent, Taste, design, writing, copywriting and monoprompting) and `README_HUMAN.txt`. The core loads specialists when their trigger applies.
- **Bootstrap.** Root `CLAUDE.md` gets one marked block (`bridgecode-claude:bootstrap`) whose `@.claude/bridgecode/CORE.md` line imports the core at session start. Everything else in `CLAUDE.md` stays yours, byte for byte. `--instruction-file .claude/CLAUDE.md` (or any other path ending in `CLAUDE.md`) adds a block there in addition to the root block, with an import path relative to that file. Combine it with `--instruction-files none` to use only the custom file. Claude Code loads `CLAUDE.md` and `.claude/CLAUDE.md` from the launch directory and its ancestors, so a nested `app/CLAUDE.md` only loads for sessions started inside `app/`. Doctor warns when no root-level bootstrap exists, and the hook then tells Claude to read the core itself. `--instruction-files none` alone registers no block; the core then loads only if you import it yourself.
- **Reviewer.** `.claude/agents/bridgecode-reviewer.md` is a read-only subagent (Read, Grep, Glob and inspection-only Bash, `model: inherit`). It performs Bridgecode's bounded implementation review on the session's own model.
- **Hooks.** These are enabled by default. `.claude/hooks/bridgecode-turn.mjs` and two entries are merged into `.claude/settings.json`. UserPromptSubmit adds a short per-turn reminder. SessionStart with matcher `compact` adds a recovery pointer to `agentic/analysis.md` after compaction. The commands use `$CLAUDE_PROJECT_DIR`, so the shared settings file works in every checkout. Unrelated settings keys, events and hook entries are preserved. Claude Code loads hooks at session start; review them with `/hooks`. Registration proves configuration, not live delivery or model compliance. Use `--no-hooks` to skip them.
- **Metadata.** `.bridgecode/claude-installation.json` records the complete owned set, version, hashes, bootstraps and hook registration.

`agentic/analysis.md` is the working memory of the current task: decision brief, checklist, evidence log, specialists in use, review status and next action. `agentic/architecture.md` maps the implemented system, responsible files, constraints and regression protection. Claude creates and maintains them during authorized project work. The installer never writes `agentic/`. Design memory uses `agentic/design/DESIGN.md`.

## Policy highlights of this edition

- **Best Agent runs deeper.** It loads for every task that changes code, content or configuration. Its third move is an explicit error forecast: the specific mistakes the task invites, each paired with the check that catches it, all closed before handoff.
- **Memory over re-reading.** Claude records findings in `analysis.md` as it works, trusts it and `architecture.md` for settled facts, and re-verifies only what the next action depends on. It does not re-read the core, and does not wrap up early for context, because compaction is automatic.
- **Creative latitude.** Writing, prompting and design widen the options, commit to a direction, and revise against a light quality floor instead of a gate.
- **Design is planned in writing.** There is no image generation. The direction plan (style direction, system grammar, wireframed representative view) lives in `agentic/design/DESIGN.md` and is proven in the running app.

The implementation review cycle is bounded. One fresh `bridgecode-reviewer` first review: PASS finishes after root verification, while FIX or REPLAN permits one correction stage and one fresh terminal PASS/UNRESOLVED review. Only evidenced acceptance blockers belong in review. UNRESOLVED stops that cycle, and recovery preserves its budget. The reviewer inherits the root's model. Claude Code does not expose the subagent's reasoning effort for verification, so it is recorded as inherited and unverified.

## Coexistence with the Codex edition

This edition never writes, moves or retires root `AGENTS.md`, `bridgecode/`, root `README_HUMAN.txt`, `.codex/`, `.bridgecode/installation.json` or `.bridgecode/transaction.json`. Install and doctor report a detected Codex edition as informational.

If `CLAUDE.md` also carries the Codex edition's bootstrap, Claude Code would read both cores. Doctor flags this with the removal command, which the Codex CLI runs because it owns that block:

```sh
npx -y @bridgecode/cli@4.3.2 update --project . --instruction-files agents
```

Passing `--instruction-files` to the Codex CLI drops every bootstrap you don't list again. The command that install and doctor print is built from the Codex metadata: it re-lists the Codex edition's other bootstraps (for example `--instruction-file "GEMINI.md"`) so only the `CLAUDE.md` ones are removed.

Claude Code reads `CLAUDE.md`, not `AGENTS.md`. Repository rules that only live in `AGENTS.md` are invisible to Claude Code unless you also put them in `CLAUDE.md` or `agentic/architecture.md`. Constraints that the Codex edition imported into `agentic/architecture.md` are honored by both editions.

## Verification and recovery

Dry-run verifies payload checksums, complete ownership metadata, bootstrap markers, path containment, conflicts and the projected final installation, with zero writes. Doctor checks the actual installation against the exact release, including when an update makes no changes. Editable metadata alone cannot redefine canonical content. Both reject linked managed paths, ownership collisions and payload paths outside `.claude/bridgecode/` and `.claude/agents/bridgecode-*.md`.

Writes use a journal (`.bridgecode/claude-transaction.json`), precondition checks and per-file atomic replacement. Multi-file writes are not filesystem-atomic. A detected failure attempts rollback. If recovery cannot safely finish, the journal and original bytes remain; preserve that file. After confirming no transaction owner is running, use:

```sh
npx -y @patabrava/bridgecode-cli-claude@4.3.2 recover --project .
```

Recovery refuses targets changed outside the transaction and retains evidence for manual reconciliation. `--json` provides machine-readable results. Conflicts exit nonzero and never silently force an overwrite.

Future releases must ship trusted snapshots (`legacy/<version>.json`) for the installed versions they update. Unknown versions are refused, and downgrading is not an automatic rollback mechanism.

## Development and release

The payload lives in `payload/`, which mirrors the installed tree. An optional authoring workspace at `../claude_condensation` (same layout) syncs in with `npm run sync:payload`. A standalone checkout edits `payload/` directly.

```sh
npm run build:manifest
npm test
npm run test:release
```

The release test packs once and installs that exact artifact into a disposable host. It runs its CLI in a disposable repository, checks the allowlist, and removes its fixtures and npm cache. `npm run test:release -- --output release` keeps the exact verified archive for publication. The tag-gated workflow tests and publishes that artifact. It uses its own tag scheme so it never collides with the Codex edition's `v*` tags: push `claude-v4.3.2` for package version `4.3.2`, and configure npm trusted publishing for the repository first. For a manual publish, publish the tested archive (`npm publish ./release/patabrava-bridgecode-cli-claude-4.3.2.tgz --access public`). Add `--provenance=false` when not publishing from CI. Never publish an untested rebuild.

Known limits: live hook delivery, `@` import resolution and subagent behavior depend on the installed Claude Code version and are not certified by tests. Hook commands rely on the shell expanding `$CLAUDE_PROJECT_DIR`.
