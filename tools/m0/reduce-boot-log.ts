import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { mkdir } from "node:fs/promises";

const CONFIG_ID = "m0-reference-v1";

type ReducedTrace = {
  schemaVersion: 1;
  configId: typeof CONFIG_ID;
  events: string[];
};

export function reduceBootLog(log: string): ReducedTrace {
  const events: string[] = [];
  let sawPreReset640 = false;
  let sawModeReset = false;

  for (const line of log.split(/\r?\n/u)) {
    if (line.includes("DOSBox-X version 2026.07.02 Commit 6fb8c07 (MinGW SDL2 64-bit)")) {
      pushOnce(events, "emulator:dosbox-x-2026.07.02-6fb8c07-mingw-sdl2-x64");
    } else if (/EXEC:Execute Z:\\SYSTEM\\mount\.COM 0$/u.test(line)) {
      pushOnce(events, "mount:authoritative-zip-read-only");
    } else if (/EXEC:Execute tomb\.exe 0$/iu.test(line)) {
      pushOnce(events, "exec:tomb");
    } else if (/EXEC:Execute C:\\TOMBRAID\\dos4gw\.exe 3$/iu.test(line)) {
      pushOnce(events, "exec:dos4gw");
    } else if (line.includes("Aspect ratio: 4 x 3")) {
      pushOnce(events, "display-aspect:4:3");
    } else if (line.includes("surface consider=720x540 final=720x540")) {
      pushOnce(events, "surface:720x540-mode-transition");
    } else if (line.includes("ERROR MOUSE:Unhandled videomode 69 on reset")) {
      sawModeReset = true;
      pushOnce(events, "guest-video-mode:0x69-reset");
    } else if (line.includes("surface consider=640x480 final=640x480")) {
      if (!sawPreReset640 && !sawModeReset) {
        sawPreReset640 = true;
        events.push("surface:640x480-pre-reset");
      } else if (sawModeReset) {
        pushOnce(events, "surface:640x480-post-reset");
      }
    }
  }

  const expected = [
    "emulator:dosbox-x-2026.07.02-6fb8c07-mingw-sdl2-x64",
    "mount:authoritative-zip-read-only",
    "display-aspect:4:3",
    "surface:720x540-mode-transition",
    "exec:tomb",
    "exec:dos4gw",
    "surface:640x480-pre-reset",
    "guest-video-mode:0x69-reset",
    "surface:640x480-post-reset"
  ];

  if (JSON.stringify(events) !== JSON.stringify(expected)) {
    throw new Error(`Boot log did not contain the frozen event sequence. Reduced: ${JSON.stringify(events)}`);
  }

  return { schemaVersion: 1, configId: CONFIG_ID, events };
}

function pushOnce(events: string[], event: string): void {
  if (!events.includes(event)) events.push(event);
}

async function main(): Promise<void> {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    throw new Error("Usage: reduce-boot-log <raw-log> <reduced-trace>");
  }

  const log = await readFile(inputPath, "utf8");
  const reduced = reduceBootLog(log);
  const canonical = `${JSON.stringify(reduced, null, 2)}\n`;
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, canonical, "utf8");
  process.stdout.write(`${createHash("sha256").update(canonical).digest("hex")}\n`);
}

if (process.argv[1]?.endsWith("reduce-boot-log.js")) {
  await main();
}
