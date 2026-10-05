# Bridgecode architecture — Claude Code edition

Bridgecode has two layers: Markdown directs agent behavior, and a dependency-free Node CLI installs and verifies that policy. The CLI does not run processflows or certify model compliance. This repository is the Claude Code edition, `@patabrava/bridgecode-cli-claude`, forked from the Codex edition `@bridgecode/cli` 4.3.2. Both editions can be installed in one project: they own disjoint paths and share `agentic/` memory. The permanent core is imported into Claude Code through a `CLAUDE.md` bootstrap. Six specialists load before the actions they govern, and a read-only reviewer subagent performs bounded review. Project memory is repository-owned and stays outside the installed package set.

## Maintained-file map

```text
Bridgecode_Claude/
├── README.md                      Install/update contract, edition choice, coexistence, release limits
├── CHANGELOG.md                   Claude edition changes, then the Codex lineage
├── LICENSE                        MIT license
├── package.json                   @patabrava/bridgecode-cli-claude, bin bridgecode-claude, npm allowlist
├── payload-manifest.json          Generated: package, edition, version, payload and hook hashes
├── .gitattributes / .gitignore    Line endings; ignores caches, archives, secrets, private notes
├── .github/workflows/publish.yml  Tag/version gate, regression, exact-artifact publication
├── bin/bridgecode-claude.mjs      Executable dispatch into src/cli.mjs
├── payload/                       Mirror of the installed tree (source path = payload/<target>)
│   └── .claude/
│       ├── bridgecode/
│       │   ├── CORE.md            Permanent policy: routing, entry gate, stages, review, memory, harness
│       │   ├── best-agent.md      Intent, perspective transfer, error forecast
│       │   ├── taste.md           Creative direction: widen, commit, lenses, quality floor
│       │   ├── design.md          Direct frontend authorship, written direction plan, UI validation
│       │   ├── writing.md         Editing fidelity vs creative latitude, reader-side revision
│       │   ├── copywriting.md     Customer outcome, credible value, bold concepts within truth
│       │   ├── monoprompting.md   Reusable prompts, skills, subagents, hook messages, corrections
│       │   └── README_HUMAN.txt   Installed human guide
│       └── agents/bridgecode-reviewer.md  Read-only reviewer: packet, relevance gate, verdict format
├── hooks/bridgecode-turn.mjs      Source of the installed heartbeat/compaction hook
├── src/
│   ├── cli.mjs                    Argument parsing and install/update/doctor/recover dispatch
│   ├── install.mjs                Lifecycle projection, ownership checks, Codex detection, summary
│   ├── update.mjs                 Update entry into the shared lifecycle
│   ├── manifest.mjs               Paths/constants, payload allowlist, checksums, safeTarget
│   ├── verification.mjs           releaseFor (current or legacy snapshot) and canonical verifyInstalled
│   ├── instructions.mjs           CLAUDE.md bootstrap build/parse/upsert/remove, path policy
│   ├── hooks.mjs                  .claude/settings.json entry merge preserving unrelated config
│   ├── transaction.mjs            Journal, preconditions, per-file replacement, guarded recovery
│   └── doctor.mjs                 Read-only integrity checks, coexistence and memory warnings
├── scripts/
│   ├── sync-payload.mjs           Copy ../claude_condensation (installed-tree layout) into payload/
│   ├── build-manifest.mjs         Deterministic manifest generation from payload/
│   └── test-release.mjs           Pack once, test the artifact, optionally retain that same archive
├── test/
│   ├── helpers.mjs                Realpath fixtures, snapshots, simulated next release, Codex stand-in
│   ├── lifecycle.test.mjs         Install/update/no-op, CLAUDE.md preservation, coexistence, settings
│   ├── safety.test.mjs            Tampering, collisions, allowlist, links, reserved targets, rollback
│   ├── hooks.test.mjs             Installed hook with real event input; integrity fallback
│   ├── policy.test.mjs            Static policy anchors and source parity; not behavioral proof
│   └── tarball.test.mjs           Exact npm artifact lifecycle and package allowlist
└── agentic/
    ├── analysis.md (when active)  Temporary first-block decision brief, checklist and recovery
    ├── architecture.md            This maintained implementation map
    └── engineering-distillation.md Source-preserving 4.0/4.1 reference; not runtime policy
```

The private primitives note (`primitives.md` at the root, or `agentic/primitives-private.md`) is gitignored, excluded from npm and is not runtime guidance. Disposable test repositories, npm caches and simulated releases live under OS temporary directories and are cleaned by their creating tests.

## Installed layout and ownership

The edition owns:

- the payload targets `.claude/bridgecode/*` and `.claude/agents/bridgecode-reviewer.md`
- the optional hook script `.claude/hooks/bridgecode-turn.mjs` and its two entries in `.claude/settings.json`
- one `bridgecode-claude:bootstrap` block per registered `CLAUDE.md`
- the metadata `.bridgecode/claude-installation.json` and the journal `.bridgecode/claude-transaction.json`

`manifest.isAllowedPayloadPath` rejects any manifest target outside `.claude/bridgecode/` and `.claude/agents/bridgecode-*.md`.

The bootstrap's `@` line imports `CORE.md` relative to the registering file (root → `@.claude/bridgecode/CORE.md`, `.claude/CLAUDE.md` → `@bridgecode/CORE.md`). Instruction targets must be named `CLAUDE.md` and avoid reserved paths, including the Codex-owned `bridgecode/`, `.codex/` and `AGENTS.md`. Claude Code loads `CLAUDE.md` and `.claude/CLAUDE.md` from the launch directory and its ancestors. `instructions.bootstrapScope` captures that rule. Install's `coreAutoloaded` and doctor's warning count only root-scope bootstraps. The hook compares each bootstrap's scope with the event `cwd` before saying "do not re-read" and otherwise tells Claude to read the core once. Hook commands use `$CLAUDE_PROJECT_DIR`, so the committed settings file works in any checkout; metadata deliberately records no project root.

