import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import readline from "node:readline/promises";

const APP_DIR = path.dirname(fileURLToPath(import.meta.url));
const TOOL_DIR = path.resolve(APP_DIR, "..");
const RUNTIME_DIR = path.join(TOOL_DIR, "runtime");
const BACKUP_ROOT =
  process.env.TP_BODY_MORPHER_BACKUP_ROOT ||
  process.env.TP_MORPHER_BACKUP_ROOT ||
  path.join(TOOL_DIR, "Backups");
const SAVE_ROOT =
  process.env.TP_SAVE_ROOT ||
  path.join(process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || "", "AppData", "Local"), "TheParasites", "Saved", "SaveGames");

const OODLE_ENTRY = path.join(RUNTIME_DIR, "node_modules", "oodle.js", "dist", "index.js");
const OODLE_DLL = path.join(RUNTIME_DIR, "node_modules", "oodle.js", "bin", "oodle-x64.dll");

const MAGIC = 0x9e2a83c1;
const HEADER_MARKER = 0x22222222;
const CHUNK_HEADER_SIZE = 49;
const UNREAL_CHUNK_SIZE = 0x20000;
const GAME_PROCESS_NAME = "TheParasites";

const DIRECT_VALUES = [
  {
    key: "body-weight",
    property: "BodyWeight",
    label: "BodyWeight",
    note: "Observed in-game weight scale: 0.0 = about 46 kg, 1.0 = about 59 kg; the game clamps this back to 0..1 when saving.",
  },
  {
    key: "chest-size",
    property: "ChestSize",
    label: "ChestSize",
    note: "Observed to clamp back to 0..1 when the game saves.",
  },
];

const MORPH_VALUES = [
  { key: "belly-fat", morph: "SS Belly Shape Fat 1", label: "Belly fat" },
  { key: "thigh-inflate", morph: "SS Thigh Inflate", label: "Thigh inflate" },
  { key: "thigh-inflate-alt", morph: "SS_Thigh_Inflate", label: "Thigh inflate alt" },
  { key: "hip-size", morph: "SS Hip Size 1", label: "Hip size" },
  { key: "arm-size", morph: "SS Arm Size", label: "Arm size" },
  { key: "glute-size", morph: "SS Glute Size 3", label: "Glute size" },
  { key: "calf-size", morph: "SS Calf Type 1", label: "Calf size" },
  { key: "breast-size", morph: "BC Breast Size", label: "Breast size" },
  { key: "breast-sag", morph: "BC Breast Sag1", label: "Breast sag" },
];

const DIRECT_BY_KEY = new Map(DIRECT_VALUES.map((entry) => [entry.key, entry]));
const MORPH_BY_KEY = new Map(MORPH_VALUES.map((entry) => [entry.key, entry]));
const MORPH_BY_NAME = new Map(MORPH_VALUES.map((entry) => [entry.morph, entry]));

let oodleModule = null;
let oodle = null;
let rl = null;

function stamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}-${ms}`;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

function formatValue(value) {
  if (value === null || value === undefined) return "missing";
  return Number.isInteger(value) ? String(value) : String(value);
}

function estimateWeightKg(bodyWeight) {
  return 46 + bodyWeight * 13;
}

function assertPortableRuntime() {
  if (process.arch !== "x64") {
    throw new Error(`This package only includes the x64 runtime. Current architecture: ${process.arch}`);
  }
  for (const required of [OODLE_ENTRY, OODLE_DLL]) {
    if (!fs.existsSync(required)) {
      throw new Error(`Portable dependency is missing: ${required}`);
    }
  }
}

async function loadOodle() {
  if (oodle) return oodle;
  assertPortableRuntime();
  oodleModule = await import(pathToFileURL(OODLE_ENTRY).href);
  oodle = await oodleModule.Oodle.Create(OODLE_DLL);
  return oodle;
}

function gameIsRunning() {
  try {
    const output = execFileSync("tasklist", ["/FI", `IMAGENAME eq ${GAME_PROCESS_NAME}*`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return output.includes(GAME_PROCESS_NAME);
  } catch {
    return false;
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function assertSlotName(slot) {
  if (!/^savegame_\d+$/.test(slot)) {
    throw new Error(`Invalid save slot: ${slot}`);
  }
}

function slotDir(slot) {
  assertSlotName(slot);
  return path.join(SAVE_ROOT, slot);
}

function playerPath(slot) {
  return path.join(slotDir(slot), "Player.sav");
}

function copyDir(src, dst) {
  fs.cpSync(src, dst, { recursive: true, force: true, errorOnExist: false });
}

function makeBackup(slot, reason) {
  const src = slotDir(slot);
  if (!fs.existsSync(src)) {
    throw new Error(`Slot not found: ${src}`);
  }
  ensureDir(BACKUP_ROOT);
  const dst = path.join(BACKUP_ROOT, `${slot}_${reason}_${stamp()}`);
  copyDir(src, dst);
  return dst;
}

function listSlots() {
  if (!fs.existsSync(SAVE_ROOT)) return [];
  return fs
    .readdirSync(SAVE_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^savegame_\d+$/.test(entry.name))
    .filter((entry) => fs.existsSync(path.join(SAVE_ROOT, entry.name, "Player.sav")))
    .map((entry) => {
      const player = path.join(SAVE_ROOT, entry.name, "Player.sav");
      const stat = fs.statSync(player);
      return { slot: entry.name, player, size: stat.size, mtime: stat.mtime };
    })
    .sort((a, b) => a.slot.localeCompare(b.slot, undefined, { numeric: true }));
}

function listBackups() {
  if (!fs.existsSync(BACKUP_ROOT)) return [];
  return fs
    .readdirSync(BACKUP_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^savegame_\d+/.test(entry.name))
    .filter((entry) => fs.existsSync(path.join(BACKUP_ROOT, entry.name, "Player.sav")))
    .map((entry) => {
      const full = path.join(BACKUP_ROOT, entry.name);
      const stat = fs.statSync(full);
      const slot = entry.name.match(/^(savegame_\d+)/)?.[1] || "";
      return { name: entry.name, full, slot, mtime: stat.mtime };
    })
    .sort((a, b) => b.mtime - a.mtime);
}

async function decodeSav(file) {
  const o = await loadOodle();
  const data = fs.readFileSync(file);
  const parts = [];
  let offset = 0;

  while (offset < data.length) {
    if (offset + CHUNK_HEADER_SIZE > data.length) {
      throw new Error(`Trailing bytes at ${offset}: ${data.length - offset}`);
    }
    const tag = data.readUInt32LE(offset);
    const marker = data.readUInt32LE(offset + 4);
    if (tag !== MAGIC || marker !== HEADER_MARKER) {
      throw new Error(`Unexpected chunk header at ${offset}: tag=0x${tag.toString(16)}, marker=0x${marker.toString(16)}`);
    }
    const algorithm = data[offset + 16];
    const compressedSize = Number(data.readBigUInt64LE(offset + 17));
    const uncompressedSize = Number(data.readBigUInt64LE(offset + 25));
    const compressedRepeat = Number(data.readBigUInt64LE(offset + 33));
    const uncompressedRepeat = Number(data.readBigUInt64LE(offset + 41));
    if (algorithm !== 2) throw new Error(`Unexpected compression algorithm at ${offset}: ${algorithm}`);
    if (compressedSize !== compressedRepeat || uncompressedSize !== uncompressedRepeat) {
      throw new Error(`Chunk sizes do not match at ${offset}`);
    }

    const start = offset + CHUNK_HEADER_SIZE;
    const end = start + compressedSize;
    if (end > data.length) throw new Error(`Chunk at ${offset} extends past the end of the file`);
    const decoded = Buffer.from(o.decompress({ buffer: data.subarray(start, end) }, uncompressedSize));
    if (decoded.length !== uncompressedSize) {
      throw new Error(`Decoded ${decoded.length} bytes, expected ${uncompressedSize}`);
    }
    parts.push(decoded);
    offset = end;
  }

  return Buffer.concat(parts);
}

function makeHeader(payloadLength, rawLength) {
  const header = Buffer.alloc(CHUNK_HEADER_SIZE);
  header.writeUInt32LE(MAGIC, 0);
  header.writeUInt32LE(HEADER_MARKER, 4);
  header.writeBigUInt64LE(BigInt(UNREAL_CHUNK_SIZE), 8);
  header[16] = 2;
  header.writeBigUInt64LE(BigInt(payloadLength), 17);
  header.writeBigUInt64LE(BigInt(rawLength), 25);
  header.writeBigUInt64LE(BigInt(payloadLength), 33);
  header.writeBigUInt64LE(BigInt(rawLength), 41);
  return header;
}

async function encodeSav(decoded) {
  const o = await loadOodle();
  const { OodleCompressor, OodleCompressionLevel } = oodleModule;
  const parts = [];

  for (let offset = 0; offset < decoded.length; offset += UNREAL_CHUNK_SIZE) {
    const raw = decoded.subarray(offset, Math.min(offset + UNREAL_CHUNK_SIZE, decoded.length));
    const payload = Buffer.from(o.compress({ buffer: raw }, OodleCompressor.Kraken, OodleCompressionLevel.Optimal));
    const check = Buffer.from(o.decompress({ buffer: payload }, raw.length));
    if (!check.equals(raw)) {
      throw new Error(`Oodle round-trip failed at decoded offset ${offset}`);
    }
    parts.push(makeHeader(payload.length, raw.length), payload);
  }

  return Buffer.concat(parts);
}

function readFString(buf, pos) {
  if (pos < 0 || pos + 4 > buf.length) throw new Error(`Invalid FString offset: ${pos}`);
  const len = buf.readInt32LE(pos);
  if (len === 0 || Math.abs(len) > 2000) throw new Error(`Invalid FString length ${len} at ${pos}`);
  const bytes = len > 0 ? len : -len * 2;
  if (pos + 4 + bytes > buf.length) throw new Error(`FString at ${pos} extends past EOF`);
  const raw = buf.subarray(pos + 4, pos + 4 + bytes);
  const value = len > 0
    ? raw.subarray(0, Math.max(0, len - 1)).toString("utf8")
    : raw.subarray(0, Math.max(0, bytes - 2)).toString("utf16le");
  return { len, value, start: pos + 4, end: pos + 4 + bytes };
}

function findNameStart(buf, name, from = 0) {
  const idx = buf.indexOf(Buffer.from(`${name}\0`, "utf8"), from);
  return idx >= 0 ? idx - 4 : -1;
}

function readDoubleProperty(buf, propertyName) {
  const pos = findNameStart(buf, propertyName);
  if (pos < 0) return null;
  const name = readFString(buf, pos);
  const type = readFString(buf, name.end);
  if (type.value !== "DoubleProperty") {
    throw new Error(`${propertyName} is ${type.value}, expected DoubleProperty`);
  }
  const valueOffset = type.end + 9;
  if (valueOffset + 8 > buf.length) throw new Error(`${propertyName} value extends past EOF`);
  return { name: propertyName, value: buf.readDoubleLE(valueOffset), offset: valueOffset };
}

function parseMorphEntries(buf) {
  const first = findNameStart(buf, "SS Belly Shape Fat 1");
  if (first < 0) return [];
  const countOffset = first - 4;
  if (countOffset < 0) throw new Error("Invalid OldFatMorpth map count offset");
  const count = buf.readInt32LE(countOffset);
  if (count < 0 || count > 200) throw new Error(`Unexpected OldFatMorpth map count: ${count}`);

  let cursor = first;
  const entries = [];
  for (let i = 0; i < count; i += 1) {
    const key = readFString(buf, cursor);
    cursor = key.end;
    if (cursor + 8 > buf.length) throw new Error(`Morph value for ${key.value} extends past EOF`);
    entries.push({ key: key.value, value: buf.readDoubleLE(cursor), offset: cursor });
    cursor += 8;
  }
  return entries;
}

function readBodyState(decoded) {
  const direct = DIRECT_VALUES.map((entry) => {
    const found = readDoubleProperty(decoded, entry.property);
    return found ? { ...entry, ...found } : { ...entry, value: null, offset: null };
  });
  const morphEntries = parseMorphEntries(decoded);
  const morphs = MORPH_VALUES.map((entry) => {
    const found = morphEntries.find((item) => item.key === entry.morph);
    return found ? { ...entry, value: found.value, offset: found.offset } : { ...entry, value: null, offset: null };
  });
  const unknownMorphs = morphEntries.filter((entry) => !MORPH_BY_NAME.has(entry.key));
  return { direct, morphs, unknownMorphs };
}

async function analyzeSlot(slot, verbose = true) {
  const file = playerPath(slot);
  if (!fs.existsSync(file)) {
    throw new Error(`Player.sav is missing: ${file}`);
  }

  const decoded = await decodeSav(file);
  const state = readBodyState(decoded);
  const playerStat = fs.statSync(file);

  if (verbose) {
    console.log("");
    console.log(`Analysis: ${slot}`);
    console.log(`  Player.sav: ${formatBytes(playerStat.size)} raw, ${formatBytes(decoded.length)} decoded`);
    console.log("");
    printState(state);
  }

  return { decoded, state, playerStat };
}

function printState(state) {
  console.log("Direct body values:");
  for (const item of state.direct) {
    const suffix = item.property === "BodyWeight" && typeof item.value === "number"
      ? `  (~${estimateWeightKg(item.value).toFixed(1)} kg from observed scale)`
      : "";
    console.log(`  --${item.key.padEnd(14)} ${item.property.padEnd(12)} = ${formatValue(item.value)}${suffix}`);
  }

  console.log("");
  console.log("Morph values:");
  for (const item of state.morphs) {
    console.log(`  --${item.key.padEnd(18)} ${item.morph.padEnd(24)} = ${formatValue(item.value)}`);
  }

  if (state.unknownMorphs.length > 0) {
    console.log("");
    console.log("Additional OldFatMorpth entries:");
    for (const item of state.unknownMorphs) {
      console.log(`  ${item.key} = ${item.value}`);
    }
  }
}

function printRecommendations() {
  console.log("");
  console.log("Observed value notes");
  console.log("");
  console.log("BodyWeight:");
  console.log("  0.0 was observed as about 46 kg in-game.");
  console.log("  1.0 was observed as about 59 kg in-game.");
  console.log("  Approximate test formula: kg = 46 + BodyWeight * 13.");
  console.log("  Rough examples: 0.25 ~= 49.25 kg, 0.50 ~= 52.5 kg, 0.75 ~= 55.75 kg.");
  console.log("  The game was observed to clamp BodyWeight back to 0..1 when saving.");
  console.log("");
  console.log("ChestSize:");
  console.log("  The game was observed to clamp ChestSize back to 0..1 when saving.");
  console.log("");
  console.log("Morph values:");
  console.log("  0.0 to 1.0 is the normal-looking test range.");
  console.log("  1.0 to 2.0 is a strong/extreme test range.");
  console.log("  2.0 survived an in-game save in testing.");
  console.log("  5.0 also survived, but looked absurd and is best treated as stress testing.");
  console.log("");
  console.log("BodyMorpher does not clamp your input. Any finite number is accepted.");
  console.log("You are responsible for choosing values and checking the result in-game.");
}

async function printSlotList(analyze = false) {
  const slots = listSlots();
  if (slots.length === 0) {
    console.log(`No savegame_* slots found under: ${SAVE_ROOT}`);
    return;
  }
  console.log("");
  console.log(`Save-Root: ${SAVE_ROOT}`);
  for (const item of slots) {
    console.log(`- ${item.slot}: ${formatBytes(item.size)}, ${item.mtime.toLocaleString()}`);
    if (analyze) {
      await analyzeSlot(item.slot, true);
    }
  }
}

function parseFiniteValue(raw, label) {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    throw new Error(`${label} needs a numeric value`);
  }
  const value = Number(String(raw).replace(",", "."));
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number, got: ${raw}`);
  }
  return value;
}

