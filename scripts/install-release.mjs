import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { install } from "./install.mjs";

const [version, vault, config] = process.argv.slice(2);
if (!/^\d+\.\d+\.\d+$/.test(version ?? "") || !vault) {
  throw new Error(
    "Usage: pnpm install:release <x.y.z> <vault-path> [config-directory]",
  );
}
const stage = await mkdtemp(join(tmpdir(), "taskwarrior-notes-release-"));
try {
  execFileSync(
    "gh",
    [
      "release",
      "download",
      version,
      "--repo",
      "mbastakis/obsidian-taskwarrior",
      "--pattern",
      "main.js",
      "--pattern",
      "manifest.json",
      "--dir",
      stage,
    ],
    { stdio: "inherit" },
  );
  const manifest = JSON.parse(
    await readFile(join(stage, "manifest.json"), "utf8"),
  );
  if (manifest.version !== version)
    throw new Error("Release version mismatch.");
  await install(stage, vault, config);
  console.log(
    "Enable or reload Taskwarrior Notes in the target vault to activate this release.",
  );
} finally {
  await rm(stage, { recursive: true, force: true });
}
