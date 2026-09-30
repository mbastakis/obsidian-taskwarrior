# Implementation and delivery plan

Status: hello-world development and delivery bootstrap implemented; task integration remains planned.

## Delivery bootstrap — implemented first

The immediate milestone is an installable hello-world plugin with an isolated development vault, TypeScript/esbuild watch builds, official CLI reloads, automated checks, and tag-triggered GitHub publication. It precedes all task access. Actual commands and installation instructions are maintained in the README.

Release policy supersedes the earlier draft-release proposal below: matching version tags automatically publish releases after checks, without a manual draft approval step. Exact-version installation into the real vault remains explicit. The initial installer preserves settings but does not yet back up installed binaries; rollback uses installation of an earlier published version. No Taskfile wrapper is implemented.

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

## Confirmed synchronization policy

### Note-body ownership

User-written Markdown bodies are Obsidian-only supporting context. They do not automatically become Taskwarrior annotations. Projection must preserve them. Annotations remain distinct timestamped Taskwarrior records.

Confirmed annotation encoding: `tw_annotations` is a YAML list of objects retaining native `entry` and `description` fields. Annotation timestamps use quoted ISO 8601 UTC strings under the agreed timestamp rule. Preserve exported annotation text and structure; do not project annotations into the user-owned body. Nested metadata need not be editable through Obsidian's standard Properties UI for the read-only milestone.

```yaml
tw_annotations:
  - entry: "2026-09-30T10:00:00Z"
    description: "Called the supplier."
```

### Recurring-task notes

Represent each recurring template and each generated occurrence as separate UUID-associated notes. Shared instructions belong in the template note body; occurrence-specific context belongs in the occurrence body. Link occurrences to their template instead of copying its body. Taskwarrior generates occurrences; the plugin projects existing records and does not implement recurrence.

### Confirmed local execution and recurrence ownership

The plugin invokes local Taskwarrior, not a remote Taskwarrior API. The existing hosted backend retains recurrence ownership during development. At retirement, transfer generation to the Mac using per-replica recurrence configuration: enable generation on the designated Mac and keep other Taskwarrior replicas non-generating. Verify the actual deployed settings at cutover.

No new scheduler or remote API is planned initially. Recurrence processing happens through appropriate Taskwarrior invocations during normal use; verify the triggering command against the supported version. Generation is not guaranteed while the Mac is off or no suitable command is running. The initial read-only projection explicitly disables recurrence for its exports to avoid generation side effects.

### Task operation policy

- While Obsidian is running and the desktop plugin is enabled, the integration should operate continuously without a manual synchronization step. Unexpected inactivity is an integration failure and must be visible.
- TaskChampion resolves conflicts between task replicas. The plugin accepts and displays the resulting task state instead of implementing a second distributed merge policy.
- Supported note edits made while the plugin was stopped are submitted as new Taskwarrior edits on recovery. This deliberately permits an earlier note edit to become a later task operation when replayed.
- An untouched stale note must never be submitted as a new edit. It is refreshed from Taskwarrior instead.
- Normal writes follow synchronization, minimal native command execution, synchronization, and read-back/projection. Failures and ambiguous outcomes require read-before-retry rather than blind command replay.

### Proposed edit detection and recovery

Persist the last successfully reflected mapped properties for each task UUID. Compare normalized property values, not file modification times or whole-file hashes. Compare only supported editable properties; prose and unrelated metadata are not task edits.

On startup, capture note differences against the saved reflected state before any refresh can overwrite them. Keep pending edits through reconciliation, sync the task replica, submit valid changes, then reflect the actual result. Invalid operations must remain visible rather than silently translating them into other lifecycle actions.

Persist enough operation/projection progress to recover an interruption between command execution, note writing, and baseline persistence. The baseline alone does not solve these crash windows. Match expected plugin-originated property values to suppress feedback; metadata events do not provide reliable write provenance.

Missing baselines, duplicate UUIDs, and multiple active integration desktops require explicit policies. Do not assume an existing note without a baseline is a new user edit. Initial bootstrap ownership is the next design decision.

## Proposed vault organization

Confirmed: use a dedicated `Tasks/` folder at the existing vault root. Keep all task records in this collection regardless of project or status; associate them with project documentation through metadata and links instead of moving them among PARA folders. The collection location remains configurable for other installations. Add scoped ownership rules when installing the collection. Bases definitions are deferred until the note integration is established.

Confirmed filenames: `Tasks/<full-task-uuid>.md`. Store the UUID in metadata as the authoritative association as well. Keep the current Taskwarrior description in a human-readable metadata property; description changes update metadata without renaming the note. This avoids title collisions, filename sanitization, and task-title-driven link changes. Human-readable link/display conventions remain to be defined.

Confirmed metadata namespace: Taskwarrior-managed properties use the `tw_` prefix and retain native field names, for example `tw_uuid`, `tw_description`, `tw_status`, and `tw_project`. Other properties and user-written Markdown remain outside this managed namespace. Structured-field encoding, custom-attribute mapping, and derived-value representation still require decisions.

Confirmed timestamps: serialize native task timestamps as quoted ISO 8601 UTC strings, preserving the exported instant and precision (for example `tw_due: "2026-10-01T18:00:00Z"`). Absent dates remain absent. Date-only truncation and local-time reinterpretation are not part of projection; local formatting belongs in presentation. Timestamp fields nested in annotations follow the same rule. Do not infer that arbitrary custom-attribute strings are dates without their declared type.

Confirmed missing-note behavior: if a retained Taskwarrior record has no note, recreate its UUID-named note on refresh. File deletion never implies Taskwarrior deletion. Recreated metadata cannot restore Obsidian-only prose; that requires vault trash or backups. A Taskwarrior record with deleted status still retains its note.

