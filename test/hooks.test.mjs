import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { installBridgecode } from "../src/install.mjs";
import { CORE_PATH, HOOK_PATH } from "../src/manifest.mjs";
import { fixture, PACKAGE_ROOT } from "./helpers.mjs";
test("installed hook emits bounded heartbeat, compact recovery, and explicit fallback",async t=>{
 const root=await fixture(t),other=await fixture(t);await installBridgecode({project:root,packageRoot:PACKAGE_ROOT});
 const run=(e,cwd=root)=>{const r=spawnSync(process.execPath,[path.join(root,HOOK_PATH)],{input:JSON.stringify({cwd,...e}),encoding:"utf8",cwd:root});assert.equal(r.status,0);return r.stdout?JSON.parse(r.stdout):null;};
 const heart=run({hook_event_name:"UserPromptSubmit",prompt:"hi"}).hookSpecificOutput;
 assert.equal(heart.hookEventName,"UserPromptSubmit");assert.ok(heart.additionalContext.length<1000);
 for(const text of ["BRIDGECODE_ROUTE","error forecast","do not re-read it","Compaction is automatic","terminal PASS/UNRESOLVED","Claude Code edition"])assert.ok(heart.additionalContext.includes(text),text);
 const compact=run({hook_event_name:"SessionStart",source:"compact"}).hookSpecificOutput;
 assert.equal(compact.hookEventName,"SessionStart");
 for(const text of ["BRIDGECODE RECOVERY","agentic/analysis.md","Next action","without resetting"])assert.ok(compact.additionalContext.includes(text),text);
 for(const source of ["startup","resume","clear"])assert.equal(run({hook_event_name:"SessionStart",source}),null,source);
 assert.equal(run({hook_event_name:"Stop"}),null);
 assert.match(run({hook_event_name:"UserPromptSubmit"},other).systemMessage,/another project/);
 const p=path.join(root,CORE_PATH);await writeFile(p,(await readFile(p,"utf8"))+"\nAltered contract\n");
 assert.match(run({hook_event_name:"UserPromptSubmit"}).systemMessage,/integrity mismatch/);
});
test("hook only says the core is loaded when a bootstrap covers the session's launch directory",async t=>{
 const root=await fixture(t);await mkdir(path.join(root,"app/src"),{recursive:true});
 await installBridgecode({project:root,packageRoot:PACKAGE_ROOT,instructionFiles:"none",instructionFile:["app/CLAUDE.md"]});
 const run=(e,cwd)=>JSON.parse(spawnSync(process.execPath,[path.join(root,HOOK_PATH)],{input:JSON.stringify({cwd,...e}),encoding:"utf8",cwd:root}).stdout).hookSpecificOutput.additionalContext;
 for(const event of [{hook_event_name:"UserPromptSubmit"},{hook_event_name:"SessionStart",source:"compact"}]){
  const outside=run(event,root);
  assert.ok(outside.includes("Read "+CORE_PATH+" once if it is not already in context."),event.hook_event_name);
  assert.doesNotMatch(outside,/do not re-read it|stays loaded through CLAUDE\.md/);
  for(const cwd of [path.join(root,"app"),path.join(root,"app/src")])assert.match(run(event,cwd),/do not re-read it|stays loaded through CLAUDE\.md/,cwd);
 }
});
