import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

const ROOT = process.cwd();
const EXPECTED = {
  archive: { path: ".work/original/TR1PCdemo1.zip", bytes: 2_194_574, sha256: "e0bd2434a6b5005eee5e038c25f294d7ac0d497a3880f463f74266b53fa6bd5b" },
  executable: { entry: "tombraid/TOMB.EXE", extracted: ".work/extracted/tombraid/TOMB.EXE", bytes: 442_247, sha256: "e2c33c73c42b14d56986e497ebcb38b7e431cddaec6fb143a647019c5c002b47" },
  level: { entry: "tombraid/DATA/LEVEL2.PHD", extracted: ".work/extracted/tombraid/DATA/LEVEL2.PHD", bytes: 2_873_406, sha256: "efaae10c309b266b6ad0c27369b9a4e227ae9d62b9aff6d5f8e076a535e83199" },
  emulator: { path: ".work/emulator/dosbox-x-2026.07.02/mingw-build/mingw-sdl2/dosbox-x.exe", bytes: 25_551_360, sha256: "5f54ec0a5657419c133f88f7ce3b0c9b431405a9ef450e099af7c0bc1a837dc4" }
} as const;

const LABELS = new Set(["observed", "tested", "inferred", "uncertain", "implementation-specific"]);
const PROPRIETARY_HASHES = new Set<string>([EXPECTED.archive.sha256, EXPECTED.executable.sha256, EXPECTED.level.sha256]);
const FORBIDDEN_EXTENSIONS = new Set([".zip", ".exe", ".phd", ".pcx", ".386"]);

type JsonObject = Record<string, unknown>;

async function main(): Promise<void> {
  const checks: Array<[string, () => Promise<void>]> = [
    ["ignored raw boundary", checkIgnoreBoundary],
    ["archive identity and required entries", checkArchive],
    ["extracted identities and emulator pin", checkLocalIdentities],
    ["schema contracts and compact records", checkRecords],
    ["frozen reference configuration", checkReferenceConfig],
    ["repeatable reduced boot traces", checkBootTraces],
    ["repository data boundary", checkRepositoryBoundary]
  ];

  for (const [name, check] of checks) {
    await check();
    process.stdout.write(`PASS ${name}\n`);
  }
  process.stdout.write("Milestone 0 gate passed.\n");
}

async function checkIgnoreBoundary(): Promise<void> {
  const ignore = await readFile(resolveRoot(".gitignore"), "utf8");
  assert(ignore.split(/\r?\n/u).some((line) => line.trim() === ".work/"), ".gitignore must contain an exact .work/ rule");
}

async function checkArchive(): Promise<void> {
  const archivePath = resolveRoot(EXPECTED.archive.path);
  await assertIdentity(archivePath, EXPECTED.archive.bytes, EXPECTED.archive.sha256);
  const bytes = await readFile(archivePath);
  const entries = readZipCentralDirectory(bytes);
  const executable = entries.get(EXPECTED.executable.entry);
  const level = entries.get(EXPECTED.level.entry);
  assert(executable?.uncompressedBytes === EXPECTED.executable.bytes, "TOMB.EXE entry missing or wrong length");
  assert(level?.uncompressedBytes === EXPECTED.level.bytes, "LEVEL2.PHD entry missing or wrong length");
}

async function checkLocalIdentities(): Promise<void> {
  await assertIdentity(resolveRoot(EXPECTED.executable.extracted), EXPECTED.executable.bytes, EXPECTED.executable.sha256);
  await assertIdentity(resolveRoot(EXPECTED.level.extracted), EXPECTED.level.bytes, EXPECTED.level.sha256);
  await assertIdentity(resolveRoot(EXPECTED.emulator.path), EXPECTED.emulator.bytes, EXPECTED.emulator.sha256);
}

