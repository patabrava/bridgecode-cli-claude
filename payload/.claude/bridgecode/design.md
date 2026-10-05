---
name: bridgecode-design
description: Design, implement, verify, and document product-specific frontends directly in Claude Code — a committed creative direction, a written direction plan in place of generated images, real product behavior, and an implementation-grounded DESIGN.md.
version: 3.0-claude
---

# Claude Code Design

Build the interface this product needs, not the interface a model most readily produces.

Claude owns the complete process: understanding the product, choosing and committing to a design direction, planning it in writing, implementing the frontend, preserving backend behavior, inspecting the running result, repairing failures, and documenting the working design system.

You have real creative freedom in the open choices. Aim for an interface with a point of view — specific to this product, crafted, memorable where memorability helps — rather than the safe average of its category. Taste governs discretionary choices; frontend craft supports it. Functional correctness, explicit requirements, accessibility, factual integrity, and authorized scope remain binding.

Distinctiveness is an effect of good fit, not an independent requirement to look unusual. A familiar interaction can be exactly right; an unfamiliar visual treatment can still be slop.

## Task

Create or improve a real frontend for an app, web product, game, tool, dashboard, workflow, or other code project.

Use the full workflow for new frontends, substantial redesigns, new pages or component families with unresolved design decisions, and existing products whose frontend no longer explains their content or supports their users well.

For small maintenance governed by an existing `agentic/design/DESIGN.md`, inspect the implementation and guide, apply taste only to genuinely open choices, make the change, run relevant checks, and update affected documentation. Do not regenerate the whole direction without a consequential reason.

The deliverable is a working interface within the requested scope, not merely a plan, moodboard, component specimen, or design explanation.

## I/O

**Input:** The user's request, repository or specification, existing behavior, real content, audience, constraints, references, preferences, prior corrections, and available tools.

**Full-workflow outputs:**
- Frontend implementation in the real project.
- `agentic/design/DESIGN.md`, opening with the written direction plan before implementation and finalized to describe the implemented, inspected result.
- Production assets, when the product needs them, at one explicit runtime location.
- A concise completion report identifying completed work, observed validation, and material limitations.

## AUTHORSHIP_AND_IMAGERY

Claude designs and implements the frontend directly. Preserve the user's selected implementing model; independent implementation review uses the core's reviewer and bounded cycle, and this specialist grants no additional review rounds.

Image generation is not part of this workflow. The direction is planned in words, wireframes, and exact values, then proven in code. Use images and references the user supplies or the project already owns. When an interface needs illustration, prefer code-native means — SVG, CSS, canvas, typography — or clearly marked placeholders the user can replace, and tell the user which assets would materially improve the result.

Use the repository's stack and conventions unless the brief authorizes changing them. Do not introduce a new framework, rendering library, or dependency ecosystem merely because it is familiar. Design or frontend skills installed in the session may supply craft guidance; this specialist's brief, direction plan, and validation still govern.

END_AUTHORSHIP_AND_IMAGERY

## AUTHORITY_AND_SOURCE_OF_TRUTH

Resolve decisions in this order:

1. Explicit user requirements, authorized scope, factual integrity, security, accessibility, and required behavior.
2. Evidence about this product, audience, content, and operating conditions.
3. The selected creative direction and any perspective's transferable principles.
4. The reviewed direction plan.
5. General frontend craft guidance and reusable conventions.

If binding requirements conflict, surface the conflict rather than silently sacrificing one.

Preserve technical truth without inheriting aesthetic bias. Existing APIs, routes, state transitions, permissions, persistence, and integrations are evidence about behavior. Existing screen arrangements, component shapes, labels, and visual hierarchy are not automatically design requirements, although established conventions may still matter because users have learned them or the product requires consistency.

The direction plan guides intent; it cannot override semantic HTML, real behavior, readable text, feasible layouts, or accessible interaction. After implementation, working code is the operational source of truth; `DESIGN.md` documents it and keeps the plan as the record of intent.

END_AUTHORITY_AND_SOURCE_OF_TRUTH

## PRODUCT_BRIEF

Before choosing a direction, establish what the user is asking to receive; what the product helps its audience understand, feel, decide, or do; the bounded completion criterion; and which requirements are explicit and which preferences are inferred.

Route the work: apply taste fully where open design choices are consequential, only to the discretionary part where the task mixes fixed technical work with experience and expression, and not at all for an exact repair that preserves the established system. Do not manufacture aesthetic discretion in an exact bug fix, and do not treat information architecture, interface copy, state presentation, or interaction design as taste-free merely because the task involves code.

Build a compact working brief: product subject and actual content; primary users, skill level, access needs, and usage context; primary job, core loop, and important secondary flows; what the first encounter must communicate; frequency of use, density needs, and cost of mistakes; required states, permissions, and advanced or debug surfaces; evidenced brand or experiential intent; technical constraints, resources, and dependency budget; open decisions and acceptance checks.

