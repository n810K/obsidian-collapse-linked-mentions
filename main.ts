import { Plugin, MarkdownView, PluginSettingTab, Setting, App } from "obsidian";

interface CollapseLinkedMentionsSettings {
  minHeight: string; 
}

const DEFAULT_SETTINGS: CollapseLinkedMentionsSettings = {
  minHeight: '400px',
};

export default class CollapseLinkedMentionsPlugin extends Plugin {
  settings: CollapseLinkedMentionsSettings;

  async onload() {
    console.log('Loading CollapseLinkedMentionsPlugin');
    await this.loadSettings();

    this.registerEvent(
      this.app.workspace.on("layout-change", this.collapseLinkedMentions)
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", this.collapseLinkedMentions)
    );

    this.addSettingTab(new CollapseLinkedMentionsSettingTab(this.app, this));

    this.applyStyles();
  }

  applyStyles() {
    let style = document.getElementById('my-plugin-style') as HTMLStyleElement;
    if (!style) {
      style = document.createElement('style');
      style.id = 'my-plugin-style';
      document.head.appendChild(style);
    }
    style.textContent = `
      .workspace-leaf .workspace-leaf-content .embedded-backlinks {
        min-height: ${this.settings.minHeight}px !important;
      }
    `;
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.applyStyles();
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

class CollapseLinkedMentionsSettingTab extends PluginSettingTab {
  plugin: CollapseLinkedMentionsPlugin;

  constructor(app: App, plugin: CollapseLinkedMentionsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.createEl('h2', { text: 'Collapse Linked Mentions Settings' });

    new Setting(containerEl)
      .setName('Minimum Height')
      .setDesc('Set the minimum height for the embedded backlinks')
      .addText(text => text
        .setPlaceholder('Enter minimum height (e.g., 100px)')
        .setValue(this.plugin.settings.minHeight)
        .onChange(async (value) => {
          this.plugin.settings.minHeight = value;
          await this.plugin.saveSettings();
        }));
  }
}