function parseSetOptions(args, startIndex) {
  const changes = { direct: new Map(), morphs: new Map() };
  for (let i = startIndex; i < args.length; i += 1) {
    let arg = args[i];
    if (arg === "--yes") continue;
    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    let valueRaw = null;
    if (arg.includes("=")) {
      const split = arg.indexOf("=");
      valueRaw = arg.slice(split + 1);
      arg = arg.slice(0, split);
    } else {
      valueRaw = args[i + 1];
      i += 1;
    }

    const key = arg.slice(2);
    const value = parseFiniteValue(valueRaw, arg);
    if (key === "all") {
      for (const entry of DIRECT_VALUES) changes.direct.set(entry.property, value);
      for (const entry of MORPH_VALUES) changes.morphs.set(entry.morph, value);
    } else if (key === "all-morphs" || key === "morphs") {
      for (const entry of MORPH_VALUES) changes.morphs.set(entry.morph, value);
    } else if (DIRECT_BY_KEY.has(key)) {
      changes.direct.set(DIRECT_BY_KEY.get(key).property, value);
    } else if (MORPH_BY_KEY.has(key)) {
      changes.morphs.set(MORPH_BY_KEY.get(key).morph, value);
    } else {
      throw new Error(`Unknown value option: --${key}`);
    }
  }
  return changes;
}

