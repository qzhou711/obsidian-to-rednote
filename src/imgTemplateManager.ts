import { DefaultTemplate } from './imgTelplate/defaultTemplate';
import { NotesTemplate } from './imgTelplate/notesTemplate';
import type { SettingsManager } from './settings/settings';
import type { ThemeManager } from './themeManager';
export interface ImgTemplate {
    id: string;
    name: string;
    sections: {
        header?: boolean;
        content: true;
        footer?: boolean;
    };
    render: (element: HTMLElement, settings: any) => void;
}

export class ImgTemplateManager {
    private templates: ImgTemplate[] = [];
    private currentTemplate: ImgTemplate | null = null;

    constructor(
        private settingsManager: SettingsManager,
        private onSettingsUpdate: () => Promise<void>,
        private themeManager: ThemeManager
    ) {
        this.initializeTemplates();
    }

    private initializeTemplates() {
        // 注册默认模板
        this.registerTemplate(new DefaultTemplate(this.settingsManager, this.onSettingsUpdate));

        // 注册现代模板
        this.registerTemplate(new NotesTemplate(this.settingsManager, this.onSettingsUpdate));
    }

    registerTemplate(template: ImgTemplate) {
        this.templates.push(template);
    }

    getImgTemplateOptions() {
        return this.templates.map(t => ({
            value: t.id,
            label: t.name
        }));
    }

    setCurrentTemplate(id: string) {
        const template = this.templates.find(t => t.id === id);
        if (template) {
            this.currentTemplate = template;
        }
    }

    applyTemplate(previewEl: HTMLElement, settings: any) {
        if (!this.currentTemplate) {
            this.currentTemplate = this.templates[0];
        }

        if (this.currentTemplate) {
            this.currentTemplate.render(previewEl, settings);
            this.themeManager.applyTheme(previewEl);
        }
    }
}