Confirmed purged-record behavior: projection visits records present in Taskwarrior. If a record is purged or otherwise absent, leave its existing note entirely unchanged, including its last reflected metadata and user prose. Do not delete, trash, or add a missing-status property. Absence must not trigger task recreation or write-back to a nonexistent UUID. The one-to-one rule applies to retained Taskwarrior records; historical notes may outlive purged records. If the UUID returns, normal projection can resume.

Design preference: choose the simplest implementation that preserves the agreed data and ownership contract. Resolve mechanical details through code/API inspection and tests rather than introducing configuration choices for every field. Bring consequential behavioral trade-offs back to the user.

Confirmed refresh behavior: project on plugin startup and periodically while enabled, with a configurable refresh interval in plugin settings (initial default: 30 seconds) and a manual refresh command. Serialize refreshes, write only changed managed metadata, and report failures without applying incomplete exports. The first read-only milestone reads the local replica without initiating network synchronization. Refresh cadence is an adjustable setting, not a fixed domain rule.

Confirmed phase-one ownership: all `tw_` metadata is read-only projection. Accidental edits are restored from Taskwarrior on refresh; user bodies and unrelated properties are preserved. Pending-edit submission applies only once supported write-back is implemented, not during this milestone.

Confirmed write-back boundary: keep native `tw_` fields as protected Taskwarrior projections. Introduce a separate editable workflow property (working name `task_state`) for eventual native Bases interaction. Translate supported changes to that property into explicit task-operation setters, then read back and refresh the projection. Never blindly import edited note snapshots. Public metadata events cannot distinguish a Kanban drag from a manual edit to the same property; either is an operation request for the supported editable property. Invalid values are rejected. Doing is derived from native status/start rather than a new native status. This editable workflow property and its setters are outside the first read-only milestone.

Implementation readiness: the first read-only milestone has enough agreed behavior to build. Defer remaining write-back, conflict, and board UX decisions until that projection is exercised with actual task data. Resolve encoding and API mechanics through inspection and focused tests; return to the design interview only for newly discovered behavioral trade-offs.

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

### Revised first deliverable: complete read-only task projection

Build the permanent projection capability directly in the plugin against the existing local Taskwarrior collection. Bases configuration and board interactions are deferred; visualization is a consumer of notes, not a dependency of projection.

- Represent every retained Taskwarrior record with exactly one UUID-associated note, including unfinished tasks, completed tasks, deleted records, and recurring templates.
- Preserve native status. Deleted status is metadata, not an instruction to delete a note. Recurring templates remain distinguishable from executable occurrences.
- Export without relying on default pending-task filters or active contexts; verify coverage for every record class against the supported CLI version.
- Create missing notes, refresh managed properties, preserve note bodies and unrelated properties, and recognize existing associations after restart without duplication.
- Establish reflected-state tracking for subsequent write-back support.
- This milestone performs no Taskwarrior mutations and does not automatically invoke network sync. It reflects the current local replica; synchronization behavior is added separately.
- Collection location and filenames are settled as `Tasks/<full-task-uuid>.md`. Purged records leave notes unchanged. Exact managed schema and duplicate-UUID behavior remain unresolved.

The phases below describe the wider roadmap; the revised first deliverable takes priority over the earlier board-first vertical slice.

### 1. Resolve the contract

Settle writer ownership, task-note schema, lifecycle operations, conflict/failure behavior, task population and retention, supported versions, and state persistence. Update the glossary as language is resolved. Record ADRs only for consequential trade-offs.

### 2. Prove one end-to-end interaction

Move a native test card, update one isolated Taskwarrior task, read it back, and reconcile the note without a feedback loop. Verify plugin disable/re-enable and application restart.

### 3. Establish delivery

Implement checks, development deployment, tagged releases, and exact-version installation. Exercise installation into the real vault with task writes disabled before enabling a bounded pilot.

### 4. Pilot bidirectional task management

Exercise capture, lifecycle, external updates, dates, concurrent edits, CLI failures, restart recovery, and preservation of unrelated fields. Expand only once reconciliation is dependable.

### 5. Replace the hosted frontend

Verify feature coverage and a reliable operating workflow. Transfer recurring-instance generation from the hosted backend to the designated Mac before retiring the backend. Accept generation during normal use rather than require unattended scheduling initially.

## Open design questions

- Is there one active integration desktop or support for multiple writers?
- What edits are accepted when the plugin is stopped or absent?
- Task-class coverage is settled: all retained records. Purged or otherwise missing records leave existing notes unchanged and never trigger task recreation.
- Which properties are editable, derived, or informational?
- How do note creation, duplication, rename, and deletion behave?
- What happens when the note and task both change before reconciliation?
- Where are baselines, pending operations, errors, and settings persisted?
- How are failed/partial writes and ambiguous command outcomes recovered?
- What synchronization cadence and Taskwarrior versions are supported?
- How are project documentation links and freeform note bodies preserved?
- What is the completion/history retention policy? Recurrence ownership is settled: the Mac takes over at backend retirement without a new scheduler initially.
- Which minimum Obsidian version, plugin ID, and license should be used?

## References

- [Taskwarrior ecosystem and concurrency research](ecosystem-research.md)
- [Native Bases Kanban](https://obsidian.md/help/bases/views/kanban)
- [MetadataCache changed event](<https://docs.obsidian.md/Reference/TypeScript+API/MetadataCache/on('changed')>)
- [Atomic frontmatter updates](https://docs.obsidian.md/Reference/TypeScript+API/FileManager/processFrontMatter)
- [Obsidian release automation](https://docs.obsidian.md/Plugins/Releasing/Release+your+plugin+with+GitHub+Actions)
- [Taskchamp Obsidian integration](https://github.com/marriagav/taskchamp#obsidian-integration)
