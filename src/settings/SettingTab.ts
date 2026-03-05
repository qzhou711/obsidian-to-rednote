import { App, PluginSettingTab, Setting, setIcon, Notice } from 'obsidian';
import RedPlugin from '../main'; // 修改插件名以匹配类名
import { CreateThemeModal } from './CreateThemeModal';
import { CreateFontModal } from './CreateFontModal';
import { ConfirmModal } from './ConfirmModal'; // 添加确认模态框导入
import { ThemePreviewModal } from './ThemePreviewModal'; // 新增导入

export class RedSettingTab extends PluginSettingTab {
    plugin: RedPlugin; // 修改插件类型以匹配类名
    private expandedSections: Set<string> = new Set();

    constructor(app: App, plugin: RedPlugin) { // 修改插件类型以匹配类名
        super(app, plugin);
        this.plugin = plugin;
    }

    private createSection(containerEl: HTMLElement, title: string, renderContent: (contentEl: HTMLElement) => void) {
        const section = containerEl.createDiv('settings-section');
        const header = section.createDiv('settings-section-header');
        
        const toggle = header.createSpan('settings-section-toggle');
        setIcon(toggle, 'chevron-right');
        
        header.createEl('h4', { text: title });
        
        const content = section.createDiv('settings-section-content');
        renderContent(content);
        
        header.addEventListener('click', () => {
            const isExpanded = !section.hasClass('is-expanded');
            section.toggleClass('is-expanded', isExpanded);
            setIcon(toggle, isExpanded ? 'chevron-down' : 'chevron-right');
            if (isExpanded) {
                this.expandedSections.add(title);
            } else {
                this.expandedSections.delete(title);
            }
        });
        
        if (this.expandedSections.has(title) || (!containerEl.querySelector('.settings-section'))) {
            section.addClass('is-expanded');
            setIcon(toggle, 'chevron-down');
            this.expandedSections.add(title);
        }
        
        return section;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass('red-settings');

        containerEl.createEl('h2', { text: 'Note to RED 设置' });

        this.createSection(containerEl, '基本设置', el => this.renderBasicSettings(el));
        this.createSection(containerEl, '主题设置', el => this.renderThemeSettings(el));
    }

    private renderBasicSettings(containerEl: HTMLElement): void {
        // 排版管理区域
        const typographySection = containerEl.createDiv('red-settings-subsection');
        const typographyHeader = typographySection.createDiv('red-settings-subsection-header');
        const typographyToggle = typographyHeader.createSpan('red-settings-subsection-toggle');
        setIcon(typographyToggle, 'chevron-right');
        
        typographyHeader.createEl('h3', { text: '排版管理' });
        
        const typographyContent = typographySection.createDiv('red-settings-subsection-content');
        
        // 折叠/展开逻辑
        typographyHeader.addEventListener('click', () => {
            const isExpanded = !typographySection.hasClass('is-expanded');
            typographySection.toggleClass('is-expanded', isExpanded);
            setIcon(typographyToggle, isExpanded ? 'chevron-down' : 'chevron-right');
        });

        // 内容分割说明
        new Setting(typographyContent)
            .setName('内容分割方式')
            .setDesc('在文档中使用 --- 分割线来划分每张图片的内容，每段内容将生成一张独立的图片。');

        // 字体管理区域
        const fontSection = containerEl.createDiv('red-settings-subsection');
        const fontHeader = fontSection.createDiv('red-settings-subsection-header');
        const fontToggle = fontHeader.createSpan('red-settings-subsection-toggle');
        setIcon(fontToggle, 'chevron-right');
        
        fontHeader.createEl('h3', { text: '字体管理' });
        
        const fontContent = fontSection.createDiv('red-settings-subsection-content');
        
        // 折叠/展开逻辑
        fontHeader.addEventListener('click', () => {
            const isExpanded = !fontSection.hasClass('is-expanded');
            fontSection.toggleClass('is-expanded', isExpanded);
            setIcon(fontToggle, isExpanded ? 'chevron-down' : 'chevron-right');
        });

        // 字体列表
        const fontList = fontContent.createDiv('font-management');
        this.plugin.settingsManager.getFontOptions().forEach(font => {
            const fontItem = fontList.createDiv('font-item');
            const setting = new Setting(fontItem)
                .setName(font.label)
                .setDesc(font.value);

            // 只为非预设字体添加编辑和删除按钮
            if (!font.isPreset) {
                setting
                    .addExtraButton(btn => 
                        btn.setIcon('pencil')
                            .setTooltip('编辑')
                            .onClick(() => {
                                new CreateFontModal(
                                    this.app,
                                    async (updatedFont) => {
                                        await this.plugin.settingsManager.updateFont(font.value, updatedFont);
                                        this.display();
                                        new Notice('请重启 Obsidian 或重新加载以使更改生效');
                                    },
                                    font
                                ).open();
                            }))
                    .addExtraButton(btn => 
                        btn.setIcon('trash')
                            .setTooltip('删除')
                            .onClick(() => {
                                // 新增确认模态框
                                new ConfirmModal(
                                    this.app,
                                    '确认删除字体',
                                    `确定要删除「${font.label}」字体配置吗？`,
                                    async () => {
                                        await this.plugin.settingsManager.removeFont(font.value);
                                        this.display();
                                        new Notice('请重启 Obsidian 或重新加载以使更改生效');
                                    }
                                ).open();
                            }));
            }
        });

        // 添加新字体按钮
        new Setting(fontContent)
            .addButton(btn => btn
                .setButtonText('+ 添加字体')
                .setCta()
                .onClick(() => {
                    new CreateFontModal(
                        this.app,
                        async (newFont) => {
                            await this.plugin.settingsManager.addCustomFont(newFont);
                            this.display();
                            new Notice('请重启 Obsidian 或重新加载以使更改生效');
                        }
                    ).open();
                }));
    }

