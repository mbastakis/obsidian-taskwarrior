# Taskwarrior Notes

A desktop Obsidian plugin, starting with a minimal hello-world command to prove development, releases, and installation end to end. Taskwarrior integration is planned; version 0.1.0 does not read or change tasks.

## Try a published release

Download `main.js` and `manifest.json` from [GitHub releases](https://github.com/mbastakis/obsidian-taskwarrior/releases) into `<vault>/.obsidian/plugins/taskwarrior-notes/`. Enable **Taskwarrior Notes** in Community plugins, then run **Taskwarrior Notes: Hello world** from the command palette or click its checkmarks ribbon icon.

Alternatively, from this checkout with GitHub CLI installed:

```sh
mise trust
mise install
mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm install:release 0.1.0 /absolute/path/to/vault
obsidian vault="Your vault name" plugin:enable id=taskwarrior-notes
```

After updating an enabled plugin, run `obsidian vault="Your vault name" plugin:reload id=taskwarrior-notes`. Installation copies only release artifacts and preserves plugin settings. A third optional installer argument selects a nonstandard configuration directory.

## Development

Use Node 24 and pnpm as pinned in `mise.toml` and `package.json`. The implementation follows the official TypeScript/esbuild sample without a UI framework.

```sh
mise trust
mise install
mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm dev
```

The watcher creates `.local/Taskwarrior Development/`, builds the plugin, and copies artifacts into that development vault. In Obsidian's vault switcher choose **Open folder as vault** and select this directory. Enable community plugins and **Taskwarrior Notes** there. Enable Obsidian's CLI in Settings → General for automatic reloads.

Every successful rebuild deploys to this dedicated vault and invokes `plugin:reload` through the official CLI. No Hot Reload plugin is needed. Keep the watcher running; stop it with Ctrl-C. Failed builds do not deploy. The watcher does not target your personal vault.

```sh
mise exec -- pnpm check
mise exec -- pnpm build
obsidian vault="Taskwarrior Development" command id=taskwarrior-notes:hello-world
obsidian vault="Taskwarrior Development" dev:errors
```

`pnpm dev` bundles quickly; `pnpm check` separately checks types, release metadata and formatting. CI runs checks and production build on pushes to main and pull requests. Run `pnpm format` to format the repository.

## Release and deployment

1. Update `package.json` and `manifest.json` to the same `x.y.z` version and add its minimum Obsidian version to `versions.json`.
2. Run checks/build, commit, and push main.
3. Push a matching tag, with **no `v` prefix**:

   ```sh
   git tag 0.1.0
   git push origin 0.1.0
   ```

4. GitHub Actions repeats checks and builds, then **automatically publishes** the GitHub release with individual `main.js` and `manifest.json` assets. There is no draft approval step or npm publication.
5. Install that exact release with `pnpm install:release <version> <vault-path>` and reload the plugin.

Version selection/tagging and real-vault promotion are deliberate; publishing after a tag is automatic. Publishing does not silently update your vault. Reinstall an earlier release to roll back binaries; this cannot undo future task mutations or state migrations.

The plugin is not yet listed in the community directory. GitHub releases and local installation work independently of listing. The declared API minimum is 1.12.0; end-to-end testing currently targets desktop Obsidian 1.14.3.

## Design documents

- [Implementation and delivery plan](docs/plan.md)
- [Domain language](CONTEXT.md)
- [Ecosystem research](docs/ecosystem-research.md)

## Setup references

- [Official build-a-plugin tutorial](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Official sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- [Release automation](https://docs.obsidian.md/Plugins/Releasing/Release+your+plugin+with+GitHub+Actions)
- [Obsidian CLI](https://help.obsidian.md/cli)
- [Hot Reload](https://github.com/pjeby/hot-reload): an alternative when the official CLI is unavailable, not an additional requirement here.

License selection remains pending; public source visibility alone does not grant an open-source license.