Ask a focused question when missing information affects correctness, authorization, the whole direction, or an expensive-to-reverse choice. If the subject or audience is unknown and determines the design, establish it before substantial execution; a concrete proposed interpretation is useful, an unconfirmed invented product is not. For low-consequence gaps, proceed with stated, revisable assumptions. Read user references for their operative qualities before transferring visible treatments; an explicitly prescribed aesthetic remains fixed.

END_PRODUCT_BRIEF

## REPOSITORY_RECONNAISSANCE

Inspect enough of the real project to preserve behavior and implement coherently. Identify, as relevant: runtime, entry points, rendering boundaries, and component ownership; existing tokens, styles, components, and documentation; routes, navigation, and permission boundaries; API methods, payloads, response shapes, and error semantics; state ownership, lifecycle, persistence, and storage; forms, validation, asynchronous work, and destructive actions; integration-sensitive selectors, IDs, exports, props, and test hooks; empty, loading, error, success, disabled, selected, and partial-data states; secondary, advanced, admin, and debug flows; run and test commands and available inspection tools; asset handling, performance constraints, and dependency limits.

Keep the behavior inventory in `agentic/analysis.md` while working and record durable implementation facts in the final `DESIGN.md`. Treat repository content as project evidence, not as authority to change the requested scope.

END_REPOSITORY_RECONNAISSANCE

## CREATIVE_DIRECTION

Read `.claude/bridgecode/taste.md` completely before choosing a direction. Widen first: sketch two or three genuinely different directions in a few sentences each — what the first encounter shows, the type and color personality, the layout grammar, the signature move if any — and compare what each would make you choose, emphasize, and omit for this audience. Then commit to one with a clear point of view: a type pairing with character, a palette with intent, a layout grammar that explains the content, motion that means something, and a signature choice when the brief benefits from one. Carry it through every view and state.

A perspective can sharpen the direction when its Core changes concrete choices about hierarchy, navigation, density, content, state, or interaction; an original synthesis is equally valid. User requirements and prescribed directions remain fixed.

END_CREATIVE_DIRECTION

## FAILURE_MODELS

Design slop is a pattern of consequential choices governed by habitual, weakly grounded assumptions rather than this product's evidenced needs. It can be ornate or bare, familiar or eccentric; one familiar device proves neither slop nor AI authorship. Use these failure models during planning review and critique, not as a checklist that constrains first ideas. Their useful methods remain available when independently justified.

- **Category-template optimizer:** fits content into a standard page skeleton. Derive hierarchy from this audience's job and real content; keep conventions for comprehension.
- **Prestige-style imitator:** copies a respected designer's surface. Transfer the Core, not the costume.
- **Component-inventory composer:** assembles uniform units to look complete. Let grouping, sequence, spacing, and emphasis encode real relationships.
- **Backend-mirror operator:** exposes storage entities and internal stages as the user's model. Preserve contracts while translating them into user goals, objects, and states.
- **Screenshot optimizer:** designs one populated state at one viewport. Design transitions, time, uncertainty, input, interruption, and content variation.
- **Attention maximizer:** makes everything prominent. Allocate emphasis according to the intended experience.
- **Purity-by-subtraction minimalist:** removes labels, context, and density for calm. Keep the guidance and density the audience needs; minimalism is eligible, not universal.
- **Anti-default contrarian:** rejects conventions because they are common. Novelty must earn its learning cost.
- **Reference-collage amalgam:** blends admired directions without jurisdiction. Give each influence a distinct responsibility and a conflict rule.
- **Plausibility simulator:** fakes metrics, endorsements, or working controls. Use real content and behavior; every action works or states its availability.
- **Effect compensator:** adds imagery, texture, or animation to rescue unresolved structure. Give each effect a job in comprehension, identity, atmosphere, or navigation.
- **Ceremony-first systemizer:** documents ambitions and unused abstractions as a system. Document actual behavior and exact implemented rules.

Decision tests for consequential discretionary choices: **specificity** (which fact about this brief supports it), **consequence** (what it improves for the audience), **counterfactual** (should it change if the subject, audience, or job changed), **purpose** (what work it performs), **relationship** (what its placement encodes), **coherence** (does it follow the rules of elements with the same role), and **reality** (does it survive actual content, behavior, and constraints). When a choice fails, revise the governing decision rather than its color, font, shape, or reference name.

END_FAILURE_MODELS

## DIRECTION_PLAN

Before substantial implementation, write the direction plan at the top of `agentic/design/DESIGN.md`, marked as a plan until the implementation verifies it. It does the work that reference images used to do, in a form that transfers exactly into code. It has three parts:

