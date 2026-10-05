import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { PACKAGE_ROOT, PAYLOAD_DIR, PAYLOAD_PATHS } from '../src/manifest.mjs';
// Claude Code edition authoring source; it mirrors the installed tree. Never the Codex source.
const source=path.resolve(PACKAGE_ROOT,'../claude_condensation');
const copies=[...PAYLOAD_PATHS.map(p=>[p,path.join(PAYLOAD_DIR,p)]),['hooks/bridgecode-turn.mjs','hooks/bridgecode-turn.mjs']];
for(const [from,to]of copies){
  const target=path.join(PACKAGE_ROOT,to);
  await mkdir(path.dirname(target),{recursive:true});
  await writeFile(target,await readFile(path.join(source,from)));
}
console.log('Canonical Claude Code edition payload synchronized.');