Coexistence is a hard boundary. The edition never writes, moves or retires root `AGENTS.md`, `bridgecode/`, root `README_HUMAN.txt`, `.codex/`, `.bridgecode/installation.json` or `.bridgecode/transaction.json`. `install.detectCodex` only peeks at them for reporting, outside the transaction preconditions. Codex bootstrap markers (`bridgecode:bootstrap:`) are never parsed for ownership or edited, and its marker namespace does not overlap `bridgecode-claude:bootstrap:`. Install and doctor warn when a registered `CLAUDE.md` also carries the Codex bootstrap. `install.codexRemovalCommand` then prints the Codex CLI removal command, built from the Codex metadata so that the Codex edition's non-`CLAUDE.md` bootstraps are re-listed and survive. `test/lifecycle.test.mjs` asserts Codex bytes stay identical through install, update, hook disabling and doctor.

## Installation flow

`prepareLifecycle`:

1. Refuses a pending journal.
2. Verifies any existing installation against its trusted release, either the current manifest or `legacy/<version>.json`.
3. Projects every payload write, retirement, hook merge, bootstrap upsert or removal, and the metadata, entirely in memory.
4. Checks the projected final state with `verifyInstalled` before a dry-run can succeed.

A real run writes through `applyTransaction`, which uses an exclusively created journal, rechecks observations, applies the changes and verifies the actual result. A no-op still runs verification. An unowned existing payload target or hook script is a conflict even when its bytes match. Previously managed files are retired only when unchanged.

`verification.verifyInstalled` compares the complete expected key set, the actual bytes, the exact bootstrap blocks and the hook entries against the trusted release. Editing metadata hashes cannot legitimize changed canonical content. No `legacy/` snapshots ship in this first edition release. The next release must add `legacy/4.3.2.json` (`{version, edition, schemaVersion, files, hookHash}`) and put `legacy/` back in the npm `files` allowlist; `simulatedPackage` in the tests shows the format.

## Corrections and regression protection

`manifest.safeTarget` rejects symlink/junction components and non-file targets. Normalized relative paths reject traversal, device names, stream separators and cross-platform aliases. These measures reduce accidental races but are not a security boundary against an adversary changing entries between system calls.

`transaction.recoverTransaction` restores only unchanged originals or known transaction output. It retains the journal on outside edits or failed restoration, and refuses recovery while another recorded owner may be alive. Multi-file updates are journaled, not filesystem-atomic.

`hooks.mergeHooks` owns only entries whose command contains `/.claude/hooks/bridgecode-turn.mjs`. Recorded entries must match their hash exactly, unrecorded owned entries are refused, and invalid JSON fails before any write. The settings file is never deleted.

`test/helpers.fixture` returns the realpath of each temporary directory. This fixed two pre-existing macOS failures caused by `/tmp` → `/private/tmp` links.

The hook emits a short UserPromptSubmit reminder and, for SessionStart `compact`, a recovery pointer to `agentic/analysis.md` rather than re-injecting the core. The `CLAUDE.md` import keeps the core in context; the hook says to read `CORE.md` once only if it is missing. Hook fixtures verify JSON output and the integrity fallback, not host trust or live delivery.

## Policy decisions specific to this edition

These are user-directed C-policy changes from the Codex 4.3.2 core:

- **Best Agent depth.** Best Agent loads for every task that changes code, content or configuration. The anticipatory-correction move becomes an error forecast, revisited after research, before the first edit and before handoff.
- **Memory over re-reading.** `analysis.md` and `architecture.md` are the trusted working memory. Claude writes findings as it goes, re-verifies only what the next action depends on, never re-reads the loaded core and never wraps up early for context. This counters the context paranoia the Codex wording induced in Claude.
- **Creative latitude.** Writing, prompting and design use "widen, then commit" with a light quality floor.
- **Design planning.** Image generation is removed; a written direction plan in `DESIGN.md` replaces the three reference images.
- **Review.** Review uses the installed `bridgecode-reviewer` and never `fork`. The agent has `model: inherit` and Read, Grep, Glob and Bash restricted by contract to inspection. Bash is listed because some Claude Code builds expose no Grep or Glob tools, which would leave a reviewer with only Read. Same-model is required. Reasoning effort cannot be verified in Claude Code, so it is recorded as inherited and unverified instead of blocking. This changes the Codex same-effort requirement.

`policy.test.mjs` anchors these wordings statically; it does not establish model behavior.

## Source and adaptation

`engineering-distillation.md` re-encodes the 4.0/4.1 excerpts as authoring reference. The runtime core keeps the 4.3.2 stage-embedded engineering policy and the bounded review cycle unchanged apart from the harness mechanics above.

The ladder from [Ponytail](https://github.com/DietrichGebert/ponytail/blob/main/skills/ponytail/SKILL.md) is retained in the Execute stage: understand callers first, reuse before new code, repair the shared cause. Its complexity-only review is not adopted as a separate pass. Concrete simpler-mechanism findings must pass the same relevance gate, and Ponytail's benchmark claims are not Bridgecode evidence.

## Run and release

From the repository root: `npm run build:manifest`, `npm test`, `npm run test:release`. Add `-- --output release` to keep the exact tested archive for an authorized publish. The workflow is gated on `claude-v<version>` tags, distinct from the Codex edition's `v*` tags, and publishes `release/patabrava-bridgecode-cli-claude-<version>.tgz` after its checks. Local work never publishes.

A standalone checkout skips only the source-parity check (`../claude_condensation` absent), never the artifact test.