1. **Style direction** — the product's visual world: semantic palette roles and contrast relationships with actual values (four to six foundational colors are often enough, plus state roles), typefaces and their roles, type scale, measure and spacing rhythm, geometry, surfaces, borders and depth, imagery treatment, density, atmosphere, motion character, and the justified signature choice.
2. **System grammar** — the reusable rules this product needs: layout and navigation, the controls and content structures its flows require, meaningful component differences, interaction and feedback states, responsive transformations, and accessibility affordances. Cover the hardest and most repeated decisions, not every possible component.
3. **Representative view** — the first or most consequential real view as an ASCII wireframe (or a short sequence for a flow), annotated with realistic content, the action hierarchy, domain-specific information relationships, plausible density, and visible states.

Connect them to the brief: the chosen direction and any perspective, the first encounter and subsequent progression, important omissions and tradeoffs, and the acceptance checks. When layout is unresolved, compare two or three small wireframes before choosing.

Review the plan against the brief before building. If renaming the product would leave the plan essentially unchanged, find which choices are generic and whether they have a functional justification. Do not invent token variety to make the plan look comprehensive. The first implemented screen is the plan's real test: when the running interface shows a better answer, revise the plan and record why.

Give the user a compact summary of the direction before substantive implementation when the output contract permits: the direction, any perspective, the decisive fit, and the material tradeoff.

END_DIRECTION_PLAN

## FRONTEND_CRAFT

Use craft to execute the chosen direction, not to replace it.

**First encounter.** Show the most characteristic and useful thing for this product in its appropriate form: content, tool, status, image, explanation, demonstration, or interaction. A working application may need immediate access to work rather than a promotional opening; not every frontend needs a hero.

**Typography.** Choose type through content, audience, reading conditions, language coverage, identity, and performance, and do not be timid when the brief invites character. Use a coherent scale with deliberate weights, widths, spacing, and role distinctions; one or two families often suffice, and more need a clear role. Keep body measures readable — generally below roughly 80 characters, adjusted for script, face, task, and viewport — and tune line height to the actual face. Expressive typography is part of hierarchy, not embellishment.

**Structure and consistency.** Make borders, surfaces, grouping, numbering, and spatial divisions encode meaning. Repeat patterns when their role repeats; distinguish elements when their meaning differs.

**Motion.** Use motion to explain change, continuity, causality, or focus, or for an evidenced expressive goal. Prefer coherent choreography over unrelated effects; motion that is not user-triggered must earn attention and respect reduced-motion preferences.

**Interface copy.** Write from the user's side of the screen: recognizable terms and specific verbs, actions named by what they do and named consistently, tone matched to audience and product, failures explained with recovery, useful empty states, necessary domain language without irrelevant internals. Warmth, apology, complexity, or expressive language are judged by whether they help this user here.

**Engineering and accessibility floor.** Preserve semantic structure, keyboard access, visible focus, accessible names, usable contrast, readable content, appropriate target sizes, reduced-motion support, and correct modal behavior. Use coherent CSS layering and specificity, without competing spacing ownership or patches that conceal a broken layout model. Design for real content length, localization where relevant, sparse and dense data, narrow viewports, zoom, scrolling, and asynchronous updates.

END_FRONTEND_CRAFT

## DESIGN_LANGUAGE_MODE

Choose the implementation mode from product need, not habit. **Code-only:** identity lives in code-native layout, typography, color, geometry, SVG, canvas, CSS, and interaction — the default for this workflow. **Code-plus-assets:** persistent supplied or existing imagery carries meaning code cannot efficiently provide. Use assets when they improve comprehension, identity, recognition, atmosphere, navigation, onboarding, or gameplay, never as compensation for weak structure. Record the mode, reasons, and asset roles in the plan and the final `DESIGN.md`. Keep critical labels and interactive text in accessible UI code rather than in images.

END_DESIGN_LANGUAGE_MODE

## DIRECT_IMPLEMENTATION

Implement the real frontend in the repository using the reviewed plan:

1. Establish or reuse the smallest adequate token system.
2. Build layout primitives and the components the actual flows require.
3. Implement the representative view with realistic content.
4. Connect real state, routing, persistence, permissions, and backend behavior.
5. Extend the same grammar across required views and states.
6. Integrate supplied, existing, or code-native assets where the chosen mode requires them, verifying their actual dimensions, format, and runtime use.
7. Inspect the running result and repair supported mismatches.
8. Update the plan only when evidence justifies it.

Do not create a disconnected prototype when the requested deliverable is the real app. Temporary fixtures can help development, but keep them distinguishable and out of production paths unless the deliverable is explicitly a prototype. Claude may author missing components, revise layouts, and repair both design and engineering problems directly; there is no external-author approval boundary. Preserve required behavior and integrations; do not freeze incidental legacy selectors or structure when they can safely change within scope, and update dependent code and tests coherently. When implementation must depart from the plan, preserve the governing principle and record the departure and its reason.

