import { assertProjectDirectory, loadPackageContext, readOptional, METADATA_PATH, EDITION } from "./manifest.mjs";
import { verifyInstalled } from "./verification.mjs";
import { hasCodexBootstrap, isRootInstructionPath } from "./instructions.mjs";
import { detectCodex, codexRemovalCommand, codexBootstrapWarning, NO_ROOT_BOOTSTRAP } from "./install.mjs";
import { JOURNAL } from "./transaction.mjs";

const ARCHITECTURE_PATH="agentic/architecture.md";
const IMPORT_NOTICE="Imported repository constraints — verification pending";

export async function inspectInstallation({projectRoot,project,packageRoot,packageContext}={}) {
  const root=await assertProjectDirectory(projectRoot??project??".");
  const context=packageContext??await loadPackageContext(packageRoot),checks=[],warnings=[];
  let metadata,installed=false,migrationPending=false;
  try{
    if(await readOptional(root,JOURNAL))throw new Error("Pending transaction: run bridgecode-claude recover");
    const bytes=await readOptional(root,METADATA_PATH);
    if(!bytes)throw new Error("Bridgecode Claude Code edition is not installed");
    metadata=JSON.parse(bytes);
    if(metadata.version!==context.packageJson.version)throw new Error("Use doctor from the installed exact package version");
    await verifyInstalled(context,metadata,p=>readOptional(root,p));
    installed=true;
    checks.push({name:"canonical payload, metadata, bootstrap and hook registration",ok:true,detail:"complete expected set verified against package"});
  }catch(e){checks.push({name:"installation integrity",ok:false,detail:e.message});}
  try{
    if(installed&&!metadata.instructionFiles.some(isRootInstructionPath))warnings.push(NO_ROOT_BOOTSTRAP);
    for(const p of installed?metadata.instructionFiles:[]){
      if(hasCodexBootstrap((await readOptional(root,p))?.toString("utf8")??""))warnings.push(codexBootstrapWarning(p,await codexRemovalCommand(root)));
    }
    if(await detectCodex(root))warnings.push("Codex edition installation detected; it is left untouched. Both editions share agentic/ memory.");
    if((await readOptional(root,ARCHITECTURE_PATH))?.toString("utf8").includes(IMPORT_NOTICE)){
      migrationPending=true;
      warnings.push("URGENT: agentic/architecture.md holds imported constraints that remain binding and unverified. Reconcile them with code/tests within authorized scope.");
    }
  }catch(e){checks.push({name:"repository instruction/memory access",ok:false,detail:e.message});}
  if(installed&&metadata.hooksEnabled)warnings.push("Hook registration verified; Claude Code loads hooks at session start—review them with /hooks. Live delivery and model compliance are not certified.");
  return {ok:checks.every(c=>c.ok),edition:EDITION,projectRoot:root,version:metadata?.version,checks,warnings,migrationPending};
}
export function formatDoctorReport(r){return ["Bridgecode doctor (Claude Code edition) for "+r.projectRoot,...r.checks.map(c=>(c.ok?"PASS":"FAIL")+"  "+c.name+": "+c.detail),...r.warnings.map(w=>"NOTE  "+w),r.ok?"Doctor passed.":"Doctor found problems; no files changed."].join("\n");}
export async function doctorBridgecode(options={}){const report=await inspectInstallation(options);return {report,output:formatDoctorReport(report)};}