function plannedChangesFromAll(value, includeDirect) {
  const changes = { direct: new Map(), morphs: new Map() };
  if (includeDirect) {
    for (const entry of DIRECT_VALUES) changes.direct.set(entry.property, value);
  }
  for (const entry of MORPH_VALUES) changes.morphs.set(entry.morph, value);
  return changes;
}

function hasChanges(changes) {
  return changes.direct.size > 0 || changes.morphs.size > 0;
}

function describePlannedChanges(state, changes) {
  const lines = [];
  for (const entry of DIRECT_VALUES) {
    if (!changes.direct.has(entry.property)) continue;
    const current = state.direct.find((item) => item.property === entry.property);
    lines.push({ kind: "direct", name: entry.property, key: entry.key, before: current?.value, after: changes.direct.get(entry.property) });
  }
  for (const entry of MORPH_VALUES) {
    if (!changes.morphs.has(entry.morph)) continue;
    const current = state.morphs.find((item) => item.morph === entry.morph);
    lines.push({ kind: "morph", name: entry.morph, key: entry.key, before: current?.value, after: changes.morphs.get(entry.morph) });
  }
  return lines;
}

async function writeValues(slot, changes, assumeYes = false) {
  assertSlotName(slot);
  if (!hasChanges(changes)) {
    console.log("No values selected for editing.");
    return;
  }
  if (gameIsRunning()) {
    throw new Error("The Parasites is still running. Please close the game completely before writing saves.");
  }

  const analysis = await analyzeSlot(slot, true);
  const plan = describePlannedChanges(analysis.state, changes);
  console.log("");
  console.log("Planned changes:");
  for (const item of plan) {
    console.log(`  --${item.key.padEnd(18)} ${item.name.padEnd(24)} ${formatValue(item.before)} -> ${formatValue(item.after)}`);
  }
  if (plan.length === 0) {
    console.log("  No matching editable values found in this save.");
    return;
  }

  if (!assumeYes) {
    const ok = await askYesNo(`Create a backup and write ${plan.length} value(s) to ${slot}?`, false);
    if (!ok) {
      console.log("Cancelled.");
      return;
    }
  }

  const backup = makeBackup(slot, "before_body_morph");
  const patched = Buffer.from(analysis.decoded);

  for (const [propertyName, value] of changes.direct) {
    const prop = readDoubleProperty(patched, propertyName);
    if (!prop) throw new Error(`Direct value not found: ${propertyName}`);
    patched.writeDoubleLE(value, prop.offset);
  }

  const morphEntries = parseMorphEntries(patched);
  for (const [morphName, value] of changes.morphs) {
    const entry = morphEntries.find((item) => item.key === morphName);
    if (!entry) throw new Error(`Morph value not found: ${morphName}`);
    patched.writeDoubleLE(value, entry.offset);
  }

  const encoded = await encodeSav(patched);
  fs.writeFileSync(playerPath(slot), encoded);

  const verifyDecoded = await decodeSav(playerPath(slot));
  const verifyState = readBodyState(verifyDecoded);
  for (const [propertyName, value] of changes.direct) {
    const current = verifyState.direct.find((item) => item.property === propertyName);
    if (!current || Math.abs(current.value - value) > 1e-12) {
      throw new Error(`Verification failed for ${propertyName}: ${current?.value}`);
    }
  }
  for (const [morphName, value] of changes.morphs) {
    const current = verifyState.morphs.find((item) => item.morph === morphName);
    if (!current || Math.abs(current.value - value) > 1e-12) {
      throw new Error(`Verification failed for ${morphName}: ${current?.value}`);
    }
  }

  const newStat = fs.statSync(playerPath(slot));
  console.log("");
  console.log("Done.");
  console.log(`  Backup: ${backup}`);
  console.log(`  Written: ${playerPath(slot)}`);
  console.log(`  New Player.sav size: ${formatBytes(newStat.size)}`);
}

