# Obsidian Taskwarrior

Planned desktop Obsidian integration for viewing and managing Taskwarrior tasks through native Bases Kanban. Taskwarrior remains the task system of record, with TaskChampion synchronization connecting existing clients.

**Status: design stage. No installable plugin or release pipeline exists yet.**

## Direction

- Use native Bases for the interface rather than build another task frontend.
- Represent tasks in a dedicated collection within an existing vault.
- Translate supported note-property edits into native Taskwarrior operations.
- Reconcile changes made through Taskwarrior and other TaskChampion clients.
- Keep mobile task management in an existing client such as Taskchamp.
- Develop against an isolated vault and task replica; install versioned releases into the real vault.

## Documentation

- [Implementation and delivery plan](docs/plan.md)
- [Domain language](CONTEXT.md)

The repository name is provisional as a distribution name. Plugin ID, license, supported versions, and the synchronization contract remain to be settled before distribution.
