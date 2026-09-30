# Taskwarrior in Obsidian

Language for representing and managing existing tasks within an Obsidian vault while retaining Taskwarrior as the task system of record.

## Language

**Task**:
An actionable record in the Taskwarrior system of record, identified independently of its title or location in a vault.
_Avoid_: Card, note, checkbox

**Task Note**:
An Obsidian note representing one **Task**, with task information and optional supporting prose. It is not an independently authoritative task.
_Avoid_: Duplicate task, imported task

**Task Collection**:
The explicitly scoped set of **Task Notes** within a vault, distinct from ordinary knowledge and project notes.
_Avoid_: Inbox, task database

**Board**:
A visual grouping of **Task Notes** used to inspect and manage their corresponding **Tasks**.
_Avoid_: Source of truth, task store

## Example dialogue

**Developer:** Does moving a card create a new Task?

**Domain expert:** No. The Board displays a Task Note representing an existing Task. An accepted move changes that Task's state.

**Developer:** Does every project document become a Task Note?

**Domain expert:** No. Project documentation can link to the Task Collection without becoming part of it.
