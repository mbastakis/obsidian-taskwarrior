# Taskwarrior in Obsidian

Language for representing and managing existing tasks within an Obsidian vault while retaining Taskwarrior as the task system of record.

## Language

**Task**:
A record in the Taskwarrior system of record, identified independently of its title or location in a vault. This includes unfinished and completed work, deleted records, and recurring templates; not every Task is executable work.
_Avoid_: Card, note, checkbox

**Task Note**:
An Obsidian note representing one **Task**, with task information and optional supporting prose. It is not an independently authoritative task.
If its Task is purged, the Task Note retains its last reflected information and prose without further projection updates.
_Avoid_: Duplicate task, imported task

**Task Collection**:
The explicitly scoped set of **Task Notes** within a vault, with one Task Note for each retained **Task**, including deleted records and recurring templates. It is distinct from ordinary knowledge and project notes.
_Avoid_: Inbox, task database

**Board**:
A visual grouping of **Task Notes** used to inspect and manage their corresponding **Tasks**.
_Avoid_: Source of truth, task store

**Reflected State**:
The task-property values last successfully represented in a **Task Note** from its corresponding **Task**. It distinguishes an unchanged task representation from a subsequent note edit.
_Avoid_: Latest task state, remote state

**Pending Note Edit**:
A supported change to a **Task Note** that has not yet been confirmed as applied to its **Task**. It remains an edit to submit even if the integration was interrupted before applying it.
_Avoid_: Remote conflict, synchronized change

## Example dialogue

**Developer:** Does moving a card create a new Task?

**Domain expert:** No. The Board displays a Task Note representing an existing Task. An accepted move changes that Task's state.

**Developer:** Does every project document become a Task Note?

**Domain expert:** No. Project documentation can link to the Task Collection without becoming part of it.
