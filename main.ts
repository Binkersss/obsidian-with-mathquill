import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import "./mathquill.js";
import "./mathquill.css"

// Remember to rename these classes and interfaces!

interface MathQuillPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MathQuillPluginSettings = {
	mySetting: 'default'
}

export default class MathQuillPlugin extends Plugin {
	settings: MathQuillPluginSettings;

	async onload() {
		await this.loadSettings();
		console.log('Mathquill Plugin loaded');

		this.addCommand({
			id: 'insert-mathquill',
			name: 'Insert Mathquill Equation',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());

				const container = this.createMathQuillContainer();
				document.body.appendChild(container);

				const MQ = (window as any).MathQuill.getInterface(2); // Get Mathquill interface
				const mathField = MQ.MathField(container, {
					spaceBeahveLiveTab: true,
					handles: {
						edit: () => {
							const enteredMath = mathField.latex();
							// Inject LaTeX to editor
							editor.replaceSelection('$$${enteredmath$$$');
							document.body.removeChild(container); // Remove input field after use
						}
					}
				})
			}
		})

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		console.log('MathQuill Plugin unloaded');
	}

	createMathQuillContainer() {
		const container = document.createElement('div');
		container.id = 'math-field';
		container.style.position = 'fixed';
		container.style.top = '50%';
		container.style.left = '50%';
		container.style.transform = 'translate(-50%, -50%)';
		container.style.zIndex = '1000';
		container.style.backgroundColor = 'white';
		container.style.border = '1px solid black';
		container.style.padding = '10px';
		container.style.width = '400px';
		container.style.height = '200px';
		return container;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MathQuillPlugin;

	constructor(app: App, plugin: MathQuillPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
