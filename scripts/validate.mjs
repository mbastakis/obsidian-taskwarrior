import { readFile } from "node:fs/promises";
const read = async (file) => JSON.parse(await readFile(file, "utf8"));
const manifest = await read("manifest.json");
const pkg = await read("package.json");
const versions = await read("versions.json");
if (!/^\d+\.\d+\.\d+$/.test(manifest.version))
  throw new Error("Version must be x.y.z.");
if (pkg.version !== manifest.version)
  throw new Error("Package and manifest versions differ.");
if (versions[manifest.version] !== manifest.minAppVersion)
  throw new Error("Update versions.json.");
if (process.env.RELEASE_TAG && process.env.RELEASE_TAG !== manifest.version)
  throw new Error("Tag must match manifest.version without a v prefix.");
console.log(`Validated release metadata for ${manifest.version}`);
