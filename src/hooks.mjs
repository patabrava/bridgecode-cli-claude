import { sha256 } from './manifest.mjs';
export const HOOK_CONFIG='.claude/settings.json';
const OWNED='/.claude/hooks/bridgecode-turn.mjs';
export function hookEntries() {
  // $CLAUDE_PROJECT_DIR keeps the shared settings file portable across checkouts.
  const command='node "$CLAUDE_PROJECT_DIR/.claude/hooks/bridgecode-turn.mjs"';
  return {
    UserPromptSubmit:{hooks:[{type:'command',command,timeout:10}]},
    SessionStart:{matcher:'compact',hooks:[{type:'command',command,timeout:10}]},
  };
}
export function parseHookConfig(bytes) {
  let c;
  try{c=bytes?JSON.parse(bytes.toString('utf8')):{};}catch{throw new Error('Invalid '+HOOK_CONFIG+': not JSON');}
  if(!c||Array.isArray(c)||typeof c!=='object'||(c.hooks!==undefined && (!c.hooks||Array.isArray(c.hooks)||typeof c.hooks!=='object')))throw new Error('Invalid hooks configuration in '+HOOK_CONFIG);
  c.hooks??={};
  for(const [k,v]of Object.entries(c.hooks))if(!Array.isArray(v))throw new Error('Hook event must be an array: '+k);
  return c;
}
export const ownedEntries=list=>list.filter(e=>Array.isArray(e?.hooks)&&e.hooks.some(h=>typeof h?.command==='string'&&h.command.includes(OWNED)));
export function entryHash(entry){return sha256(JSON.stringify(entry));}
export function mergeHooks(bytes,previous,enabled) {
  const c=parseHookConfig(bytes),next=hookEntries();
  for(const event of ['UserPromptSubmit','SessionStart']) {
    const list=c.hooks[event]??[];
    const owned=ownedEntries(list);
    if(previous) {
      if(owned.length!==1||entryHash(owned[0])!==previous[event])throw new Error('Managed hook entry conflict: '+event);
    } else if(owned.length)throw new Error('Unrecorded Bridgecode hook entry: '+event);
    const keep=list.filter(e=>!owned.includes(e));
    if(enabled)keep.push(next[event]);
    if(keep.length)c.hooks[event]=keep;else delete c.hooks[event];
  }
  return {bytes:Buffer.from(JSON.stringify(c,null,2)+'\n'),entries:enabled?Object.fromEntries(Object.entries(next).map(([k,e])=>[k,entryHash(e)])):null};
}
