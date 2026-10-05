import path from "node:path";
import { assertProjectDirectory, loadPackageContext, readOptional, readPayloadFile, METADATA_PATH, HOOK_PATH, EDITION, SCHEMA_VERSION, CORE_PATH, sha256 } from "./manifest.mjs";
import { assertInstructionMode, selectInstructionPaths, upsertBootstrap, removeBootstrap, parseBootstrap, hasCodexBootstrap, isRootInstructionPath } from "./instructions.mjs";
import { HOOK_CONFIG, mergeHooks } from "./hooks.mjs";
import { verifyInstalled } from "./verification.mjs";
import { applyTransaction, JOURNAL } from "./transaction.mjs";

// The Codex edition (@bridgecode/cli) may share this project. Its AGENTS.md, bridgecode/,
// .codex/ and .bridgecode/installation.json are only observed for reporting, never written;
// an unreadable Codex path must not block or join this edition's transaction preconditions.
export async function detectCodex(root) {
  const peek=p=>readOptional(root,p).catch(()=>null);
  if (await peek(".bridgecode/installation.json") || await peek(".codex/hooks.json")) return true;
  return Boolean((await peek("AGENTS.md"))?.toString("utf8").includes("bridgecode:managed:start"));
}
// The Codex CLI owns its CLAUDE.md bootstrap. Its --instruction-files flag drops every
// unlisted bootstrap, so re-list its non-CLAUDE.md files to keep them.
export async function codexRemovalCommand(root) {
  let meta=null;
  try{meta=JSON.parse((await readOptional(root,".bridgecode/installation.json"))?.toString("utf8")??"null");}catch{}
  const version=/^\d+\.\d+\.\d+$/.test(meta?.version??"")?meta.version:"4.3.2";
  const keep=(Array.isArray(meta?.instructionFiles)?meta.instructionFiles:[]).filter(p=>typeof p==="string"&&path.posix.basename(p)!=="CLAUDE.md");
  return [`npx -y @bridgecode/cli@${version} update --project . --instruction-files agents`,...keep.map(p=>"--instruction-file "+JSON.stringify(p))].join(" ");
}

