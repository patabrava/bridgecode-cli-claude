import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { PAYLOAD_DIR, CORE_PATH, REVIEWER_PATH, SPECIALISTS } from "../src/manifest.mjs";
import { PACKAGE_ROOT, MANAGED_PATHS } from "./helpers.mjs";
const payload=p=>readFile(path.join(PACKAGE_ROOT,PAYLOAD_DIR,p),"utf8");
const specialist=name=>payload(".claude/bridgecode/"+name+".md");
test("source and package instructions are byte-identical",async t=>{
 const source=path.join(PACKAGE_ROOT,"../claude_condensation");
 try { await access(source); } catch(e) { if(e.code!=="ENOENT")throw e; t.skip("Standalone package checkout: source synchronization runs in the authoring workspace");return; }
 for(const p of MANAGED_PATHS)assert.deepEqual(await readFile(path.join(PACKAGE_ROOT,PAYLOAD_DIR,p)),await readFile(path.join(source,p)),p);
 assert.deepEqual(await readFile(path.join(PACKAGE_ROOT,"hooks/bridgecode-turn.mjs")),await readFile(path.join(source,"hooks/bridgecode-turn.mjs")));
});
test("Claude Code harness contract anchors (static checks, not behavioral certification)",async()=>{
 const core=await payload(CORE_PATH);
 for(const fragment of ["Claude Code edition","Person","Core","Magnum Opus","distinct responsibility","AskUserQuestion","dependent actions wait","terminal review","when the cause is structural","Never discard an unmapped rule","bridgecode-reviewer","Never use `fork`","model: inherit","no inherited conversation","plan mode","Harness rules (Claude Code)","Codex coexistence"])
  assert.ok(core.includes(fragment),fragment);
 assert.doesNotMatch(core,/request_user_input_async|fork_turns|\.codex\/hooks|Harness rules \(Codex\)|ROBUST.*always stop/i);
 for(const name of SPECIALISTS)assert.ok(core.includes(".claude/bridgecode/"+name+".md"),name);
 for(const name of SPECIALISTS)assert.doesNotMatch(await specialist(name),/Codex/,name);
 const reviewer=await payload(REVIEWER_PATH);
 for(const fragment of ["name: bridgecode-reviewer","tools: Read, Grep, Glob, Bash","Use Bash only to inspect","model: inherit","## Relevance gate","Never return `FIX` or `REPLAN` here","5000 tokens or less"])
  assert.ok(reviewer.includes(fragment),fragment);
});
test("memory-first context policy replaces re-reading and early wrap-up (static policy)",async()=>{
 const core=await payload(CORE_PATH);
 for(const anchor of ["do not re-read it while it is present","are your working memory","re-verify only facts the next action depends on","correct the record in place","Record findings in analysis.md as you go","Consult it before exploring","never wrap up early","reload only what the current stage needs","the specialists in use"])
  assert.ok(core.includes(anchor),anchor);
 assert.doesNotMatch(core,/At each new task, read this entire file|recover this core/);
 const hook=await readFile(path.join(PACKAGE_ROOT,"hooks/bridgecode-turn.mjs"),"utf8");
 assert.ok(hook.includes("do not re-read it"));assert.doesNotMatch(hook,/Recover core\/specialists/);
});
test("Best Agent is deepened into an error forecast (static policy)",async()=>{
 const core=await payload(CORE_PATH),agent=await specialist("best-agent");
 for(const anchor of ["primary defense against avoidable errors","error forecast","every item ends confirmed, repaired, or reported","before the first task-directed action of any task that changes code, content, or configuration"])
  assert.ok(core.includes(anchor),anchor);
 for(const anchor of ["This move is the error forecast","Revisit the forecast three times","Every error-forecast item is closed","Follow the core's every-turn entry gate","Revalidate the diagnostic every turn","Context length is not such a limit"])
  assert.ok(agent.includes(anchor),anchor);
});
test("creative latitude and planning-only design (static policy)",async()=>{
 const design=await specialist("design");
 for(const anchor of ["Image generation is not part of this workflow","DIRECTION_PLAN","Style direction","System grammar","Representative view","ASCII wireframe","real creative freedom"])
  assert.ok(design.includes(anchor),anchor);
 assert.doesNotMatch(design,/\.png|REFERENCE_IMAGES|IMAGE_PROMPT|image model|generated (raster|production) assets/i);
 assert.ok((await specialist("taste")).includes("Widen, then commit"));
 assert.ok((await specialist("writing")).includes("real creative latitude"));
 const prompting=await specialist("monoprompting");
 for(const anchor of ["Craft freely","Explain why","Use examples generously when they teach"])assert.ok(prompting.includes(anchor),anchor);
 assert.doesNotMatch(prompting,/Examples are a last-mile control mechanism/);
});
test("bounded review and stage-local proportionality contract (static policy, not model behavior)",async()=>{
 const core=await payload(CORE_PATH);
 for(const anchor of ["Freeze this acceptance contract","first adequate option","relevance gate","An evidenced edge case on a supported path remains relevant","5000 tokens or less","exactly one correction stage","Never spawn a third implementation reviewer","UNRESOLVED stops further implementation","does not reset the budget","not another improvement pass","root verification contradicts PASS"])
  assert.ok(core.includes(anchor),anchor);
 const hook=await readFile(path.join(PACKAGE_ROOT,"hooks/bridgecode-turn.mjs"),"utf8");
 const guide=await payload(".claude/bridgecode/README_HUMAN.txt");
 for(const text of [core,hook,guide])assert.doesNotMatch(text,/second[- ]REPLAN|Astra|gpt-6-astra|then requests a fresh review/i);
 assert.ok(hook.includes("terminal PASS/UNRESOLVED"));
 assert.ok(guide.includes("No third implementation reviewer"));
});
test("publish workflow resolves the exact artifact version without publishing",async()=>{
 const workflow=await readFile(path.join(PACKAGE_ROOT,".github/workflows/publish.yml"),"utf8");
 const expression=/node -p '([^']+)'/.exec(workflow)?.[1];
 assert.ok(expression,"Expected exact artifact version expression");
 const actual=execFileSync(process.execPath,["-p",expression],{cwd:PACKAGE_ROOT,encoding:"utf8"}).trim();
 const pkg=JSON.parse(await readFile(path.join(PACKAGE_ROOT,"package.json"),"utf8"));
 assert.equal(actual,pkg.version);
 assert.ok(workflow.includes("npm run test:release -- --output release"));
 assert.ok(workflow.includes('npm publish "./release/'+pkg.name.replace(/^@/,"").replace("/","-")+"-"));
 assert.ok(workflow.includes("GITHUB_REF_NAME"));assert.ok(workflow.includes("'claude-v'+p.version")&&workflow.includes('- "claude-v*"'),"edition tag scheme");
});
test("entry and task-board lifecycle have explicit policy gates (static, not model execution)",async()=>{
 const core=await payload(CORE_PATH);
 for(const anchor of ["Start the first public response with","BRIDGECODE_ROUTE: ROBUST","BRIDGECODE_ROUTE: LEAN / PATCH|DEBUG|ASSESS","Before task-directed research, questions, implementation, or deliverables","its first content block applies all three Best-Agent moves","Revalidate all three moves on follow-ups","Read-only/no-file-write requests","Disclose unavailable storage","delete analysis.md when no active work remains","Do not append turn logs","retain unresolved requirements there"])
  assert.ok(core.includes(anchor),anchor);
 assert.ok(core.indexOf("**Every-turn entry gate.**")<core.indexOf("**Research.**"));
 assert.doesNotMatch(core,/Before major action|full stage accounting when requested|Legacy rules temporarily retained/);
});
