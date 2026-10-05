import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { assertHashMap, sha256, HOOK_PATH, EDITION, SCHEMA_VERSION } from './manifest.mjs';
import { parseBootstrap, buildBootstrap, validateInstructionPath } from './instructions.mjs';
import { HOOK_CONFIG, parseHookConfig, hookEntries, entryHash, ownedEntries } from './hooks.mjs';

export function sameKeys(a,b) {return JSON.stringify(Object.keys(a).sort())===JSON.stringify(Object.keys(b).sort());}
// Canonical content comes from the package itself or an explicit trusted snapshot, never from metadata.
export async function releaseFor(context,version) {
  if(version===context.packageJson.version)return {schemaVersion:SCHEMA_VERSION,edition:EDITION,version,files:context.manifest.files,hookHash:context.manifest.hookHash};
  if(typeof version!=='string'||!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(version))throw new Error('Invalid installed version');
  const old=JSON.parse(await readFile(path.join(context.packageRoot,'legacy',version+'.json'),'utf8').catch(()=>{throw new Error('No trusted migration snapshot for '+version+'; use a release supporting that version');}));
  if(old.version!==version||old.edition!==EDITION)throw new Error('Legacy snapshot identity mismatch');
  return {schemaVersion:old.schemaVersion,edition:old.edition,version,files:Object.fromEntries(Object.entries(old.files).map(([p,s])=>[p,sha256(Buffer.from(s))])),hookHash:old.hookHash};
}
export async function verifyInstalled(context,metadata,read) {
  if(!metadata||metadata.package!==context.packageJson.name||metadata.edition!==EDITION||metadata.schemaVersion!==SCHEMA_VERSION)throw new Error('Unsupported installation metadata');
  const release=await releaseFor(context,metadata.version);
  if(release.schemaVersion!==metadata.schemaVersion)throw new Error('Installed schema mismatch');
  assertHashMap(metadata.managedFiles,'managed metadata path');
  assertHashMap(metadata.bootstraps,'bootstrap metadata path');
  if(typeof metadata.hooksEnabled!=='boolean')throw new Error('Missing hooks mode');
  const expected={...release.files};
  if(metadata.hooksEnabled)expected[HOOK_PATH]=release.hookHash;
  if(!sameKeys(expected,metadata.managedFiles))throw new Error('Incomplete or unexpected managed file coverage');
  for(const [p,h]of Object.entries(expected)){
    const bytes=await read(p);
    if(metadata.managedFiles[p]!==h||!bytes||sha256(bytes)!==h)throw new Error('Managed file conflict: '+p);
  }
  if(!Array.isArray(metadata.instructionFiles)||metadata.instructionFiles.length!==new Set(metadata.instructionFiles).size||!sameKeys(Object.fromEntries(metadata.instructionFiles.map(p=>[p,0])),metadata.bootstraps))throw new Error('Incomplete bootstrap coverage');
  for(const p of metadata.instructionFiles){
    try{validateInstructionPath(p);}catch{throw new Error('Reserved bootstrap target: '+p);}
    const b=await read(p),block=b&&parseBootstrap(b.toString('utf8'));
    const eol=block?.block.includes('\r\n')?'\r\n':'\n';
    if(!block||block.block!==buildBootstrap(release.version,eol,p)||block.hash!==metadata.bootstraps[p])throw new Error('Managed bootstrap conflict: '+p);
  }
  if(metadata.hooksEnabled){
    const config=parseHookConfig(await read(HOOK_CONFIG)),expectedEntries=hookEntries();
    if(!metadata.hookEntries||!sameKeys(expectedEntries,metadata.hookEntries))throw new Error('Incomplete hook coverage');
    for(const [event,entry]of Object.entries(expectedEntries)){
      const owned=ownedEntries(config.hooks[event]??[]);
      if(owned.length!==1||entryHash(owned[0])!==entryHash(entry)||metadata.hookEntries[event]!==entryHash(entry))throw new Error('Managed hook entry conflict: '+event);
    }
  }else if(metadata.hookEntries!==null)throw new Error('Unexpected hook metadata');
  return {ok:true};
}
