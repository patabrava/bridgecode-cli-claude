import { cp, mkdtemp, readFile, readdir, rm, writeFile, mkdir, realpath } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PAYLOAD_PATHS, PAYLOAD_DIR, sha256 } from "../src/manifest.mjs";
export const PACKAGE_ROOT=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const MANAGED_PATHS=PAYLOAD_PATHS;
// Canonical path: macOS temp dirs sit behind /tmp → /private/tmp style links.
export async function fixture(t,prefix="bridgecode-test-"){
 const root=await realpath(await mkdtemp(path.join(os.tmpdir(),prefix)));
 t.after(()=>rm(root,{recursive:true,force:true}));return root;
}
export async function snapshot(root){
 const result={};
 async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){
  const p=path.join(dir,e.name),r=path.relative(root,p).split(path.sep).join("/");
  if(e.isDirectory())await walk(p);else if(e.isSymbolicLink())result[r]="symlink";else result[r]=sha256(await readFile(p));
 }}await walk(root);return result;
}
export async function writeManifest(root,name="@bridgecode/cli-claude",version="4.3.3"){
 const files={};for(const p of MANAGED_PATHS)files[p]=sha256(await readFile(path.join(root,PAYLOAD_DIR,p)));
 const hookHash=sha256(await readFile(path.join(root,"hooks/bridgecode-turn.mjs")));
 await writeFile(path.join(root,"payload-manifest.json"),JSON.stringify({package:name,edition:"claude-code",version,schemaVersion:1,files,hookHash},null,2)+"\n");
}
export async function simulatedPackage(t,version="4.3.3"){
 const root=await fixture(t,"bridgecode-package-");
 for(const p of [PAYLOAD_DIR,"hooks","package.json"])await cp(path.join(PACKAGE_ROOT,p),path.join(root,p),{recursive:true});
 const pkg=JSON.parse(await readFile(path.join(PACKAGE_ROOT,"package.json"),"utf8"));
 const files={};for(const p of MANAGED_PATHS)files[p]=await readFile(path.join(PACKAGE_ROOT,PAYLOAD_DIR,p),"utf8");
 const manifest=JSON.parse(await readFile(path.join(PACKAGE_ROOT,"payload-manifest.json"),"utf8"));
 await mkdir(path.join(root,"legacy"));
 await writeFile(path.join(root,"legacy",pkg.version+".json"),JSON.stringify({version:pkg.version,edition:"claude-code",schemaVersion:1,files,hookHash:manifest.hookHash}));
 pkg.version=version;await writeFile(path.join(root,"package.json"),JSON.stringify(pkg));
 const writing=path.join(root,PAYLOAD_DIR,".claude/bridgecode/writing.md");
 await writeFile(writing,files[".claude/bridgecode/writing.md"]+"\nSimulation "+version+"\n");
 await writeManifest(root,pkg.name,version);return root;
}
// A stand-in Codex edition installation; only its bytes matter (they must stay untouched).
export const CODEX_PATHS=["AGENTS.md","README_HUMAN.txt","bridgecode/best-agent.md","bridgecode/writing.md",".codex/hooks.json",".codex/hooks/bridgecode-turn.mjs",".bridgecode/installation.json"];
export async function codexInstall(root){
 const content={
  "AGENTS.md":'<!-- bridgecode:managed:start version="4.3.2" schema="2" -->\n# Bridgecode 4.3.2\nCodex core.\n<!-- bridgecode:managed:end -->\n## Team\nKeep.\n',
  "README_HUMAN.txt":"BRIDGECODE 4.3.2 — QUICK GUIDE (Codex)\n",
  "bridgecode/best-agent.md":"# Codex Best Agent\n",
  "bridgecode/writing.md":"# Codex writing\n",
  ".codex/hooks.json":JSON.stringify({hooks:{UserPromptSubmit:[{hooks:[{type:"command",command:`node "${root}/.codex/hooks/bridgecode-turn.mjs"`,timeout:10}]}]}},null,2)+"\n",
  ".codex/hooks/bridgecode-turn.mjs":"// codex hook\n",
  ".bridgecode/installation.json":JSON.stringify({package:"@bridgecode/cli",version:"4.3.2",schemaVersion:2})+"\n",
 };
 for(const [p,s]of Object.entries(content)){await mkdir(path.dirname(path.join(root,p)),{recursive:true});await writeFile(path.join(root,p),s);}
}
export async function codexSnapshot(root){
 const all=await snapshot(root);
 return Object.fromEntries(CODEX_PATHS.map(p=>[p,all[p]]));
}
