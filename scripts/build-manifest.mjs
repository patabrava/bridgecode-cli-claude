import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PACKAGE_ROOT, PAYLOAD_DIR, PAYLOAD_PATHS, SCHEMA_VERSION, EDITION, sha256 } from "../src/manifest.mjs";
const pkg=JSON.parse(await readFile(path.join(PACKAGE_ROOT,"package.json"),"utf8"));
const files={};
for(const p of PAYLOAD_PATHS)files[p]=sha256(await readFile(path.join(PACKAGE_ROOT,PAYLOAD_DIR,p)));
const manifest={package:pkg.name,edition:EDITION,version:pkg.version,schemaVersion:SCHEMA_VERSION,files,hookHash:sha256(await readFile(path.join(PACKAGE_ROOT,"hooks/bridgecode-turn.mjs")))};
await writeFile(path.join(PACKAGE_ROOT,"payload-manifest.json"),JSON.stringify(manifest,null,2)+"\n");
