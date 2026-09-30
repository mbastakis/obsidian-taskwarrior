# Implementation and delivery plan

Status: planning; agreed direction with unresolved details explicitly listed below.

## Goal

Replace a custom hosted task frontend with native Obsidian Bases on desktop, reducing UI and deployment maintenance while preserving Taskwarrior semantics and TaskChampion synchronization. Existing iOS task management remains in Taskchamp; mobile offline Kanban is not an initial requirement.

## Agreed direction

- Public standalone repository with a desktop-only Obsidian plugin.
- Native Bases Kanban; no custom board renderer.
- Dedicated task collection in the existing knowledge vault.
- Stable Taskwarrior UUID mapping rather than task titles or temporary numeric IDs.
- Bidirectional integration: supported Obsidian edits produce Taskwarrior operations, and external task changes refresh notes.
- Local Taskwarrior replica supplies existing sync configuration and credentials.
- Plugin source belongs in this repository; installed artifacts belong in the vault's plugin directory. Workstation prerequisites remain workstation configuration.
- Development uses an isolated vault and Taskwarrior replica with production sync disabled.
- Real-vault deployment installs an explicit GitHub release rather than a working-tree build.

## Proposed integration boundary

Native Kanban changes an editable note property. A desktop plugin observes indexed metadata changes, compares them with the last reconciled state, applies a supported Taskwarrior operation, reads the persisted result, and updates the note. TaskChampion synchronization connects this local replica to other clients.

Observe property changes rather than undocumented drag events. Note edits, file synchronization, initial indexing, and plugin-originated writes must be distinguished through reconciliation state; metadata events alone do not identify user intent.

Use asynchronous process invocation with argument arrays and an explicitly configured executable/environment. Preserve unrelated task fields and user prose. Serialize operations per task. Do not treat a note write and a Taskwarrior operation as one atomic transaction.

## Proposed vault organization

One dedicated `Tasks/` collection containing a Bases definition, task notes, and scoped rules. The location is configurable. UUID filenames and a human-readable title property are proposed, pending verification of native card presentation.

The existing vault separates knowledge from task execution. Adopting this collection requires an explicit scoped exception, not wholesale conversion of knowledge notes into tasks. Review existing vault automation before introduction.

## Lifecycle starting point — requires confirmation

Preserve the existing native projection: completed tasks are Done; unfinished tasks with a future wait are Waiting; other started tasks are Doing; remaining unfinished tasks are To do. Dependencies and future scheduling remain distinct from deferral.

Proposed moves: start, stop, complete, reopen, or defer with a return-date prompt. Define exact preconditions, field preservation, cancellation, and failure behavior before implementation. Do not silently clear prerequisites or scheduled dates.

## Delivery lifecycle

1. Changes and pull requests: formatting/lint, type checking, reconciliation tests, isolated Taskwarrior integration tests, production build, and metadata validation.
2. Development vault: watch builds and reload the plugin; verify actual Bases interactions and restart behavior against synthetic tasks.
3. Merge to main: accepted source, not automatic real-vault deployment.
4. Release: exact `x.y.z` tag matching the manifest, compatibility metadata in `versions.json`, tag-triggered checks/build, and a draft GitHub release.
5. Publish standard assets: `main.js`, `manifest.json`, and optional `styles.css`.
6. Explicit local installation: download and validate an exact release, retain previous binaries, preserve settings/state/notes, reload, and report startup status.
7. Community distribution later, after operational experience. Public source publication does not imply community-directory acceptance.

Proposed command interface (not implemented):

```sh
mise exec task -- task plugin:install VERSION=0.1.0 VAULT=/path/to/vault
```

CI needs no production vault access or TaskChampion credentials. Code rollback cannot undo task edits or necessarily reverse state migrations. Machine-local reconciliation state must not accidentally become shared multi-writer state through vault synchronization.

## Milestones

### 1. Resolve the contract

Settle writer ownership, task-note schema, lifecycle operations, conflict/failure behavior, task population and retention, supported versions, and state persistence. Update the glossary as language is resolved. Record ADRs only for consequential trade-offs.

### 2. Prove one end-to-end interaction

Move a native test card, update one isolated Taskwarrior task, read it back, and reconcile the note without a feedback loop. Verify plugin disable/re-enable and application restart.

### 3. Establish delivery

Implement checks, development deployment, tagged releases, and exact-version installation. Exercise installation into the real vault with task writes disabled before enabling a bounded pilot.

### 4. Pilot bidirectional task management

Exercise capture, lifecycle, external updates, dates, concurrent edits, CLI failures, restart recovery, and preservation of unrelated fields. Expand only once reconciliation is dependable.

### 5. Replace the hosted frontend

Verify feature coverage and a reliable operating workflow. Transfer recurring-instance generation from its existing designated owner before retiring the hosted backend. A desktop plugin that runs only while Obsidian is open does not automatically replace an always-on recurrence owner.

## Open design questions

- Is there one active integration desktop or support for multiple writers?
- What edits are accepted when the plugin is stopped or absent?
- Which task classes are represented: unfinished, completed, deleted, recurring templates?
- Which properties are editable, derived, or informational?
- How do note creation, duplication, rename, and deletion behave?
- What happens when the note and task both change before reconciliation?
- Where are baselines, pending operations, errors, and settings persisted?
- How are failed/partial writes and ambiguous command outcomes recovered?
- What synchronization cadence and Taskwarrior versions are supported?
- How are project documentation links and freeform note bodies preserved?
- What are completion/history retention and recurrence ownership policies?
- Which minimum Obsidian version, plugin ID, and license should be used?

## References

- [Native Bases Kanban](https://obsidian.md/help/bases/views/kanban)
- [MetadataCache changed event](https://docs.obsidian.md/Reference/TypeScript+API/MetadataCache/on('changed'))
- [Atomic frontmatter updates](https://docs.obsidian.md/Reference/TypeScript+API/FileManager/processFrontMatter)
- [Obsidian release automation](https://docs.obsidian.md/Plugins/Releasing/Release+your+plugin+with+GitHub+Actions)
- [Taskchamp Obsidian integration](https://github.com/marriagav/taskchamp#obsidian-integration)