async function restoreBackup(backupNameOrPath = null, assumeYes = false) {
  if (gameIsRunning()) {
    throw new Error("The Parasites is still running. Please close the game completely before restoring a backup.");
  }

  let backup = null;
  if (backupNameOrPath) {
    backup = path.isAbsolute(backupNameOrPath) ? backupNameOrPath : path.join(BACKUP_ROOT, backupNameOrPath);
    if (!fs.existsSync(backup)) throw new Error(`Backup not found: ${backup}`);
  } else {
    const backups = listBackups();
    if (backups.length === 0) {
      console.log("No backups found in the tool folder.");
      return;
    }
    console.log("");
    console.log("Available backups:");
    backups.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name}  (${item.mtime.toLocaleString()})`);
    });
    const answer = await ask("Choose backup number or press Enter to cancel: ");
    if (!answer.trim()) return;
    const index = Number.parseInt(answer.trim(), 10) - 1;
    if (Number.isNaN(index) || index < 0 || index >= backups.length) {
      console.log("Invalid selection.");
      return;
    }
    backup = backups[index].full;
  }

  const base = path.basename(backup);
  const slot = base.match(/^(savegame_\d+)/)?.[1];
  if (!slot) throw new Error(`Cannot determine target slot from backup name: ${base}`);
  const dst = slotDir(slot);
  const player = path.join(backup, "Player.sav");
  if (!fs.existsSync(player)) throw new Error(`Backup does not contain Player.sav: ${backup}`);

  if (!assumeYes) {
    const ok = await askYesNo(`Restore backup "${base}" to ${slot}? The current slot will be backed up first.`, false);
    if (!ok) {
      console.log("Cancelled.");
      return;
    }
  }

  if (fs.existsSync(dst)) {
    const currentBackup = makeBackup(slot, "before_restore");
    console.log(`Current slot backed up first: ${currentBackup}`);
    fs.rmSync(dst, { recursive: true, force: true });
  }
  copyDir(backup, dst);
  console.log(`Backup restored: ${backup}`);
  console.log(`Target: ${dst}`);
}

async function ask(question) {
  if (!rl) rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return rl.question(question);
}

async function askYesNo(question, defaultYes = false) {
  const suffix = defaultYes ? " [Y/n] " : " [y/N] ";
  const answer = (await ask(question + suffix)).trim().toLowerCase();
  if (!answer) return defaultYes;
  return answer === "j" || answer === "ja" || answer === "y" || answer === "yes";
}

async function chooseSlot() {
  const slots = listSlots();
  if (slots.length === 0) {
    console.log(`No savegame_* slots found under: ${SAVE_ROOT}`);
    return null;
  }
  console.log("");
  console.log("Savegames:");
  slots.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.slot}  ${formatBytes(item.size)}  ${item.mtime.toLocaleString()}`);
  });
  const answer = await ask("Choose savegame number or press Enter to cancel: ");
  if (!answer.trim()) return null;
  const index = Number.parseInt(answer.trim(), 10) - 1;
  if (Number.isNaN(index) || index < 0 || index >= slots.length) {
    console.log("Invalid selection.");
    return null;
  }
  return slots[index].slot;
}

