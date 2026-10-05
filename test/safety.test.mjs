import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, symlink } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { installBridgecode } from "../src/install.mjs";
import { inspectInstallation } from "../src/doctor.mjs";
import { loadPackageContext, sha256, validateRelativePath, METADATA_PATH, CORE_PATH, REVIEWER_PATH, PAYLOAD_DIR } from "../src/manifest.mjs";
import { buildBootstrap } from "../src/instructions.mjs";
import { updateBridgecode } from "../src/update.mjs";
import { applyTransaction, recoverTransaction, JOURNAL } from "../src/transaction.mjs";
import { fixture, PACKAGE_ROOT, simulatedPackage, snapshot } from "./helpers.mjs";
const options=root=>({project:root,packageRoot:PACKAGE_ROOT});
for(const unsafe of ["../escape","C:/x","aux.txt","foo./x","a//b","a:stream","a/../b"])
 test("unsafe path "+unsafe,()=>assert.throws(()=>validateRelativePath(unsafe)));
for(const text of ['<!-- bridgecode-claude:bootstrap:start broken -->','<!-- bridgecode-claude:bootstrap:end -->'])
 test("malformed bootstrap markers fail before writes: "+text,async t=>{
 const root=await fixture(t);await writeFile(path.join(root,"CLAUDE.md"),"# Mine\n"+text+"\n");const before=await snapshot(root);
 await assert.rejects(installBridgecode(options(root)),/markers|malformed/);assert.deepEqual(await snapshot(root),before);
});
test("additional malformed bootstrap markers make doctor and update fail without writes",async t=>{
 const root=await fixture(t);await installBridgecode(options(root));
 const p=path.join(root,"CLAUDE.md"),valid=await readFile(p,"utf8");
 for(const suffix of ["<!-- bridgecode-claude:bootstrap:start broken -->","<!-- bridgecode-claude:bootstrap:end broken -->"]){
  await writeFile(p,valid+"\n"+suffix);const before=await snapshot(root);
  assert.equal((await inspectInstallation(options(root))).ok,false);
  await assert.rejects(updateBridgecode(options(root)),/markers/);
  assert.deepEqual(await snapshot(root),before);
 }
});
for(const kind of ["changed-file","missing-coverage","forged-file-hash","forged-core-hash"])
 test("doctor and no-op update reject "+kind,async t=>{
 const root=await fixture(t);await installBridgecode(options(root));
 const p=path.join(root,METADATA_PATH),m=JSON.parse(await readFile(p));
 if(kind==="missing-coverage")delete m.managedFiles[".claude/bridgecode/writing.md"];
 else if(kind==="forged-core-hash"){
  const tampered=(await readFile(path.join(root,CORE_PATH),"utf8"))+"\nTampered contract\n";
  await writeFile(path.join(root,CORE_PATH),tampered);m.managedFiles[CORE_PATH]=sha256(tampered);
 }else{await writeFile(path.join(root,".claude/bridgecode/writing.md"),"tampered");if(kind==="forged-file-hash")m.managedFiles[".claude/bridgecode/writing.md"]=sha256("tampered");}
 await writeFile(p,JSON.stringify(m));const before=await snapshot(root);
 assert.equal((await inspectInstallation(options(root))).ok,false);
 await assert.rejects(updateBridgecode(options(root)));
 assert.deepEqual(await snapshot(root),before);
});
for(const owned of [CORE_PATH,REVIEWER_PATH])
 test("unowned existing payload path is a conflict with zero writes: "+owned,async t=>{
 const root=await fixture(t);await mkdir(path.dirname(path.join(root,owned)),{recursive:true});
 await writeFile(path.join(root,owned),await readFile(path.join(PACKAGE_ROOT,PAYLOAD_DIR,owned)));
 const before=await snapshot(root);await assert.rejects(installBridgecode(options(root)),/conflicts/);assert.deepEqual(await snapshot(root),before);
});
test("payload tampering and payload paths outside the allowlist are rejected",async t=>{
 const pkg=await simulatedPackage(t);await writeFile(path.join(pkg,PAYLOAD_DIR,".claude/bridgecode/README_HUMAN.txt"),"tampered");
 await assert.rejects(loadPackageContext(pkg),/checksum/);
 for(const bad of [".git/config","src/x.md","AGENTS.md",".claude/settings.json",".claude/agents/other.md"]){
  const fresh=await simulatedPackage(t),mp=path.join(fresh,"payload-manifest.json"),m=JSON.parse(await readFile(mp));
  m.files[bad]=sha256("x");await writeFile(mp,JSON.stringify(m));
  await assert.rejects(loadPackageContext(fresh),/Reserved payload/,bad);
 }
});
test("symlinked .claude is refused and the outside stays untouched",async t=>{
 const root=await fixture(t),outside=await fixture(t);
 await symlink(outside,path.join(root,".claude"),process.platform==="win32"?"junction":"dir");
 const before=await snapshot(outside);
 await assert.rejects(installBridgecode(options(root)),/symbolic|symlink|link/i);
 assert.deepEqual(await snapshot(outside),before);
});
test("post-check failure rolls back; failed rollback keeps recoverable journal",async t=>{
 const root=await fixture(t);await writeFile(path.join(root,"owned"),"before");
 await assert.rejects(applyTransaction(root,[{path:"owned",content:Buffer.from("after")}],{postCheck:async()=>{throw new Error("postcheck");}}),/rolled back/);
 assert.equal(await readFile(path.join(root,"owned"),"utf8"),"before");
 await assert.rejects(applyTransaction(root,[{path:"owned",content:Buffer.from("after")}],{postCheck:async()=>{await writeFile(path.join(root,"owned"),"external");throw new Error("failure");}}),/journal retained/);
 assert.equal(await readFile(path.join(root,"owned"),"utf8"),"external");
 assert.ok(await readFile(path.join(root,JOURNAL)));
 await writeFile(path.join(root,"owned"),"after");
 assert.equal((await recoverTransaction(root)).recovered,true);
 assert.equal(await readFile(path.join(root,"owned"),"utf8"),"before");
});
test("precondition conflict refuses mutation",async t=>{
 const root=await fixture(t);await writeFile(path.join(root,"owned"),"now");
 await assert.rejects(applyTransaction(root,[{path:"owned",content:Buffer.from("after")}],{preconditions:{owned:sha256("old")}}),/Concurrent modification/);
 assert.equal(await readFile(path.join(root,"owned"),"utf8"),"now");
});
test("pending journal blocks install without writes",async t=>{
 const root=await fixture(t);await mkdir(path.join(root,".bridgecode"));await writeFile(path.join(root,JOURNAL),"{}");
 const before=await snapshot(root);
 await assert.rejects(installBridgecode(options(root)),/Pending transaction/);assert.deepEqual(await snapshot(root),before);
});
test("unowned Claude bootstraps and reserved or non-CLAUDE.md targets are refused",async t=>{
 const root=await fixture(t);await writeFile(path.join(root,"CLAUDE.md"),buildBootstrap("4.3.2"));
 const before=await snapshot(root);
 await assert.rejects(installBridgecode(options(root)),/Unrecorded bootstrap/);
 assert.deepEqual(await snapshot(root),before);
 const clean=await fixture(t);
 for(const p of ["AGENTS.md","GEMINI.md",".git/CLAUDE.md",".GIT/CLAUDE.md","agentic/CLAUDE.md","AGENTIC/CLAUDE.md",".codex/CLAUDE.md","bridgecode/CLAUDE.md","BRIDGECODE/CLAUDE.md",".bridgecode/CLAUDE.md",".claude/settings.json",".claude/bridgecode/CLAUDE.md",".claude/agents/CLAUDE.md","../CLAUDE.md"]){
  await assert.rejects(installBridgecode({...options(clean),instructionFile:[p]}),/reserved|CLAUDE\.md file|Unsafe/i,p);
  assert.deepEqual(await snapshot(clean),{},p);
 }
 await assert.rejects(installBridgecode({...options(clean),instructionFiles:"both"}),/Invalid --instruction-files/);
});
test("new release path conflicts stop before writes even when bytes match",async t=>{
 const root=await fixture(t);await installBridgecode(options(root));
 const rel=".claude/bridgecode/new-file.md";
 await writeFile(path.join(root,rel),"repository owned");
 const pkg=await simulatedPackage(t),mp=path.join(pkg,"payload-manifest.json"),m=JSON.parse(await readFile(mp));
 await writeFile(path.join(pkg,PAYLOAD_DIR,rel),"new release");m.files[rel]=sha256("new release");await writeFile(mp,JSON.stringify(m));
 const before=await snapshot(root);
 await assert.rejects(updateBridgecode({project:root,packageRoot:pkg}),/conflicts/);
 assert.deepEqual(await snapshot(root),before);
 await writeFile(path.join(root,rel),"new release");const identical=await snapshot(root);
 await assert.rejects(updateBridgecode({project:root,packageRoot:pkg}),/conflicts/);
 assert.deepEqual(await snapshot(root),identical);
});
test("edited hook entry and unknown installed version are diagnosed without writes",async t=>{
 const root=await fixture(t);await installBridgecode(options(root));
 const p=path.join(root,".claude/settings.json"),c=JSON.parse(await readFile(p));
 c.hooks.UserPromptSubmit[0].hooks[0].timeout=99;await writeFile(p,JSON.stringify(c));
 const before=await snapshot(root);assert.equal((await inspectInstallation(options(root))).ok,false);
 await assert.rejects(updateBridgecode(options(root)),/hook entry conflict/);assert.deepEqual(await snapshot(root),before);
 const clean=await fixture(t);await installBridgecode(options(clean));
 const mp=path.join(clean,METADATA_PATH),m=JSON.parse(await readFile(mp));m.version="4.2.7";await writeFile(mp,JSON.stringify(m));
 const state=await snapshot(clean);await assert.rejects(updateBridgecode(options(clean)),/trusted migration snapshot/);assert.deepEqual(await snapshot(clean),state);
});
test("unrecorded Bridgecode hook entry and invalid settings.json fail without writes",async t=>{
 const root=await fixture(t);await mkdir(path.join(root,".claude"));
 await writeFile(path.join(root,".claude/settings.json"),"{ not json");let before=await snapshot(root);
 await assert.rejects(installBridgecode(options(root)),/not JSON/);assert.deepEqual(await snapshot(root),before);
 await writeFile(path.join(root,".claude/settings.json"),JSON.stringify({hooks:{UserPromptSubmit:[{hooks:[{type:"command",command:'node "$CLAUDE_PROJECT_DIR/.claude/hooks/bridgecode-turn.mjs"'}]}]}}));before=await snapshot(root);
 await assert.rejects(installBridgecode(options(root)),/Unrecorded Bridgecode hook entry/);assert.deepEqual(await snapshot(root),before);
 await writeFile(path.join(root,".claude/settings.json"),JSON.stringify({hooks:[]}));before=await snapshot(root);
 await assert.rejects(installBridgecode(options(root)),/Invalid hooks configuration/);assert.deepEqual(await snapshot(root),before);
});
test("update without an installation is refused",async t=>{
 const root=await fixture(t);
 await assert.rejects(updateBridgecode(options(root)),/not installed; run install/);
 assert.deepEqual(await snapshot(root),{});
});