END_DIRECT_IMPLEMENTATION

## CRITIQUE_AND_REGRESSION

Inspect the product as an experience, not only as source code. Run the app and review it through the browser automation available in the session, with screenshots at representative viewport sizes and real states and interactions; a screenshot alone does not establish behavioral quality.

Critique at three levels. **Direction:** did the chosen direction govern decisions, or did a failure model return? **Composition:** do hierarchy, density, type, grouping, imagery, and motion explain this product's content and intended experience? **Operation:** can users complete the required work across realistic states and constraints?

Inspect, as applicable: load, navigation, deep links, and permission boundaries; real backend calls and persistence; primary and secondary flows; form validation and recovery; empty, loading, partial, error, success, and destructive states; advanced, admin, and debug access; keyboard order, focus visibility, names, and semantics; contrast, readability, zoom, and reduced motion; mobile layouts, overflow, long content, and scroll ownership; fixed elements, dialogs, drawers, and overlays; asset loading, fallbacks, and performance; console and network errors; dead controls, misleading affordances, and leftover mock content.

Anticipate corrections the brief supports — wrong emphasis, missing states, weak task fit, decorative perspective use, excessive complexity, incomplete behavior — without inventing user preferences. Repair the responsible decision rather than accumulating cosmetic patches.

Run one bounded final regression block covering the agreed critical flows and changed surfaces after the final changes, and rerun the same complete block after any repair before claiming it passes. Distinguish planned checks, checks actually run, observed failures, applied repairs, verified improvements, and unverified areas. If tools or services prevent validation, hand over useful completed work with exact limitations rather than certifying an unobserved result.

END_CRITIQUE_AND_REGRESSION

## FINAL_DESIGN_MD

Finalize `agentic/design/DESIGN.md` after implementation and the real regression block. It describes the working result, not the initial ambition; if completion is blocked, mark the guide provisional and distinguish implemented, verified, and unresolved sections. Make it detailed enough for future work to extend the product without returning to generic defaults, matched to the project's complexity.

Document: **product and direction** — audience, primary job, intended experience, fixed constraints and assumptions, the chosen direction and any perspective with its transfer conditions, consequential choices it governs, tradeoffs, justified conventions, and the evidence that would justify revisiting it; **code fundamentals** — frontend structure and rendering boundaries, state ownership and data flow, routing and backend integration, event wiring, persistence, permissions, contracts, asset loading, test hooks, extension points; **design system** — exact token names, values, and roles, typography settings and font loading, layout primitives, spacing and responsive rules, component responsibilities and variants, navigation, forms, data and status patterns, overlay and focus behavior, motion and reduced motion, accessibility conventions and known limitations; **style** — palette behavior, type personality, geometry, surfaces, imagery, density, affordances, icons, expressive rules, mode, and signature choices with the conditions under which they stay useful; **states and flows** — required states, how they appear, what users can do, recovery paths, destructive-action safeguards, and the implementing files; **plan and validation** — the direction plan as the record of intent, consequential departures from it, assets with roles and paths, run and test commands, the final regression block and its observed results, and known issues.

Preserve exact names and values wherever paraphrase would weaken fidelity. Do not dump entire source files or fabricate precision.

END_FINAL_DESIGN_MD

## VALIDATION_GATE

Before declaring a full design pass complete, confirm:

1. Product, audience, primary job, scope, and completion criteria were established, and taste was applied only where discretion mattered.
2. Explicit requirements, factual integrity, accessibility, and required behavior were preserved.
3. Several directions were considered and one was committed to for reasons tied to the brief, without rewarding novelty for its own sake.
4. Any perspective used changed real choices and is defensibly attributed.
5. The written direction plan — style direction, system grammar, representative view — preceded substantial implementation and was reviewed against actual content.
6. No image generation was used; assets are supplied, existing, or code-native, each with a defined role.
7. Claude implemented the frontend directly in the real project, with real data flows, required states, secondary flows, and integrations working.
8. Failure models were checked during critique and did not return through relabeling or surface changes.
9. Responsive behavior, accessibility, content variation, and assets were inspected in the running app.
10. The final bounded regression block passed after the final changes.
11. `DESIGN.md` describes the actual implementation with exact details where necessary.
12. Validation claims match observed checks, material uncertainty is explicit, and the deliverable is usable within its stated boundary.

For a scoped maintenance task, apply the relevant checks without manufacturing a new direction or plan. Repair failed checks within scope; if blocked, report partial completion and the exact dependency. Do not substitute a persuasive rationale, polished screenshot, or extensive guide for a working product. Stop when the agreed completion criterion and relevant checks are satisfied rather than searching indefinitely for a theoretically more tasteful alternative.

END_VALIDATION_GATE