export async function prepareLifecycle({command,project=".",packageRoot,dryRun=false,instructionFiles,instructionFile=[],hooks,transactionFailAfterWrites=0}={}) {
  const root=await assertProjectDirectory(project),context=await loadPackageContext(packageRoot);
  const version=context.packageJson.version;
  const preconditions={}; const cache=new Map();
  async function read(p){ if(!cache.has(p)){const b=await readOptional(root,p);cache.set(p,b);preconditions[p]=b?sha256(b):null;} return cache.get(p); }
  if(await read(JOURNAL))throw new Error("Pending transaction; run bridgecode-claude recover before updating");
  // Journal is created by our own transaction after this preflight.
  delete preconditions[JOURNAL];
  const metadataBytes=await read(METADATA_PATH);
  let metadata=null;
  if(metadataBytes){try{metadata=JSON.parse(metadataBytes);}catch{throw new Error("Installation metadata is not valid JSON; recover it before updating");}}
  if(metadata)await verifyInstalled(context,metadata,read);
  else if(command==="update")throw new Error("Bridgecode Claude Code edition is not installed; run install");
  const changes=new Map();
  async function set(p,bytes){
    const current=await read(p);
    if((current?sha256(current):null)!==(bytes?sha256(bytes):null))changes.set(p,bytes);
  }
  const previousManaged=metadata?.managedFiles??{};
  const desired={};
  for(const [p,h]of Object.entries(context.manifest.files)){
    const current=await read(p);
    if(current&&!Object.hasOwn(previousManaged,p))throw new Error("New payload path conflicts with repository content: "+p);
    if(current&&Object.hasOwn(previousManaged,p)&&sha256(current)!==previousManaged[p])throw new Error("Managed file conflict: "+p);
    desired[p]=h;await set(p,await readPayloadFile(context,p));
  }
  const hooksEnabled=hooks??metadata?.hooksEnabled??true;
  let hookEntries=null;
  if(hooksEnabled||metadata?.hooksEnabled){
    const current=await read(HOOK_PATH);
    if(current && !Object.hasOwn(previousManaged,HOOK_PATH))throw new Error("Unowned hook script collision");
    const merged=mergeHooks(await read(HOOK_CONFIG),metadata?.hooksEnabled?metadata.hookEntries:null,hooksEnabled);
    await set(HOOK_CONFIG,merged.bytes);
    hookEntries=merged.entries;
    if(hooksEnabled){desired[HOOK_PATH]=sha256(context.hook);await set(HOOK_PATH,context.hook);}
  }
  for(const [p,h]of Object.entries(previousManaged)){
    if(Object.hasOwn(desired,p))continue;
    const bytes=await read(p);
    if(bytes && sha256(bytes)!==h)throw new Error("Retired managed file was modified: "+p);
    if(bytes)await set(p,null);
  }
  const instructionMode=instructionFiles??metadata?.instructionMode??"claude";
  assertInstructionMode(instructionMode);
  const paths=selectInstructionPaths({mode:instructionFiles===undefined&&metadata?undefined:instructionMode,customPaths:instructionFile,previousPaths:metadata?.instructionFiles});
  const bootstraps={};
  let codexBootstrapInClaude=false;
  for(const p of new Set([...paths,...Object.keys(metadata?.bootstraps??{})])){
    const old=(await read(p))?.toString("utf8")??"";
    if(parseBootstrap(old)&&!Object.hasOwn(metadata?.bootstraps??{},p))throw new Error("Unrecorded bootstrap ownership: "+p);
    if(paths.includes(p)){
      const out=upsertBootstrap(old,version,p);bootstraps[p]=sha256(out.block);await set(p,Buffer.from(out.text));
      if(hasCodexBootstrap(out.text))codexBootstrapInClaude=true;
    }
    else{const out=removeBootstrap(old);await set(p,out.trim()?Buffer.from(out):null);}
  }
  // Reject aliasing between all managed/shared paths, including case-insensitive hosts.
  const all=[...Object.keys(desired),...paths,HOOK_CONFIG,METADATA_PATH];
  if(new Set(all.map(p=>p.toLowerCase())).size!==all.length)throw new Error("Managed target paths alias each other");
  const next={package:context.packageJson.name,edition:EDITION,version,schemaVersion:SCHEMA_VERSION,instructionMode,instructionFiles:paths,managedFiles:desired,bootstraps,hooksEnabled,hookEntries:hooksEnabled?hookEntries:null};
  await set(METADATA_PATH,Buffer.from(JSON.stringify(next,null,2)+"\n"));
  const projected=async p=>changes.has(p)?changes.get(p):read(p);
  await verifyInstalled(context,next,projected);
  const codexDetected=await detectCodex(root);
  const summary={command,edition:EDITION,projectRoot:root,version,dryRun,changes:[...changes].map(([p,b])=>({path:p,action:b===null?"remove verified managed file":"write"})),hooksEnabled,coreAutoloaded:paths.some(isRootInstructionPath),codexDetected,codexBootstrapInClaude,codexRemovalCommand:codexBootstrapInClaude?await codexRemovalCommand(root):null,verified:false};
  if(!dryRun){
    const check=()=>verifyInstalled(context,next,p=>readOptional(root,p));
    if(changes.size)await applyTransaction(root,[...changes].map(([p,content])=>({path:p,content})),{preconditions,postCheck:check,failAfterWrites:transactionFailAfterWrites});
    else await check();
    summary.verified=true;
  }
  return summary;
}
export const installBridgecode = options => prepareLifecycle({...options,command:"install"});
export const NO_ROOT_BOOTSTRAP=`No root CLAUDE.md or .claude/CLAUDE.md bootstrap: sessions started at the project root will not load the core automatically (a nested CLAUDE.md loads only for sessions started inside its directory). Register --instruction-files claude or import @${CORE_PATH} yourself.`;
export const codexBootstrapWarning=(file,command)=>`WARNING: ${file} also carries the Codex edition bootstrap, which points Claude Code at the Codex core. Remove it with the Codex CLI, which owns it (this keeps its other registered bootstraps): ${command}`;
export function formatLifecycleSummary(s){
  return [
    `${s.dryRun?"DRY RUN":"DONE"}: Bridgecode ${s.version} (Claude Code edition) ${s.command} for ${s.projectRoot}`,
    ...(s.changes.length?s.changes.map(c=>c.action+": "+c.path):["No changes required; installation is idempotent."]),
    s.dryRun?"Projected verification passed; zero writes.":"Doctor passed for the installed payload and registration.",
    s.hooksEnabled?"Claude Code hooks registered in .claude/settings.json; not runtime-certified. Start a new Claude Code session and review them with /hooks.":s.coreAutoloaded?"Hooks disabled; the CLAUDE.md import still loads the core.":"Hooks disabled.",
    ...(s.coreAutoloaded?[]:[NO_ROOT_BOOTSTRAP]),
    ...(s.codexDetected?["Codex edition detected and left untouched; both editions share agentic/ memory."]:[]),
    ...(s.codexBootstrapInClaude?[codexBootstrapWarning("CLAUDE.md",s.codexRemovalCommand)]:[]),
    "Start a fresh Claude Code session after installing or updating."
  ].join("\n");
}
