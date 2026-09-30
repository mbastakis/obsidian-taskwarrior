import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

export async function install(source, vault, config = ".obsidian") {
  if (!vault) throw new Error("Supply an explicit vault path.");
  const root = resolve(vault);
  const configPath = resolve(root, config);
  if (!configPath.startsWith(`${root}/`))
    throw new Error("Invalid config directory.");
  if (!(await stat(configPath)).isDirectory())
    throw new Error("Vault config directory not found.");
  const manifest = JSON.parse(
    await readFile(join(source, "manifest.json"), "utf8"),
  );
  if (manifest.id !== "taskwarrior-notes")
    throw new Error("Unexpected plugin identity.");
  const destination = join(configPath, "plugins", manifest.id);
  // Verify all inputs before replacing anything. Never copy settings or delete the directory.
  await stat(join(source, "main.js"));
  await mkdir(destination, { recursive: true });
  for (const file of ["main.js", "manifest.json"]) {
    await copyFile(join(source, file), join(destination, file));
  }
  console.log(
    `Installed ${manifest.id} ${manifest.version} into ${destination}`,
  );
  return manifest;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await install(process.cwd(), process.argv[2], process.argv[3]);
}