async function checkRecords(): Promise<void> {
  const schemaPaths = ["schemas/source.schema.json", "schemas/evidence.schema.json", "schemas/reference-config.schema.json", "schemas/input-tape.schema.json"];
  for (const path of schemaPaths) {
    const schema = await readJson(path);
    assert(schema["$schema"] === "https://json-schema.org/draft/2020-12/schema", `${path} must use JSON Schema 2020-12`);
    assert(typeof schema["$id"] === "string", `${path} must have an $id`);
    assert(schema["type"] === "object", `${path} must describe an object`);
    assert(Array.isArray(schema["required"]) && schema["required"].length > 0, `${path} must declare required fields`);
  }

  const sourceRegister = await readJson("records/source-register.json");
  assert(sourceRegister["schemaVersion"] === 1, "Source register schemaVersion must be 1");
  const sources = asObjectArray(sourceRegister["sources"], "sources");
  assert(sources.length >= 8, "All consulted M0 sources must be registered");
  const ids = new Set<string>();
  for (const source of sources) {
    const id = requireString(source, "id");
    assert(!ids.has(id), `Duplicate source id: ${id}`);
    ids.add(id);
    assert(source["permitted"] === true, `${id} must be marked permitted`);
    assert(LABELS.has(requireString(source, "status")), `${id} has invalid status`);
    requireString(source, "locator");
    requireString(source, "contribution");
  }

  const tape = await readJson("records/input-tapes/m0-boot.json");
  assert(tape["schemaVersion"] === 1 && tape["configId"] === "m0-reference-v1", "Boot tape identity mismatch");
  assert(tape["stopMarker"] === "m0-boot-complete-v1", "Boot tape stop marker mismatch");
  assert(Array.isArray(tape["events"]) && tape["events"].length === 0, "M0 boot tape must contain no events");
  assert(isObject(tape["initialState"]) && Object.values(tape["initialState"]).every((value) => value === false), "Every initial boot action must be false");

  for (const path of ["evidence/M0-ARCHIVE.json", "evidence/M0-BOOT.json"]) {
    const evidence = await readJson(path);
    assert(evidence["schemaVersion"] === 1 && evidence["milestone"] === 0, `${path} identity mismatch`);
    assert(LABELS.has(requireString(evidence, "status")), `${path} has invalid status`);
    for (const observation of asObjectArray(evidence["observations"], `${path} observations`)) {
      assert(LABELS.has(requireString(observation, "status")), `${path} observation has invalid status`);
      requireString(observation, "finding");
    }
    for (const rawPath of asStringArray(evidence["rawArtifacts"], `${path} rawArtifacts`)) {
      assert(rawPath.startsWith(".work/"), `${path} raw artifact escaped .work: ${rawPath}`);
    }
  }
}

async function checkReferenceConfig(): Promise<void> {
  const config = await readJson("records/reference-config.json");
  assert(config["schemaVersion"] === 1 && config["id"] === "m0-reference-v1", "Reference configuration identity mismatch");
  for (const key of ["authority", "emulator", "instrumentation", "host", "guest", "graphics", "audio", "input", "timing", "deterministicStart", "markers"] as const) {
    assert(isObject(config[key]), `Reference configuration missing ${key}`);
  }
  const authority = config["authority"] as JsonObject;
  assert(isObject(authority["archive"]) && authority["archive"]["sha256"] === EXPECTED.archive.sha256, "Frozen archive hash mismatch");
  assert(isObject(authority["executable"]) && authority["executable"]["sha256"] === EXPECTED.executable.sha256, "Frozen executable hash mismatch");
  assert(isObject(authority["level"]) && authority["level"]["sha256"] === EXPECTED.level.sha256, "Frozen level hash mismatch");
  const emulator = config["emulator"] as JsonObject;
  assert(emulator["version"] === "2026.07.02" && emulator["commit"] === "6fb8c07", "Emulator version/commit mismatch");
  assert(emulator["license"] === "GPL-2.0-or-later" && emulator["executableSha256"] === EXPECTED.emulator.sha256, "Emulator license/hash mismatch");
  const graphics = config["graphics"] as JsonObject;
  assert(graphics["logicalResolution"] === "640x480" && graphics["displayAspect"] === "4:3", "Graphics freeze mismatch");
  const markers = config["markers"] as JsonObject;
  for (const name of ["demoStart", "bootComplete", "demoComplete"]) {
    assert(isObject(markers[name]), `Missing marker ${name}`);
    assert(LABELS.has(requireString(markers[name] as JsonObject, "status")), `Marker ${name} has invalid status`);
    requireString(markers[name] as JsonObject, "definition");
  }
}

async function checkBootTraces(): Promise<void> {
  const firstPath = resolveRoot(".work/traces/m0/boot-run-1.reduced.json");
  const secondPath = resolveRoot(".work/traces/m0/boot-run-2.reduced.json");
  const [first, second] = await Promise.all([readFile(firstPath), readFile(secondPath)]);
  assert(first.equals(second), "Reduced boot traces differ");
  const trace = JSON.parse(first.toString("utf8")) as unknown;
  assert(isObject(trace) && trace["configId"] === "m0-reference-v1", "Reduced trace config mismatch");
  const events = asStringArray(trace["events"], "reduced trace events");
  assert(events.at(-1) === "surface:640x480-post-reset", "Reduced trace does not end at the boot marker");
  const digest = sha256(first);
  const bootEvidence = await readJson("evidence/M0-BOOT.json");
  const findings = asObjectArray(bootEvidence["observations"], "boot observations").map((item) => requireString(item, "finding"));
  assert(findings.some((finding) => finding.includes(digest)), "Boot evidence does not freeze the reduced trace digest");
}

