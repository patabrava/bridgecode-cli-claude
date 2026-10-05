# MONOPROMPTING — Reusable instructions that work

Use this process to create or correct a reusable prompt, workflow prompt, skill, subagent definition, system prompt, hook message, agent rule, rubric, or instruction file such as `CLAUDE.md`. A monoprompt is one self-contained operating contract centered on one deliverable. It may contain several dependent stages, but each stage exists to produce or validate that deliverable.

## Understand the job

Determine what the future model must accomplish, who or what supplies the input, where the prompt will run, what information will be available there, what ambiguity could make the output useless, how deterministic the output must be, and what observable result proves success. Preserve the user’s actual intent and vocabulary. Inspect the target environment or existing instruction file when available instead of inventing constraints.

## Craft freely

You have latitude in form: choose whatever most reliably produces the target behavior in the receiving model and environment. A compact constitution of principles, a narrative of the situation, a role, ordered stages, XML-tagged sections, a schema, worked examples, or a blend are all legitimate when they serve the deliverable. Craft that tends to work well with Claude and comparable models:

- **Explain why.** A rule that carries its reason generalizes to cases the rule never named; a bare command is applied literally or inconsistently.
- **Supply what the model cannot know:** audience, stakes, what good looks like, what has already happened, and where the output goes next.
- **Say what to do,** directly and specifically, and describe the target behavior instead of only forbidding its opposite. Name a rejected behavior when the contrast removes a real ambiguity.
- **Use examples generously when they teach.** They set format, tone, and judgment faster than description. Make them representative and varied so the model learns the pattern rather than copying one instance, and mark which parts are fixed.
- **Use structure for navigation and parsing** — headings, XML tags, fields — and connected prose for reasoning criteria and context.
- **Match the register you want back.** A prompt written in flat bureaucratic prose tends to produce flat output; a prompt with a clear voice invites one.

Draft the full instruction once, then edit every section for operational value: merge repetition, cut explanation that corrects no real failure, sharpen vague adjectives into observable behavior, and keep context the receiving model cannot otherwise know. Research the target mechanism only when current or unfamiliar behavior affects the prompt, and resolve user-dependent contract choices through the active processflow’s Q&A stage.

## Claude Code targets

- **Skills** (`.claude/skills/<name>/SKILL.md`): the frontmatter `description` decides when the skill is used, so state what it does and when to use it, including the phrases a user would actually say. Keep the body procedural and load supporting files on demand.
- **Subagents** (`.claude/agents/<name>.md`): the `description` decides delegation; restrict `tools` to what the role needs and choose `model` deliberately (`inherit` keeps the caller's model). The body is the subagent's entire instruction set and it sees none of the parent conversation, so define the packet it receives and its exact response contract.
- **CLAUDE.md and imported rules:** always-loaded context. Keep them durable, specific, and short enough to stay salient; put one-time task constraints in the request instead.
- **Hook messages:** injected as context or shown to the user. Keep them short, factual, and calm.

Verify current formats against the installed Claude Code version or its official documentation when they matter to the result.

## Autonomous and harness prompts

When a prompt must support autonomous agent or harness work, embed Best-Agent judgment at its decision points: pursue the real outcome, inspect available evidence, name the fragile assumption and the likely errors with the checks that catch them, protect the highest-cost boundary, ask only at genuine user decision boundaries, and continue until the deliverable is validated or a precise external blocker remains.

## Prompt correction

When correcting an existing prompt, identify the triggering signal, the desired future behavior, the scope where it should apply, the visible output contract, and the quality gate. Rewrite the smallest durable rule set that makes the next run behave correctly. Merge with the corresponding rule, replace obsolete wording, and remove contradictions or repeated corrections.

Place a correction at the narrowest level that will reliably be read when triggered. Universal behavior belongs in the system or shared instruction layer, route behavior in the relevant process, repo behavior in verified code, tests, and `agentic/architecture.md`, and one-time task constraints in the active request. Do not promote a local workaround into a universal rule without evidence that it generalizes.

## Output

Deliver the finished prompt as the primary output. Add rationale, alternatives, or commentary only when the user requested them or when a material assumption must be surfaced. If the prompt belongs in the repo, update the intended canonical file rather than creating parallel versions unless versioned coexistence is explicitly required.

## Validation gate

Before delivery, verify that the monoprompt has one central deliverable; works in its target environment without the conversation that produced it; defines input, output, and completion clearly; preserves required context and user preferences; grants enough autonomy without hiding user decision boundaries; contains no repeated or contradictory rules; and that any examples teach the pattern rather than a single instance. When it materially improves confidence, run representative and edge inputs mentally or in a disposable harness run — a fresh subagent is a cheap test bed — then delete the residue after incorporating the correction.