async function menu() {
  console.log("BodyMorpher - The Parasites Save Body Editor");
  console.log(`Tool: ${TOOL_DIR}`);
  console.log(`Save-Root: ${SAVE_ROOT}`);
  console.log("");
  printRecommendations();

  if (gameIsRunning()) {
    console.log("");
    console.log("WARNING: The Parasites appears to be running. Write/restore actions are blocked until the game is closed.");
  }

  for (;;) {
    console.log("");
    console.log("Menu");
    console.log("  1. List savegames");
    console.log("  2. Analyze savegame");
    console.log("  3. Set all known values");
    console.log("  4. Set morph values only");
    console.log("  5. Set individual values");
    console.log("  6. Restore backup");
    console.log("  7. Show recommendations");
    console.log("  8. Exit");
    const choice = (await ask("Selection: ")).trim();

    if (choice === "1") {
      await printSlotList(false);
    } else if (choice === "2") {
      const slot = await chooseSlot();
      if (slot) await analyzeSlot(slot, true);
    } else if (choice === "3") {
      const slot = await chooseSlot();
      if (!slot) continue;
      const value = parseFiniteValue(await ask("Value for all known values: "), "all");
      await writeValues(slot, plannedChangesFromAll(value, true), false);
    } else if (choice === "4") {
      const slot = await chooseSlot();
      if (!slot) continue;
      const value = parseFiniteValue(await ask("Value for all morph values: "), "morphs");
      await writeValues(slot, plannedChangesFromAll(value, false), false);
    } else if (choice === "5") {
      const slot = await chooseSlot();
      if (!slot) continue;
      console.log("");
      console.log("Enter blank to leave a value unchanged.");
      const changes = { direct: new Map(), morphs: new Map() };
      for (const item of DIRECT_VALUES) {
        const answer = await ask(`--${item.key} (${item.property}): `);
        if (answer.trim()) changes.direct.set(item.property, parseFiniteValue(answer, item.key));
      }
      for (const item of MORPH_VALUES) {
        const answer = await ask(`--${item.key} (${item.morph}): `);
        if (answer.trim()) changes.morphs.set(item.morph, parseFiniteValue(answer, item.key));
      }
      await writeValues(slot, changes, false);
    } else if (choice === "6") {
      await restoreBackup();
    } else if (choice === "7") {
      printRecommendations();
    } else if (choice === "8" || choice === "") {
      break;
    } else {
      console.log("Invalid selection.");
    }
  }
}