async function checkRepositoryBoundary(): Promise<void> {
  const files = await collectRepositoryFiles(ROOT);
  assert(files.length > 0, "Repository contains no files");
  for (const absolute of files) {
    const rel = relative(ROOT, absolute).split(sep).join("/");
    const extension = rel.slice(rel.lastIndexOf(".")).toLowerCase();
    assert(!FORBIDDEN_EXTENSIONS.has(extension), `Proprietary/game extension outside .work: ${rel}`);
    const info = await stat(absolute);
    assert(info.size <= 512 * 1024, `Oversized repository artifact: ${rel}`);
    const bytes = await readFile(absolute);
    assert(!PROPRIETARY_HASHES.has(sha256(bytes)), `Proprietary artifact hash outside .work: ${rel}`);
    assert(!(bytes[0] === 0x4d && bytes[1] === 0x5a), `Executable signature outside .work: ${rel}`);
    assert(!(bytes[0] === 0x50 && bytes[1] === 0x4b), `ZIP signature outside .work: ${rel}`);
  }
  const forbiddenModules = ["src/acquisition", "src/archive", "src/format", "src/game-data", "src/sim", "src/render", "src/audio", "src/ui", "src/platform", "src/app"];
  for (const modulePath of forbiddenModules) {
    assert(!files.some((file) => relative(ROOT, file).split(sep).join("/").startsWith(`${modulePath}/`)), `M0 must not implement ${modulePath}`);
  }
}

function readZipCentralDirectory(bytes: Buffer): Map<string, { uncompressedBytes: number }> {
  const minimum = Math.max(0, bytes.length - 65_557);
  let eocd = -1;
  for (let offset = bytes.length - 22; offset >= minimum; offset -= 1) {
    if (bytes.readUInt32LE(offset) === 0x06054b50) { eocd = offset; break; }
  }
  assert(eocd >= 0, "ZIP end-of-central-directory record missing");
  const entryCount = bytes.readUInt16LE(eocd + 10);
  const centralBytes = bytes.readUInt32LE(eocd + 12);
  const centralOffset = bytes.readUInt32LE(eocd + 16);
  assert(centralOffset + centralBytes <= eocd, "ZIP central directory is out of bounds");
  const entries = new Map<string, { uncompressedBytes: number }>();
  let cursor = centralOffset;
  for (let index = 0; index < entryCount; index += 1) {
    assert(bytes.readUInt32LE(cursor) === 0x02014b50, `Invalid central directory signature at entry ${index}`);
    const uncompressedBytes = bytes.readUInt32LE(cursor + 24);
    const nameBytes = bytes.readUInt16LE(cursor + 28);
    const extraBytes = bytes.readUInt16LE(cursor + 30);
    const commentBytes = bytes.readUInt16LE(cursor + 32);
    const name = bytes.subarray(cursor + 46, cursor + 46 + nameBytes).toString("utf8").replaceAll("\\", "/");
    assert(!entries.has(name), `Duplicate ZIP entry: ${name}`);
    entries.set(name, { uncompressedBytes });
    cursor += 46 + nameBytes + extraBytes + commentBytes;
  }
  assert(cursor === centralOffset + centralBytes, "ZIP central directory length mismatch");
  return entries;
}

async function collectRepositoryFiles(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".git", ".work", "node_modules"].includes(entry.name)) continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await collectRepositoryFiles(absolute));
    else if (entry.isFile()) result.push(absolute);
  }
  return result;
}

async function assertIdentity(path: string, expectedBytes: number, expectedSha256: string): Promise<void> {
  const info = await stat(path);
  assert(info.size === expectedBytes, `${path} length mismatch: ${info.size}`);
  const digest = sha256(await readFile(path));
  assert(digest === expectedSha256, `${path} SHA-256 mismatch: ${digest}`);
}

function sha256(bytes: Buffer): string { return createHash("sha256").update(bytes).digest("hex"); }
function resolveRoot(path: string): string { return resolve(ROOT, path); }
async function readJson(path: string): Promise<JsonObject> {
  const parsed = JSON.parse(await readFile(resolveRoot(path), "utf8")) as unknown;
  assert(isObject(parsed), `${path} must contain a JSON object`);
  return parsed;
}
function isObject(value: unknown): value is JsonObject { return typeof value === "object" && value !== null && !Array.isArray(value); }
function asObjectArray(value: unknown, label: string): JsonObject[] { assert(Array.isArray(value) && value.every(isObject), `${label} must be an object array`); return value; }
function asStringArray(value: unknown, label: string): string[] { assert(Array.isArray(value) && value.every((item) => typeof item === "string"), `${label} must be a string array`); return value; }
function requireString(object: JsonObject, key: string): string { const value = object[key]; assert(typeof value === "string" && value.length > 0, `${key} must be a non-empty string`); return value; }
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

await main();
