import { Notice, Plugin } from "obsidian";

export default class TaskwarriorNotesPlugin extends Plugin {
  onload(): void {
    this.addCommand({
      id: "hello-world",
      name: "Hello world",
      callback: () => this.sayHello(),
    });
    this.addRibbonIcon("check-check", "Taskwarrior Notes: Hello world", () =>
      this.sayHello(),
    );
  }

  private sayHello(): void {
    new Notice(`Hello world from Taskwarrior Notes ${this.manifest.version}!`);
  }
}
