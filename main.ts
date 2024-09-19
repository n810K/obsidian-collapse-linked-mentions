import { Plugin, MarkdownView } from "obsidian";

export default class CollapseLinkedMentionsPlugin extends Plugin {
  async onload() {
    this.registerEvent(
      this.app.workspace.on("layout-change", this.collapseLinkedMentions)
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", this.collapseLinkedMentions)
    );
  }

  collapseLinkedMentions = () => {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      const linkedMentionsEl = activeView.containerEl.querySelector(
        ".tree-item-self.is-clickable .tree-item-inner"
      ) as HTMLElement;

      if (linkedMentionsEl) {
        const parentEl = linkedMentionsEl.closest('.tree-item-self');
        if (parentEl && !parentEl.classList.contains("is-collapsed")) {
          linkedMentionsEl.click();
        }
      }
    }
  };
}
