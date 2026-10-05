import path from "node:path";
import { sha256, validateRelativePath, CORE_PATH, PAYLOAD_PATHS, METADATA_PATH, HOOK_PATH } from "./manifest.mjs";
import { HOOK_CONFIG } from "./hooks.mjs";
import { JOURNAL } from "./transaction.mjs";

export const BOOTSTRAP_END = "<!-- bridgecode-claude:bootstrap:end -->";
const MARKER = "bridgecode-claude:bootstrap:";

function startPattern() {
  return /<!-- bridgecode-claude:bootstrap:start version="([^"]+)" schema="([^"]+)" -->/g;
}

function findAll(text, needle) {
  const result = [];
  let position = 0;
  while ((position = text.indexOf(needle, position)) !== -1) {
    result.push(position);
    position += needle.length;
  }
  return result;
}

export function buildBootstrap(version, eol = "\n", target = "CLAUDE.md") {
  return [
    `<!-- bridgecode-claude:bootstrap:start version="${version}" schema="1" -->`,
    "@" + path.posix.relative(path.posix.dirname(target), CORE_PATH),
    `Bridgecode ${version} (Claude Code edition) is imported above. Apply it within the host hierarchy and the current user scope. Read triggered .claude/bridgecode/ specialists before their governed actions, resume active work from agentic/analysis.md, and locate code through agentic/architecture.md.`,
    "After installing or updating Bridgecode, start a fresh Claude Code session.",
    BOOTSTRAP_END,
  ].join(eol);
}

// The Codex edition registers its own bootstrap; it is detected, never edited.
export function hasCodexBootstrap(text) {
  return text.includes("bridgecode:bootstrap:start");
}

export function parseBootstrap(text) {
  const starts = [...text.matchAll(startPattern())];
  const ends = findAll(text, BOOTSTRAP_END);
  if (starts.length === 0 && ends.length === 0 && !text.includes(MARKER)) return null;
  if (starts.length !== 1 || ends.length !== 1 || findAll(text, MARKER + "start").length !== 1 || findAll(text, MARKER + "end").length !== 1) {
    throw new Error("Bridgecode bootstrap markers are missing, duplicated, or malformed");
  }
  const start = starts[0].index;
  const end = ends[0] + BOOTSTRAP_END.length;
  if (end <= start) throw new Error("Bridgecode bootstrap marker order is malformed");
  const block = text.slice(start, end);
  return { start, end, version: starts[0][1], schema: Number(starts[0][2]), block, hash: sha256(block) };
}

export function upsertBootstrap(existingText, version, target) {
  const parsed = parseBootstrap(existingText);
  const eol = existingText.includes("\r\n") ? "\r\n" : "\n";
  const block = buildBootstrap(version, eol, target);
  if (parsed) {
    return { text: `${existingText.slice(0, parsed.start)}${block}${existingText.slice(parsed.end)}`, block };
  }
  if (existingText.length === 0) return { text: `${block}${eol}`, block };
  const separator = existingText.endsWith("\n") ? eol : `${eol}${eol}`;
  return { text: `${existingText}${separator}${block}${eol}`, block };
}

export function removeBootstrap(existingText) {
  const parsed = parseBootstrap(existingText);
  if (!parsed) return existingText;
  let start = parsed.start;
  let end = parsed.end;
  if (start > 0 && existingText.slice(0, start).endsWith("\r\n")) start -= 2;
  else if (start > 0 && existingText.slice(0, start).endsWith("\n")) start -= 1;
  if (existingText.startsWith("\r\n", end)) end += 2;
  else if (existingText.startsWith("\n", end)) end += 1;
  return `${existingText.slice(0, start)}${existingText.slice(end)}`;
}

const RESERVED = [...PAYLOAD_PATHS, METADATA_PATH, JOURNAL, HOOK_PATH, HOOK_CONFIG, ".claude/settings.local.json", "AGENTS.md"].map(p => p.toLowerCase());
export function validateInstructionPath(value) {
  const p = validateRelativePath(value, "instruction path");
  const lower = p.toLowerCase();
  if (path.posix.basename(p) !== "CLAUDE.md") throw new Error("Instruction bootstrap must target a CLAUDE.md file: " + p);
  if (RESERVED.includes(lower) || /^(?:\.git|\.codex|\.agents|\.bridgecode|bridgecode|agentic)(?:\/|$)/i.test(p) || (/^\.claude\//i.test(p) && p !== ".claude/CLAUDE.md")) {
    throw new Error("Instruction bootstrap overlaps reserved path: " + p);
  }
  return p;
}

// Claude Code loads CLAUDE.md and .claude/CLAUDE.md from the launch directory and its
// ancestors, so a bootstrap is eager only for sessions started inside its scope.
export function bootstrapScope(p) {
  let dir = path.posix.dirname(p);
  if (path.posix.basename(dir) === ".claude") dir = path.posix.dirname(dir);
  return dir;
}
export const isRootInstructionPath = p => bootstrapScope(p) === ".";

export function selectInstructionPaths({ mode, customPaths, previousPaths }) {
  const selected = new Set();
  if (mode === undefined) for (const item of previousPaths ?? []) selected.add(item);
  else if (mode === "claude") selected.add("CLAUDE.md");
  for (const item of customPaths ?? []) selected.add(item);
  const paths = [...selected].map(validateInstructionPath).sort();
  if (new Set(paths.map(p => p.toLowerCase())).size !== paths.length) throw new Error("Instruction paths alias each other");
  return paths;
}

export function assertInstructionMode(mode) {
  if (mode !== "claude" && mode !== "none") {
    throw new Error(`Invalid --instruction-files value: ${mode} (use claude or none)`);
  }
}
