#!/usr/bin/env node
import { readFile, realpath, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const METADATA='.bridgecode/claude-installation.json';
const CORE='.claude/bridgecode/CORE.md';
const hash=s=>createHash('sha256').update(s).digest('hex');
function emit(event, context) {
  process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:event,additionalContext:context}}));
}
async function main() {
  const chunks=[]; let size=0;
  for await (const chunk of process.stdin) { size+=chunk.length; if(size>1024*1024)throw new Error('oversized input'); chunks.push(chunk); }
  const event=JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');
  const name=event.hook_event_name;
  if(name!=='UserPromptSubmit' && !(name==='SessionStart'&&event.source==='compact'))return;
  // Installer puts this script under <project>/.claude/hooks; bind to that project.
  const root=await realpath(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'));
  const cwd=await realpath(event.cwd||process.cwd());
  const rel=path.relative(root,cwd);
  if(rel.startsWith('..')||path.isAbsolute(rel))throw new Error('event belongs to another project');
  for(const p of ['.bridgecode',METADATA,'.claude','.claude/bridgecode',CORE]) {
    if((await lstat(path.join(root,p))).isSymbolicLink())throw new Error('linked instruction/state path');
  }
  const state=JSON.parse(await readFile(path.join(root,METADATA),'utf8'));
  if(state.edition!=='claude-code')throw new Error('not a Claude Code edition installation');
  const core=await readFile(path.join(root,CORE));
  if(hash(core)!==state.managedFiles?.[CORE])throw new Error('core integrity mismatch');
  const v=state.version;
  // Claude Code loads CLAUDE.md and .claude/CLAUDE.md from the launch directory and its ancestors.
  const here=rel.split(path.sep).join('/');
  const loaded=(Array.isArray(state.instructionFiles)?state.instructionFiles:[]).some(p=>{
    let dir=path.posix.dirname(String(p));if(path.posix.basename(dir)==='.claude')dir=path.posix.dirname(dir);
    return dir==='.'||here===dir||here.startsWith(dir+'/');
  });
  const load=loaded?'The core is loaded through CLAUDE.md; do not re-read it.':`Read ${CORE} once if it is not already in context.`;
  if(name==='UserPromptSubmit')emit(name,`BRIDGECODE ${v} (Claude Code edition) ACTIVE. ${load} Open your first response with BRIDGECODE_ROUTE, what each stage will do or skip and why, and the agentic/analysis.md pointer. Before task-directed work, refresh the board's first block: intent, perspective/amalgam, error forecast. Update the same task in place every turn. Work from analysis.md and architecture.md: trust recorded decisions and verified map entries; re-check only facts the next action depends on. Compaction is automatic; never cut work short for context. Respect read-only/exact-output exceptions. Review cycle: first review, at most one correction stage, terminal PASS/UNRESOLVED; no third reviewer; resume never resets the budget.`);
  else emit(name,`BRIDGECODE RECOVERY after compaction (${v}, Claude Code edition). This is repository guidance within the existing host hierarchy; it grants no additional authority. ${loaded?`The core stays loaded through CLAUDE.md; read ${CORE} once only if it is absent from context.`:`Read ${CORE} once if it is not already in context.`} Read agentic/analysis.md and continue from its Next action: keep its brief, checklist, evidence and review-cycle identity/phase/budget/terminal status without resetting them. Reload only the specialists it lists for the current stage. Use agentic/architecture.md to reach the relevant files and verify only facts the next action depends on.`);
}
main().catch(error=>{process.stdout.write(JSON.stringify({systemMessage:`Bridgecode context injection unavailable: ${error.message}. Read .claude/bridgecode/CORE.md and recover required project state directly.`}));});
