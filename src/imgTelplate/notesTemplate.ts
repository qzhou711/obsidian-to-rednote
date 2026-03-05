import type { ImgTemplate } from '../imgTemplateManager';
import type { SettingsManager } from '../settings/settings';

export class NotesTemplate implements ImgTemplate {
    id = 'notes';
    name = '备忘录';
    sections = {
        header: true,
        content: true as const,
        footer: false
    };

    constructor(
        private settingsManager: SettingsManager,
        private onSettingsUpdate: () => Promise<void>
    ) { }

    render(element: HTMLElement) {
        const sections = element.querySelectorAll('.red-content-section');
        sections.forEach(() => {
            const header = element.querySelector('.red-preview-header');
            if (header) {
                header.empty();
                header.addClass('red-notes-header');
                const headerBar = header.createEl('div', { cls: 'red-notes-bar' });

                // 添加可编辑的标题元素
                const settings = this.settingsManager.getSettings();
                const notesTitle = headerBar.createEl('div', {
                    cls: 'red-notes-title',
                    text: settings.notesTitle || '备忘录',
                    attr: { 'title': '点击编辑标题' }
                });

                // 添加点击事件处理
                notesTitle.addEventListener('click', () => this.handleTitleEdit(notesTitle));
                // 在render方法中添加循环箭头按钮
                const cycleButtons = headerBar.createEl('div', { cls: 'red-notes-cycle-buttons' });
                cycleButtons.createEl('div', { cls: 'red-notes-cycle-left' });
                cycleButtons.createEl('div', { cls: 'red-notes-cycle-right' });
                // 添加其他元素
                headerBar.createEl('div', { cls: 'red-notes-actions' });
            }

            const footer = element.querySelector('.red-preview-footer');
            if (footer && !this.sections.footer) {
                footer.empty();
                footer.removeAttribute('class');
            }
        });
    }

    private async handleTitleEdit(element: HTMLElement) {
        const input = document.createElement('input');
        input.value = element.textContent || '';
        input.className = 'red-notes-edit-input';
        input.placeholder = '请输入标题';
        element.replaceWith(input);
        input.focus();

        const handleBlur = async () => {
            const newTitle = input.value.trim();
            await this.settingsManager.updateSettings({
                notesTitle: newTitle || '备忘录'
            });
            await this.onSettingsUpdate();
            input.replaceWith(element);
        };

        input.addEventListener('blur', handleBlur);
        input.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                await handleBlur();
            }
        });
    }
}