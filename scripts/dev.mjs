import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { context } from "esbuild";
import { options } from "../esbuild.config.mjs";
import { install } from "./install.mjs";

const vault = resolve(".local/Taskwarrior Development");
await mkdir(`${vault}/.obsidian`, { recursive: true });
await writeFile(
  `${vault}/Welcome.md`,
  "# Taskwarrior development\n\nRun **Taskwarrior Notes: Hello world** from the command palette.\n",
);
const ctx = await context({
  ...options,
  sourcemap: "inline",
  plugins: [
    {
      name: "deploy-development-build",
      setup(build) {
        build.onEnd(async (result) => {
          if (result.errors.length) return;
          await install(process.cwd(), vault);
          try {
            const vaults = execFileSync("obsidian", ["vaults", "verbose"], {
              encoding: "utf8",
              timeout: 10000,
            });
            if (
              !vaults
                .split("\n")
                .some(
                  (line) => line.trim() === `Taskwarrior Development\t${vault}`,
                )
            ) {
              throw new Error("Development vault is not registered yet.");
            }
            execFileSync(
              "obsidian",
              [
                "vault=Taskwarrior Development",
                "plugin:reload",
                "id=taskwarrior-notes",
              ],
              { stdio: "inherit", timeout: 10000 },
            );
          } catch {
            console.log(
              `Open ${vault} as a vault and enable Taskwarrior Notes. Reload will retry after the next build.`,
            );
          }
        });
      },
    },
  ],
});
await ctx.watch();
console.log(`Watching source. Development vault: ${vault}`);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await ctx.dispose();
    process.exit(0);
  });
}
