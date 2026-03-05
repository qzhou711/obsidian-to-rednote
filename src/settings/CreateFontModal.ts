import { App, Modal, Setting, setIcon } from 'obsidian';

export class CreateFontModal extends Modal {
    private font: { value: string; label: string; isPreset?: boolean };
    private onSubmit: (font: { value: string; label: string }) => void;

    constructor(
        app: App,
        onSubmit: (font: { value: string; label: string }) => void,
        existingFont?: { value: string; label: string; isPreset?: boolean }
    ) {
        super(app);
        this.onSubmit = onSubmit;
        this.font = existingFont ?? { value: '', label: '' };
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('red-font-modal');

        // 修改标题容器结构
        const headerContainer = contentEl.createDiv({ cls: 'rfd-header' });
        headerContainer.createEl('h3', { text: this.font.label ? '编辑字体' : '添加字体' });
        
        // 帮助按钮容器
        const helpBtnContainer = headerContainer.createDiv({ cls: 'rfd-help-trigger' });
        const helpBtn = helpBtnContainer.createEl('button', { cls: 'rfd-help-btn' });
        setIcon(helpBtn, 'help-circle');

        // 提示框
        const helpTooltip = helpBtnContainer.createDiv({ cls: 'rfd-help-tooltip' });
        helpTooltip.setText(`👋 字体值设置说明
                                    • 单个字体：Arial 或 "Microsoft YaHei"
                                    • 中文字体：需要同时设置中英文名称
                                    • 字体族：添加 serif/sans-serif
                                    • 多个字体用逗号分隔
                                    示例
                                    • 宋体：SimSun, "宋体", serif
                                    • 微软雅黑："Microsoft YaHei", "微软雅黑", sans-serif`);

        new Setting(contentEl)
            .setName('字体名称')
            .setDesc('显示在下拉菜单中的名称')
            .addText(text => text
                .setValue(this.font.label)
                .onChange(value => this.font.label = value));

        new Setting(contentEl)
            .setName('字体值')
            .setDesc('CSS font-family 的值')
            .addText(text => text
                .setValue(this.font.value)
                .onChange(value => this.font.value = value))

        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText('确定')
                .setCta()
                .onClick(() => {
                    if (!this.font.label || !this.font.value) {
                        return;
                    }
                    this.onSubmit(this.font);
                    this.close();
                }))
            .addButton(btn => btn
                .setButtonText('取消')
                .onClick(() => this.close()));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}