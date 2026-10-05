import { doctorBridgecode } from "./doctor.mjs";
import { formatLifecycleSummary, installBridgecode } from "./install.mjs";
import { PACKAGE_ROOT, assertProjectDirectory } from "./manifest.mjs";
import { updateBridgecode } from "./update.mjs";
import { recoverTransaction } from "./transaction.mjs";

const HELP = `Bridgecode CLI — Claude Code edition

Usage:
  bridgecode-claude install [--project <path>] [--dry-run]
  bridgecode-claude update  [--project <path>] [--dry-run]
  bridgecode-claude doctor  [--project <path>]
  bridgecode-claude recover [--project <path>]
  --hooks | --no-hooks    Register Claude Code heartbeat/compaction hooks in .claude/settings.json (default: on)
  --json                  Return structured results

Instruction registration:
  --instruction-files claude|none          claude (default): bootstrap block in root CLAUDE.md
  --instruction-file <path/to/CLAUDE.md>   additional CLAUDE.md bootstrap (repeatable)

The core and specialists are installed under .claude/bridgecode/ and imported from
CLAUDE.md. This edition coexists with the Codex edition (@bridgecode/cli): it never
writes AGENTS.md, bridgecode/, .codex/ or the Codex installation metadata, and both
editions share agentic/ memory.
`;

export function parseArguments(argv) {
  const [command = "help", ...rest] = argv;
  const options = {
    project: ".",
    dryRun: false,
    instructionFile: [],
    packageRoot: PACKAGE_ROOT,
  };
  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--hooks" || argument === "--no-hooks") {
      options.hooks = argument === "--hooks";
    } else if (argument === "--json") {
      options.json = true;
    } else if (argument === "--project") {
      options.project = rest[++index];
      if (!options.project) throw new Error("--project requires a path");
    } else if (argument === "--instruction-files") {
      options.instructionFiles = rest[++index];
      if (!options.instructionFiles) {
        throw new Error("--instruction-files requires a mode");
      }
    } else if (argument === "--instruction-file") {
      const value = rest[++index];
      if (!value) throw new Error("--instruction-file requires a path");
      options.instructionFile.push(value);
    } else if (argument === "--help" || argument === "-h") {
      return { command: "help", options };
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return { command, options };
}

export async function run(argv) {
  const { command, options } = parseArguments(argv);
  if (command === "help" || command === "--help" || command === "-h") {
    return { code: 0, output: HELP };
  }
  if (command === "install") {
    const summary = await installBridgecode(options);
    return { code: 0, output: options.json ? JSON.stringify(summary) : formatLifecycleSummary(summary) };
  }
  if (command === "update") {
    const summary = await updateBridgecode(options);
    return { code: 0, output: options.json ? JSON.stringify(summary) : formatLifecycleSummary(summary) };
  }
  if (command === "doctor") {
    const { report, output } = await doctorBridgecode(options);
    return { code: report.ok ? 0 : 1, output: options.json ? JSON.stringify(report) : output };
  }
  if (command === "recover") {
    if (options.dryRun) throw new Error("recover requires an explicit real recovery invocation");
    const result = await recoverTransaction(await assertProjectDirectory(options.project));
    return {code:0,output:options.json?JSON.stringify(result):result.recovered?"Recovery completed; run doctor with the previous installed version.":"No pending recovery."};
  }
  throw new Error(`Unknown command: ${command}\n\n${HELP}`);
}

export async function main(argv) {
  try {
    const result = await run(argv);
    process.stdout.write(`${result.output}\n`);
    process.exitCode = result.code;
  } catch (error) {
    process.stderr.write(`Bridgecode error: ${error.message}\n`);
    process.exitCode = 1;
  }
}