function printHelp() {
  console.log("Usage:");
  console.log("  Start_BodyMorpher.cmd");
  console.log("  Start_BodyMorpher.cmd --list");
  console.log("  Start_BodyMorpher.cmd --analyze savegame_5");
  console.log("  Start_BodyMorpher.cmd --recommendations");
  console.log("  Start_BodyMorpher.cmd --set-all savegame_5 1.0 --yes");
  console.log("  Start_BodyMorpher.cmd --set-morphs savegame_5 2.0 --yes");
  console.log("  Start_BodyMorpher.cmd --set savegame_5 --body-weight 0.5 --breast-size 1.2 --hip-size 0.8 --yes");
  console.log("  Start_BodyMorpher.cmd --restore <backup-folder-name> --yes");
  console.log("");
  console.log("Editable values:");
  for (const entry of DIRECT_VALUES) {
    console.log(`  --${entry.key.padEnd(18)} ${entry.property}`);
  }
  for (const entry of MORPH_VALUES) {
    console.log(`  --${entry.key.padEnd(18)} ${entry.morph}`);
  }
  console.log("");
  console.log("Bulk options for --set:");
  console.log("  --all <value>        Sets BodyWeight, ChestSize, and all known morphs.");
  console.log("  --all-morphs <value> Sets only known morph values.");
  console.log("");
  console.log("Optional: set TP_SAVE_ROOT if your saves are not in the default path.");
}

async function main() {
  ensureDir(BACKUP_ROOT);
  const args = process.argv.slice(2);
  const yes = args.includes("--yes");

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  if (args.includes("--recommendations")) {
    printRecommendations();
    return;
  }

  const listIndex = args.indexOf("--list");
  if (listIndex !== -1) {
    await printSlotList(false);
    return;
  }

  const analyzeIndex = args.indexOf("--analyze");
  if (analyzeIndex !== -1) {
    const slot = args[analyzeIndex + 1];
    if (!slot) throw new Error("--analyze needs a slot, e.g. savegame_5");
    await analyzeSlot(slot, true);
    return;
  }

  const setAllIndex = args.indexOf("--set-all");
  if (setAllIndex !== -1) {
    const slot = args[setAllIndex + 1];
    const value = parseFiniteValue(args[setAllIndex + 2], "--set-all");
    if (!slot) throw new Error("--set-all needs a slot, e.g. savegame_5");
    await writeValues(slot, plannedChangesFromAll(value, true), yes);
    return;
  }

  const setMorphsIndex = args.indexOf("--set-morphs");
  if (setMorphsIndex !== -1) {
    const slot = args[setMorphsIndex + 1];
    const value = parseFiniteValue(args[setMorphsIndex + 2], "--set-morphs");
    if (!slot) throw new Error("--set-morphs needs a slot, e.g. savegame_5");
    await writeValues(slot, plannedChangesFromAll(value, false), yes);
    return;
  }

  const setIndex = args.indexOf("--set");
  if (setIndex !== -1) {
    const slot = args[setIndex + 1];
    if (!slot) throw new Error("--set needs a slot, e.g. savegame_5");
    const changes = parseSetOptions(args, setIndex + 2);
    await writeValues(slot, changes, yes);
    return;
  }

  const restoreIndex = args.indexOf("--restore");
  if (restoreIndex !== -1) {
    const backup = args[restoreIndex + 1];
    if (!backup) throw new Error("--restore needs a backup folder name");
    await restoreBackup(backup, yes);
    return;
  }

  await menu();
}

main()
  .catch((err) => {
    console.error("");
    console.error("ERROR:");
    console.error(err && err.stack ? err.stack : String(err));
    process.exitCode = 1;
  })
  .finally(() => {
    if (rl) rl.close();
  });