    private renderThemeSettings(containerEl: HTMLElement): void {
        // 主题显示设置部分
        const themeVisibilitySection = containerEl.createDiv('red-settings-subsection');
        const themeVisibilityHeader = themeVisibilitySection.createDiv('red-settings-subsection-header');
        
        const themeVisibilityToggle = themeVisibilityHeader.createSpan('red-settings-subsection-toggle');
        setIcon(themeVisibilityToggle, 'chevron-right');
        
        themeVisibilityHeader.createEl('h3', { text: '显示设置' });
        
        const themeVisibilityContent = themeVisibilitySection.createDiv('red-settings-subsection-content');
        
        // 折叠/展开逻辑
        themeVisibilityHeader.addEventListener('click', () => {
            const isExpanded = !themeVisibilitySection.hasClass('is-expanded');
            themeVisibilitySection.toggleClass('is-expanded', isExpanded);
            setIcon(themeVisibilityToggle, isExpanded ? 'chevron-down' : 'chevron-right');
        });
        
        // 添加页脚显示设置
        new Setting(themeVisibilityContent)
            .setName('是否显示时间')
            .setDesc('控制是否在主题中显示页眉时间')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settingsManager.getSettings().showTime !== false)
                .onChange(async (value) => {
                    await this.plugin.settingsManager.updateSettings({
                        showTime: value
                    });
                    new Notice('请重启 Obsidian 或重新加载以使更改生效');
                })
            );

        // 添加页脚显示设置
        new Setting(themeVisibilityContent)
            .setName('是否显示页脚')
            .setDesc('控制是否在主题中显示页脚部分')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settingsManager.getSettings().showFooter !== false)
                .onChange(async (value) => {
                    await this.plugin.settingsManager.updateSettings({
                        showFooter: value
                    });
                    new Notice('请重启 Obsidian 或重新加载以使更改生效');
                })
            );
   
        themeVisibilityContent.createEl('hr', { cls: 'red-settings-divider' });

        // 主题选择容器
        const themeSelectionContainer = themeVisibilityContent.createDiv('theme-selection-container');
        
        // 左侧：所有主题列表
        const allThemesContainer = themeSelectionContainer.createDiv('all-themes-container');
        allThemesContainer.createEl('h4', { text: '隐藏主题' });
        const allThemesList = allThemesContainer.createDiv('themes-list');
        
        // 中间：控制按钮
        const controlButtonsContainer = themeSelectionContainer.createDiv('control-buttons-container');
        const addButton = controlButtonsContainer.createEl('button', { text: '>' });
        const removeButton = controlButtonsContainer.createEl('button', { text: '<' });

        // 右侧：显示的主题列表
        const visibleThemesContainer = themeSelectionContainer.createDiv('visible-themes-container');
        visibleThemesContainer.createEl('h4', { text: '显示主题' });
        const visibleThemesList = visibleThemesContainer.createDiv('themes-list');
        
        
        
        // 获取所有主题
        const allThemes = this.plugin.settingsManager.getAllThemes();
        
        // 渲染主题列表
        const renderThemeLists = () => {
            // 清空列表
            allThemesList.empty();
            visibleThemesList.empty();
            
            // 填充左侧列表（所有未显示的主题）
            allThemes
                .filter(theme => theme.isVisible === false)
                .forEach(theme => {
                    const themeItem = allThemesList.createDiv('theme-list-item');
                    themeItem.textContent = theme.name;
                    themeItem.dataset.themeId = theme.id;
                    
                    // 点击选中/取消选中
                    themeItem.addEventListener('click', () => {
                        themeItem.toggleClass('selected', !themeItem.hasClass('selected'));
                    });
                });
            
            // 填充右侧列表（所有显示的主题）
            allThemes
                .filter(theme => theme.isVisible !== false) // 默认显示
                .forEach(theme => {
                    const themeItem = visibleThemesList.createDiv('theme-list-item');
                    themeItem.textContent = theme.name;
                    themeItem.dataset.themeId = theme.id;
                    
                    // 点击选中/取消选中
                    themeItem.addEventListener('click', () => {
                        themeItem.toggleClass('selected', !themeItem.hasClass('selected'));
                    });
                });
        };
        
        // 初始渲染
        renderThemeLists();
        
        // 添加按钮事件
        addButton.addEventListener('click', async () => {
            const selectedItems = Array.from(allThemesList.querySelectorAll('.theme-list-item.selected'));
            if (selectedItems.length === 0) return;
            
            for (const item of selectedItems) {
                const themeId = (item as HTMLElement).dataset.themeId;
                if (!themeId) continue;
                
                const theme = allThemes.find(t => t.id === themeId);
                if (theme) {
                    theme.isVisible = true;
                    await this.plugin.settingsManager.updateTheme(themeId, theme);
                }
            }
            
            renderThemeLists();
            new Notice('请重启 Obsidian 或重新加载以使更改生效');
        });
        
        // 移除按钮事件
        removeButton.addEventListener('click', async () => {
            const selectedItems = Array.from(visibleThemesList.querySelectorAll('.theme-list-item.selected'));
            if (selectedItems.length === 0) return;
            
            for (const item of selectedItems) {
                const themeId = (item as HTMLElement).dataset.themeId;
                if (!themeId) continue;
                
                const theme = allThemes.find(t => t.id === themeId);
                if (theme) {
                    theme.isVisible = false;
                    await this.plugin.settingsManager.updateTheme(themeId, theme);
                }
            }
            
            renderThemeLists();
            new Notice('请重启 Obsidian 或重新加载以使更改生效');
        });

        // 主题管理区域
        const themeList = containerEl.createDiv('theme-management');
        // 渲染自定义主题
        themeList.createEl('h4', { text: '自定义主题', cls: 'theme-custom-header' });
        this.plugin.settingsManager.getAllThemes()
            .filter(theme => !theme.isPreset)
            .forEach(theme => {
                const themeItem = themeList.createDiv('theme-item');
                new Setting(themeItem)
                    .setName(theme.name)
                    .setDesc(theme.description)
                    .addExtraButton(btn => 
                        btn.setIcon('eye')
                            .setTooltip('预览')
                            .onClick(() => {
                                new ThemePreviewModal(this.app, this.plugin.settingsManager, theme, this.plugin.themeManager).open(); // 修改为使用预览模态框
                            }))
                    .addExtraButton(btn => 
                        btn.setIcon('pencil')
                            .setTooltip('编辑')
                            .onClick(() => {
                                new CreateThemeModal(
                                    this.app,
                                    this.plugin,
                                    (updatedTheme) => {
                                        this.plugin.settingsManager.updateTheme(theme.id, updatedTheme);
                                        this.display();
                                        new Notice('请重启 Obsidian 或重新加载以使更改生效');
                                    },
                                    theme
                                ).open();
                            }))
                    .addExtraButton(btn => 
                        btn.setIcon('trash')
                            .setTooltip('删除')
                            .onClick(() => {
                                // 新增确认模态框
                                new ConfirmModal(
                                    this.app,
                                    '确认删除主题',
                                    `确定要删除「${theme.name}」主题吗？此操作不可恢复。`,
                                    async () => {
                                        await this.plugin.settingsManager.removeTheme(theme.id);
                                        this.display();
                                        new Notice('请重启 Obsidian 或重新加载以使更改生效');
                                    }
                                ).open();
                            }));
            });
    
        // 添加新主题按钮
        new Setting(containerEl)
            .addButton(btn => btn
                .setButtonText('+ 新建主题')
                .setCta()
                .onClick(() => {
                    new CreateThemeModal(
                        this.app,
                        this.plugin,
                        async (newTheme) => {
                            await this.plugin.settingsManager.addCustomTheme(newTheme);
                            this.display();
                            new Notice('请重启 Obsidian 或重新加载以使更改生效');
                        }
                    ).open();
                }));
    }
}
