import { build } from "esbuild";

export const options = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: ["obsidian", "electron"],
  format: "cjs",
  platform: "node",
  target: "es2022",
  outfile: "main.js",
  logLevel: "info",
};

if (process.argv[1]?.endsWith("esbuild.config.mjs")) {
  await build(options);
}
