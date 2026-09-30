# Taskwarrior ecosystem research

Research date: 2026-09-30. All 32 public GothenburgBitFactory repositories were enumerated and screened for relevance; relevant implementation paths and selected third-party integrations were inspected. This is not an exhaustive audit of all GitHub projects. Candidates were not executed. Upstream default-branch findings do not establish behavior of an installed version.

## Synchronization guarantees

TaskChampion provides local transactional locking and optimistic concurrency for remote synchronization, not a distributed task lock spanning `sync → command → sync`.

- Local SQLite uses an immediate transaction: [source](https://github.com/GothenburgBitFactory/taskchampion/blob/ed263a51165abc2a6acd67f309c4279cafc47a24/src/storage/sqlite/inner.rs#L112-L122).
- The sync server checks the submitted parent version transactionally and rejects a stale parent: [source](https://github.com/GothenburgBitFactory/taskchampion-sync-server/blob/fe9b410eb98ca0711c48b7147e47523e5f1638aa/core/src/server.rs#L144-L174).
- Replica synchronization transforms intervening operations and retries. Different properties can merge independently; competing updates to the same property use operation timestamps. Matching values collapse: [transform rules](https://github.com/GothenburgBitFactory/taskchampion/blob/ed263a51165abc2a6acd67f309c4279cafc47a24/src/server/op.rs#L57-L123).

These rules operate on task properties, not user-level intentions such as dragging a stale card. The protocol does not identify a note change as a human edit, a vault-sync delivery, or the plugin's own projection. The bridge still needs change detection and feedback suppression. We should reuse TaskChampion's task synchronization rather than implement another distributed sync engine.

## Useful references

| Project                            | Reuse opportunity                                                   | Boundary                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Taskwarrior                        | Existing CLI and configured TaskChampion synchronization            | Separate CLI commands do not form an atomic distributed transaction                             |
| tasklib                            | Argument-array invocation, changed-field writes, post-write refresh | Python library; borrow patterns rather than add a runtime                                       |
| Bugwarrior                         | Cooperative local lock around a workflow; stable external identity  | Its lock does not exclude unrelated CLI or remote clients                                       |
| task-timewarrior-hook              | Reacting to meaningful old/new differences and real-command tests   | Avoid requiring a second note-writing process                                                   |
| marad/taskwarrior-notes            | UUID-centered frontmatter projection                                | Inspected path is Taskwarrior-to-note, not bidirectional reconciliation                         |
| nbossard/obsidian-taskwarrior-sync | Checkbox mappings and examples                                      | Bash import/rewrite pipeline; no baseline or feedback suppression identified in inspected paths |
| SntTGR/obsidian-tw-task-wiki       | Existing Obsidian integration UX                                    | Custom report UI, not native Bases property reconciliation                                      |

Evidence:

- [tasklib changed-field save and refresh](https://github.com/GothenburgBitFactory/tasklib/blob/793a86d2432d93425e36a6384db1f563be07018c/tasklib/backends.py#L327-L360)
- [Bugwarrior cooperative lock](https://github.com/GothenburgBitFactory/bugwarrior/blob/4ed78ac2734e0979268d41ff22ef8b6d4a7a40ee/bugwarrior/command.py#L122-L137)
- [Isolated upstream Taskwarrior test replica](https://github.com/GothenburgBitFactory/taskwarrior/blob/9956cdfc674ec33d758675b7fab532c48ed8d555/test/basetest/task.py#L22-L85)
- [Task notes frontmatter projection](https://github.com/marad/taskwarrior-notes/blob/87222d32d6786c4234fc494eaa9d2bae911d0e9f/cmd/sync.go#L61-L105)
- [Checkbox bridge orchestration](https://github.com/nbossard/obsidian-taskwarrior-sync/blob/327f7cbc95dd40ed8e032051c60c61b1492dd38e/mtt_sync.sh#L77-L82)
- [Task wiki command handler](https://github.com/SntTGR/obsidian-tw-task-wiki/blob/8dc38333d646062a4ff48d03c923d5a547225512/src/task-handler.ts#L103-L168)

## Other paths considered

TaskChampion has Rust and Python interfaces, plus WASM/IndexedDB support in source. No ready-to-import official JS/TS SDK was identified in the organization screen. WASM also has an open IndexedDB synchronization issue: [#685](https://github.com/GothenburgBitFactory/taskchampion/issues/685). A separate browser replica would expand the proposed desktop plugin's scope and would not itself reconcile Markdown edits.

Legacy taskserver/taskd targets Taskwarrior 2 and is not the Taskwarrior 3 integration path. Other inspected Obsidian integrations render reports, rewrite checkbox lists, or contain only scaffolding. No inspected project provides the required native-Bases bidirectional property bridge with established concurrent-edit and recovery behavior.

## Recommendation pending design confirmation

Keep the local CLI boundary. Serialize plugin workflows, sync before a mutation, compare relevant fields against the last reconciled baseline, perform only necessary changes, read back the result, sync again, and reconcile the note. Distinguish a failed pre-sync from a successful local write whose publication failed; never blindly replay an ambiguous mutation.

Use TaskChampion for task-replica conflict resolution. Decide separately whether a stale Obsidian edit should overwrite changed task fields or be surfaced for user resolution. That product policy remains open.
