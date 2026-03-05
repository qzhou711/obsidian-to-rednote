import { App, Modal, Setting, Notice, setIcon } from 'obsidian';
import { Theme } from '../themeManager';
import { ThemePreviewModal } from './ThemePreviewModal';
import RedPlugin from '../main';
export class CreateThemeModal extends Modal {
    theme: Theme;
    onSubmit: (theme: Theme) => void;
    private nameInput: HTMLInputElement;
    private plugin: RedPlugin;
    private themeSelect: HTMLSelectElement;
    private showSampleTemplate = false;
    private existingTheme: Theme | undefined;
    constructor(app: App, plugin: RedPlugin, onSubmit: (theme: Theme) => void, existingTheme?: Theme) {
        super(app);
        this.plugin = plugin;
        this.existingTheme = existingTheme;
        this.onSubmit = onSubmit;

        this.theme = existingTheme ? { ...existingTheme } : {
            id: '',
            name: '',
            description: '',
            isPreset: false,
            isVisible: true,
            styles: this.initializeStyles() // 使用合并后的初始化方法
        };
    }

    private initializeStyles(): any {
        return {
            imagePreview: "background-color: #fffaf5; padding: 32px 28px;",
            header: {
                avatar: {
                    container: "width: 42px; height: 42px; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(184,115,51,0.1);",
                    placeholder: "transition: all 0.3s ease;",
                    image: "object-fit: cover; transition: transform 0.3s ease; filter: brightness(1.05) contrast(1.02);"
                },
                nameContainer: "display: flex; align-items: center; gap: 8px;",
                userName: "font-size: 17px; font-weight: 600; color: #8b4513; serif; text-shadow: 0 2px 4px rgba(139,69,19,0.1);",
                userId: "font-size: 14px; color: #b87333; font-family: 'Noto Serif SC', serif;",
                postTime: "font-size: 13px; color: #d2691e; font-style: italic;",
                verifiedIcon: "width: 20px; height: 20px; margin-left: -5px; fill: #1DA1F2;"
            },
            footer: {
                container: "position: absolute; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: center; gap: 14px; padding: 16px; color: #b87333; font-size: 13px; border-top: 1px solid #b8733380; background: rgba(255,250,245,0.95); backdrop-filter: blur(8px);",
                text: "color: inherit; transition: color 0.2s ease; font-style: italic; white-space: nowrap;",
                separator: "color: #deb887;"
            },
            title: {
                h2: {
                    base: "margin: 10px 0 0; font-size: 1.6em; letter-spacing: 0.01em; line-height: 1.5;",
                    content: "font-weight: 600; color: #8b4513; ",
                    after: ""
                },
                h3: {
                    base: "margin: 8px 0 0; font-size: 1.3em; line-height: 1.5;",
                    content: "font-weight: 600; color: #8b4513; ",
                    after: ""
                },
                base: {
                    base: "margin: 6px 0 0; font-size: 1.15em; line-height: 1.5;",
                    content: "font-weight: 600; color: #8b4513;",
                    after: ""
                }
            },
            paragraph: "line-height: 1.75; margin-bottom: 1.1em; font-size: 15px; color: #5a4a42;",
            emphasis: {
                strong: "font-weight: 600; color: #d2691e;",
                em: "font-style: normal; color: #b87333; background: rgba(184,115,51,0.1); padding: 0 4px; border-left: 2px solid #b8733380;",
                del: "text-decoration: line-through; color: #8b4513; opacity: 0.8;"
            },
            list: {
                container: "padding-left: 26px; margin-bottom: 1.2em; color: #6b4423;",
                item: "margin-bottom: 0.8em; font-size: 15px; color: #6b4423; line-height: 1.85; font-family: 'Noto Serif SC', serif;",
                taskList: "list-style: none; margin-left: -22px; font-size: 15px; color: #6b4423; line-height: 1.85; font-family: 'Noto Serif SC', serif;"
            },
            code: {
                block: "background: #fff6e9; padding: 1.2em; border-radius: 8px; font-size: 14px; font-family: 'Fira Code', monospace; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word; color: #8b4513; margin: 1.3em 0; border: 1px solid #b8733380; box-shadow: inset 0 4px 12px rgba(184,115,51,0.05), 0 2px 8px rgba(184,115,51,0.05);",
                inline: "background: #fff6e9; padding: 4px 10px; border-radius: 4px; color: #8b4513; font-size: 14px; font-family: 'Fira Code', monospace; border: 1px solid #b8733380;"
            },
            quote: "border-left: 3px solid #deb887; padding: 0 0 0 20px; margin: 1.3em 0; color: #b87333; font-style: italic; font-size: 15px; line-height: 1.85; font-family: 'Noto Serif SC', serif; background: linear-gradient(to right, rgba(222,184,135,0.1), transparent);",
            image: "max-width: 100%; height: auto; margin: 1.5em auto; border-radius: 12px; box-shadow: 0 4px 16px rgba(184,115,51,0.1); border: 1px solid #b8733380;",
            link: "color: #d2691e; text-decoration: none; background-image: linear-gradient(to right, #d2691e80, #b8733380); background-size: 0% 1px; background-repeat: no-repeat; background-position: 0 100%; transition: all 0.3s ease; font-family: 'Noto Serif SC', serif;",
            table: {
                container: "width: 100%; margin: 1.4em 0; border-collapse: separate; border-spacing: 0; border: 1px solid #b8733380; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(184,115,51,0.05);",
                header: "background: linear-gradient(135deg, #fff6e9, #fffaf5); font-weight: 600; color: #8b4513; padding: 14px; font-family: 'Noto Serif SC', serif; border-bottom: 2px solid #b8733380;",
                cell: "padding: 14px; color: #6b4423; border-top: 1px solid #b8733380; font-family: 'Noto Serif SC', serif;"
            },
            hr: "border: none; border-top: 2px solid #b8733380; margin: 28px 0; box-shadow: 0 2px 8px rgba(184,115,51,0.05);",
            footnote: {
                ref: "color: #b87333; text-decoration: none; font-size: 0.9em; font-style: italic;",
                backref: "color: #b87333; text-decoration: none; font-size: 0.9em; font-style: italic;"
            }
        };
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('red-theme-modal');

        // 创建固定的头部区域
        const headerEl = contentEl.createDiv('modal-header');
        headerEl.createEl('h2', { text: this.theme.id ? '编辑主题' : '新建主题' });

        // 创建主题名称输入区域（在头部）
        const nameContainer = headerEl.createDiv('name-container');
        if (!this.existingTheme) {
            new Setting(nameContainer)
                .setName('是否选择参考模板')
                .addToggle(toggle => {
                    toggle.setValue(this.showSampleTemplate)
                        .onChange(value => {
                            this.showSampleTemplate = value;
                            this.themeSelect.style.display = this.showSampleTemplate ? 'block' : 'none';
                        });
                });

            // 添加选择框
            new Setting(nameContainer)
                .setName('选择参考模板')
                .addDropdown(dropdown => {
                    this.themeSelect = dropdown
                        .addOptions(this.getThemeOptions()) // 获取所有主题选项
                        .setValue(this.theme.id)
                        .onChange(value => {
                            const selectedTheme = this.getThemeById(value);
                            if (selectedTheme) {
                                this.theme = { ...selectedTheme, id: '', name: '', description: '', isPreset: false };
                            }
                        })
                        .selectEl;
                    this.themeSelect.style.display = this.showSampleTemplate ? 'block' : 'none'; // 默认隐藏
                });
        }
        // 创建主题名称输入区域（在头部）
        new Setting(nameContainer)
            .setName('主题名称')
            .addText(text => {
                this.nameInput = text
                    .setPlaceholder('请输入主题名称')
                    .setValue(this.theme.name)
                    .onChange(value => {
                        const trimmedValue = value.trim();
                        this.theme.name = trimmedValue;

                        if (!trimmedValue) {
                            new Notice('主题名称不能为空');
                        }

                        if (!this.theme.id.startsWith('preset-')) {
                            this.theme.id = this.generateThemeId(trimmedValue || '未命名主题');
                        }
                    })
                    .inputEl;

                setTimeout(() => this.nameInput.focus(), 0);
                return text;
            });
        new Setting(nameContainer)
            .setName('主题描述')
            .addText(text => {
                text.setPlaceholder('请输入主题描述')
                    .setValue(this.theme.description)
                    .onChange(value => {
                        const trimmedValue = value.trim();
                        this.theme.description = trimmedValue;
                    });
                return text;
            });
        // 创建可滚动的内容区域
        const scrollContainer = contentEl.createDiv('modal-scroll-container');
        const settingContainer = scrollContainer.createDiv('setting-container');

        // 添加样式设置
        this.addStyleSettings(settingContainer, '全局样式', this.theme.styles);
        this.addStyleSettings(settingContainer, '背景样式', this.theme.styles.imagePreview);
        this.addStyleSettings(settingContainer, '页眉样式', this.theme.styles.header);
        this.addStyleSettings(settingContainer, '页脚样式', this.theme.styles.footer);
        this.addStyleSettings(settingContainer, '标题样式', this.theme.styles.title);
        this.addStyleSettings(settingContainer, '段落样式', this.theme.styles);
        this.addStyleSettings(settingContainer, '列表样式', this.theme.styles.list);
        this.addStyleSettings(settingContainer, '引用样式', this.theme.styles);
        this.addStyleSettings(settingContainer, '代码样式', this.theme.styles.code);
        this.addStyleSettings(settingContainer, '链接样式', this.theme.styles);
        this.addStyleSettings(settingContainer, '表格样式', this.theme.styles.table);
        this.addStyleSettings(settingContainer, '分隔线样式', this.theme.styles);
        this.addStyleSettings(settingContainer, '脚注样式', this.theme.styles.footnote);
        this.addStyleSettings(settingContainer, '图片样式', this.theme.styles);

        // 保存和取消按钮
        const buttonContainer = contentEl.createDiv('modal-button-container');
        new Setting(buttonContainer)
            .addButton(btn => btn
                .setButtonText('预览')
                .onClick(() => {
                    // 打开预览模式
                    const previewModal = new ThemePreviewModal(this.app, this.plugin.settingsManager, this.theme, this.plugin.themeManager);
                    previewModal.open();
                }))
            .addButton(btn => btn
                .setButtonText('取消')
                .onClick(() => this.close()))
            .addButton(btn => btn
                .setButtonText('保存')
                .setCta()
                .onClick(async () => {
                    if (await this.validateAndSubmit()) {
                        this.close();
                    }
                }));

        this.nameInput.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (await this.validateAndSubmit()) {
                    this.close();
                }
            }
        });
    }

    private getThemeOptions(): Record<string, string> {
        const themes = this.plugin.settingsManager.getAllThemes();
        const options: Record<string, string> = {};
        themes.forEach(theme => {
            options[theme.id] = theme.name;
        });
        return options;
    }

    private getThemeById(id: string): Theme | undefined {
        return this.plugin.settingsManager.getAllThemes().find(theme => theme.id === id);
    }

    private addStyleSettings(container: HTMLElement, sectionName: string, styles: any) {
        const section = container.createDiv('style-section');

        // 创建折叠面板标题区域
        const header = section.createDiv('style-section-header');
        const titleContainer = header.createDiv('style-section-title');
        const toggle = titleContainer.createSpan('style-section-toggle');
        setIcon(toggle, 'chevron-right');
        titleContainer.createEl('h3', { text: sectionName });

        // 添加恢复默认按钮
        const resetButton = header.createDiv('style-section-reset');
        const resetIcon = resetButton.createSpan('clickable-icon');
        setIcon(resetIcon, 'reset');
        resetButton.addEventListener('click', (e) => {
            e.stopPropagation();  // 防止触发折叠面板
            const defaultStyles = this.initializeStyles();

            // 更新 this.theme.styles
            switch (sectionName) {
                case '全局样式':
                    this.theme.styles = defaultStyles;
                    styles = defaultStyles;
                    break;
                case '背景样式':
                    this.theme.styles.imagePreview = defaultStyles.imagePreview;
                    styles = defaultStyles.imagePreview;
                    break;
                case '页眉样式':
                    this.theme.styles.header = defaultStyles.header;
                    styles = defaultStyles.header;
                    break;
                case '页脚样式':
                    this.theme.styles.footer = defaultStyles.footer;
                    styles = defaultStyles.footer;
                    break;
                case '标题样式':
                    this.theme.styles.title = defaultStyles.title;
                    styles = defaultStyles.title;
                    break;
                case '段落样式':
                    this.theme.styles.paragraph = defaultStyles.paragraph;
                    this.theme.styles.emphasis = defaultStyles.emphasis;
                    styles = { paragraph: defaultStyles.paragraph, emphasis: defaultStyles.emphasis };
                    break;
                case '列表样式':
                    this.theme.styles.list = defaultStyles.list;
                    styles = defaultStyles.list;
                    break;
                case '引用样式':
                    this.theme.styles.quote = defaultStyles.quote;
                    styles = { quote: defaultStyles.quote };
                    break;
                case '代码样式':
                    this.theme.styles.code = defaultStyles.code;
                    styles = defaultStyles.code;
                    break;
                case '链接样式':
                    this.theme.styles.link = defaultStyles.link;
                    styles = { link: defaultStyles.link };
                    break;
                case '表格样式':
                    this.theme.styles.table = defaultStyles.table;
                    styles = defaultStyles.table;
                    break;
                case '分隔线样式':
                    this.theme.styles.hr = defaultStyles.hr;
                    styles = { hr: defaultStyles.hr };
                    break;
                case '脚注样式':
                    this.theme.styles.footnote = defaultStyles.footnote;
                    styles = defaultStyles.footnote;
                    break;
                case '图片样式':
                    this.theme.styles.image = defaultStyles.image;
                    styles = { image: defaultStyles.image };
                    break;
            }

            // 重新渲染设置项
            content.empty();
            this.addStyleSettingsContent(content, sectionName, styles);
        });

        // 创建内容区域
        const content = section.createDiv('style-section-content');
        this.addStyleSettingsContent(content, sectionName, styles);

        // 折叠面板点击事件
        header.addEventListener('click', () => {
            const isExpanded = !section.hasClass('is-expanded');
            section.toggleClass('is-expanded', isExpanded);
            setIcon(toggle, isExpanded ? 'chevron-down' : 'chevron-right');
        });
    }

    // 新增方法，用于处理设置内容
    private addStyleSettingsContent(content: HTMLElement, sectionName: string, styles: any) {
        switch (sectionName) {
            case '全局样式':
                this.addGlobalStylesSettings(content, styles);
                break;
            case '背景样式':
                this.addBackGroupStylesSettings(content, styles);
                break;
            case '页眉样式':
                this.addHeaderSettings(content, styles);
                break;
            case '页脚样式':
                this.addFooterSettings(content, styles);
                break;
            case '标题样式':
                this.addTitleSettings(content, styles);
                break;
            case '段落样式':
                this.addParagraphAndEmphasisSettings(content, styles);
                break;
            case '列表样式':
                this.addListSettings(content, styles);
                break;
            case '引用样式':
                this.addQuoteSettings(content, styles);
                break;
            case '代码样式':
                this.addCodeSettings(content, styles);
                break;
            case '链接样式':
                this.addLinkSettings(content, styles);
                break;
            case '表格样式':
                this.addTableSettings(content, styles);
                break;
            case '分隔线样式':
                this.addHrSettings(content, styles);
                break;
            case '脚注样式':
                this.addFootnoteSettings(content, styles);
                break;
            case '图片样式':
                this.addImageSettings(content, styles);
                break;
        }
    }

    private async validateAndSubmit(): Promise<boolean> {
        const trimmedName = this.theme.name.trim();
        if (!trimmedName) {
            new Notice('主题名称不能为空');
            this.nameInput.focus();
            return false;
        }

        // 检查是否选择了样本模板
        if (this.showSampleTemplate && !this.themeSelect.value) {
            new Notice('请选择一个参考模板');
            this.themeSelect.focus();
            return false;
        }

        try {
            await this.onSubmit(this.theme);
            return true;
        } catch (error) {
            new Notice('保存失败：' + error.message, 3000);
            return false;
        }
    }

    private generateThemeId(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Date.now().toString(36).slice(-4);
    }

    private addGlobalStylesSettings(container: HTMLElement, styles: any) {
        const section = container.createDiv('global-style-section');

        new Setting(section)
            .setName('全局主题色')
            .setDesc('修改此颜色将更新所有文字相关的颜色')
            .addColorPicker(color => {
                const defaultColor = styles.title.h2.content.match(/color:\s*(#[a-fA-F0-9]+)/)?.[1] || '#8b4513';
                color.setValue(defaultColor)
                    .onChange(value => {

                        styles.header.userName = styles.header.userName.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                        styles.header.userId = styles.header.userId.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}BB`);
                        styles.header.postTime = styles.header.postTime.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}99`);
                        styles.header.verifiedIcon = styles.header.verifiedIcon
                            .replace(/background:\s*linear-gradient\([^)]+\)/, `background: linear-gradient(135deg, ${value}, ${value})`)
                            .replace(/border:\s*1px\s*solid\s*#[a-fA-F0-9]+80/, `border: 1px solid ${value}80`)
                            .replace(/box-shadow:\s*[^;]+;/, `box-shadow: 0 2px 8px ${value}1a;`);
                        styles.footer.container = styles.footer.container.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}CC`);
                        styles.footer.container = styles.footer.container.replace(/border-top:\s*1px solid\s*#[a-fA-F0-9]+/, `border-top: 1px solid ${value}40`);
                        styles.footer.container = styles.footer.container.replace(/background:\s*[^;]+/, `background: linear-gradient(to top, ${value}08, transparent)`);

                        // 更新段落颜色
                        styles.paragraph = styles.paragraph.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);

                        // 更新强调文字颜色
                        Object.keys(styles.emphasis).forEach(key => {
                            styles.emphasis[key] = styles.emphasis[key].replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                        });

                        // 更新标题颜色
                        ['h2', 'h3', 'base'].forEach(level => {
                            styles.title[level].content = styles.title[level].content.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                        });

                        // 更新列表颜色
                        ['container', 'item', 'taskList'].forEach(key => {
                            styles.list[key] = styles.list[key].replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                        });

                        // 更新引用颜色
                        styles.quote = styles.quote.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);

                        // 更新代码颜色
                        ['block', 'inline'].forEach(key => {
                            styles.code[key] = styles.code[key].replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                        });

                        // 更新链接颜色
                        styles.link = styles.link.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`)
                            .replace(/linear-gradient\([^)]+\)/, `linear-gradient(to right, ${value}80, ${value}80)`);

                        // 更新表格颜色
                        styles.table.header = styles.table.header.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                        styles.table.cell = styles.table.cell.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);

                        // 更新脚注颜色
                        ['ref', 'backref'].forEach(key => {
                            styles.footnote[key] = styles.footnote[key].replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                        });
                        styles.image = styles.image.replace(/border:\s*1px solid\s*#[a-fA-F0-9]+80/, `border: 1px solid ${value}80`);

                    });
            });
    }


    private addBackGroupStylesSettings(container: HTMLElement, styles: string) {
        const titleSection = container.createDiv('title-level-section');
        // 解析现有的样式字符串
        const styleMap = new Map();
        if (styles) {
            styles.split(';').forEach(style => {
                const [property, value] = style.split(':').map(s => s.trim());
                if (property && value) {
                    styleMap.set(property, value);
                }
            });
        }

        // 背景颜色设置
        new Setting(titleSection)
            .setName('背景颜色')
            .setDesc('设置内容区域的背景颜色，建议使用浅色以保证文字清晰可见')
            .addColorPicker(color => {
                // 获取当前背景颜色值
                const currentBg = styleMap.get('background-color') || '#fffaf5';
                color.setValue(currentBg)
                    .onChange(value => {
                        // 更新样式映射
                        styleMap.set('background-color', value);

                        // 重新构建样式字符串
                        this.theme.styles.imagePreview = Array.from(styleMap.entries())
                            .map(([prop, val]) => `${prop}: ${val}`)
                            .join('; ') + ';';
                    });
            });

        // 自定义CSS
        new Setting(titleSection)
            .setName('自定义样式')
            .setDesc('可以添加自定义的CSS样式，如内边距、边框等。例如：padding: 32px 28px; border: 1px solid #ccc;')
            .addTextArea(text => {
                const customStyles = Array.from(styleMap.entries())
                    .filter(([prop]) => prop !== 'background-color') // 排除背景色设置
                    .map(([prop, val]) => `${prop}: ${val}`)
                    .join('; ');

                text.setPlaceholder('在此输入自定义CSS样式')
                    .setValue(customStyles)
                    .onChange(value => {
                        // 清除除背景色外的所有样式
                        Array.from(styleMap.keys()).forEach(key => {
                            if (key !== 'background-color') {
                                styleMap.delete(key);
                            }
                        });

                        // 解析并添加新的样式
                        value.split(';').forEach(style => {
                            const [property, value] = style.split(':').map(s => s.trim());
                            if (property && value) {
                                styleMap.set(property, value);
                            }
                        });

                        // 重新构建样式字符串
                        this.theme.styles.imagePreview = Array.from(styleMap.entries())
                            .map(([prop, val]) => `${prop}: ${val}`)
                            .join('; ') + ';';
                    });

                // 设置文本区域的样式
                text.inputEl.addClass('custom-css-input');
                text.inputEl.rows = 4;
                return text;
            });
    }

    private addHeaderSettings(container: HTMLElement, styles: any) {
        const headerSection = container.createDiv('header-section');
        new Setting(headerSection)
            .setName('页眉主色调')
            .setDesc('设置页眉区域的主要颜色，包括用户名、ID和发布时间等元素')
            .addColorPicker(color => {
                const currentColor = styles.userName.match(/color:\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentColor)
                    .onChange(value => {
                        ['userName', 'userId', 'postTime'].forEach(key => {
                            styles[key] = styles[key].replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                        });
                        styles.avatar.container = styles.avatar.container
                            .replace(/box-shadow:\s*0\s*4px\s*16px\s*[^;]+/, `box-shadow: 0 4px 16px ${value}1a`)
                            .replace(/border:\s*1px solid\s*#[a-fA-F0-9]+80/, `border: 1px solid ${value}80`);
                    });
            });
        
        // 添加头像圆角设置
        new Setting(headerSection)
            .setName('头像圆角')
            .setDesc('设置头像的圆角大小（单位：px）。设置为-1表示圆形，大于1则有圆角')
            .addText(text => {
                // 获取当前圆角值
                const currentRadius = styles.avatar.container.match(/border-radius:\s*([\d-]+)px/)?.[1] || '12';
                text.setValue(currentRadius)
                    .setPlaceholder('输入圆角大小')
                    .onChange(value => {
                        // 解析输入值
                        let radius: string;
                        if (value === '-1') {
                            // 设置为圆形（50%）
                            radius = '50%';
                        } else {
                            // 设置为具体的像素值
                            const pixelValue = parseInt(value) || 12;
                            radius = `${pixelValue}px`;
                        }
                        
                        // 更新样式
                        styles.avatar.container = styles.avatar.container
                            .replace(/border-radius:\s*[^;]+/, `border-radius: ${radius}`);
                    });
            });
            
        new Setting(headerSection)
            .setName('认证图标颜色')
            .setDesc('设置认证图标的颜色')
            .addColorPicker(color => {
                const currentColor = styles.verifiedIcon.match(/fill:\s*(#[a-fA-F0-9]+)/)?.[1] || '#1DA1F2';
                color.setValue(currentColor)
                    .onChange(value => {
                        styles.verifiedIcon = styles.verifiedIcon
                            .replace(/fill:\s*[^;]+/, `fill: ${value}`);
                        if (!styles.verifiedIcon.includes('fill:')) {
                            styles.verifiedIcon += `; fill: ${value}`;
                        }
                    });
            });
        new Setting(headerSection)
            .setName('认证图标尺寸')
            .setDesc('设置认证图标的宽度和高度（单位：px）')
            .addText(text => {
                text.setValue('25')
                    .setPlaceholder('输入图标尺寸')
                    .onChange(value => {
                        const size = value + 'px';
                        styles.verifiedIcon = styles.verifiedIcon
                            .replace(/width:\s*[^;]+/, `width: ${size}`)
                            .replace(/height:\s*[^;]+/, `height: ${size}`);
                    });
            });

        new Setting(headerSection)
            .setName('认证图标间距')
            .setDesc('设置认证图标的左边距（单位：px）')
            .addText(text => {
                text.setValue('-5')
                    .setPlaceholder('输入左边距')
                    .onChange(value => {
                        const margin = value + 'px';
                        styles.verifiedIcon = styles.verifiedIcon
                            .replace(/margin-left:\s*[^;]+/, `margin-left: ${margin}`);
                    });
            });
    }

    private addTitleSettings(container: HTMLElement, styles: any) {
        ['h2', 'h3', 'base'].forEach(level => {
            const titleSection = container.createDiv('style-section');

            // 创建折叠面板标题区域
            const header = titleSection.createDiv('style-section-header');
            const titleContainer = header.createDiv('style-section-title');
            const toggle = titleContainer.createSpan('style-section-toggle');
            setIcon(toggle, 'chevron-right');
            titleContainer.createEl('h4', { text: level === 'base' ? '其他标题样式' : `${level.toUpperCase()} 标题样式` });

            // 创建内容区域
            const content = titleSection.createDiv('style-section-content');
            content.style.display = 'none'; // 初始状态为折叠

            header.addEventListener('click', () => {
                const isExpanded = content.style.display === 'none';
                content.style.display = isExpanded ? 'block' : 'none';
                setIcon(toggle, isExpanded ? 'chevron-down' : 'chevron-right');
            });

            new Setting(content)
                .setName('字体大小')
                .setDesc('设置标题的字体大小（单位：em，相对于基础字号的倍数）')
                .addText(text => {
                    const currentSize = styles[level].base.match(/font-size:\s*([\d.]+)em/)?.[1];
                    text.setValue(currentSize)
                        .onChange(value => {
                            const size = parseFloat(value) || 1.15;
                            styles[level].base = styles[level].base.replace(/font-size:\s*[\d.]+em/, `font-size: ${size}em`);
                        });
                });

            new Setting(content)
                .setName('文本颜色')
                .setDesc('设置标题文字的颜色')
                .addColorPicker(color => {
                    const currentColor = styles[level].content.match(/color:\s*(#[a-fA-F0-9]+)/)?.[1];
                    color.setValue(currentColor)
                        .onChange(value => {
                            styles[level].content = styles[level].content.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                        });
                });
        });
    }

    private addFooterSettings(container: HTMLElement, styles: any) {
        const footerSection = container.createDiv('footer-section');

        new Setting(footerSection)
            .setName('页脚颜色')
            .setDesc('设置页脚区域的文字颜色，包括分隔线颜色')
            .addColorPicker(color => {
                const currentColor = styles.container.match(/color:\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentColor)
                    .onChange(value => {
                        styles.container = styles.container.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`)
                            .replace(/border-top:\s*1px solid\s*#[a-fA-F0-9]+80/, `border-top: 1px solid ${value}80`);
                        styles.text = `color: inherit; transition: color 0.2s ease; font-style: italic; white-space: nowrap;`;
                        styles.separator = `color: inherit;`;
                    });

            });

        // 页脚背景设置
        new Setting(footerSection)
            .setName('页脚背景')
            .setDesc('设置页脚区域的背景颜色和透明度')
            .addColorPicker(color => { // 使用颜色选择器
                const currentBg = styles.container.match(/background:\s*([^;]+)/)?.[1];
                color.setValue(currentBg)
                    .onChange(value => {
                        styles.container = styles.container.replace(/background:\s*[^;]+/, `background: ${value}`);
                    });
            });
        // 新增：页脚上下内边距设置（只改第一个值，第二个值保持原样）
        new Setting(footerSection)
            .setName('上下内边距')
            .setDesc('设置页脚区域的上下内边距（单位：px）')
            .addText(text => {
                // 解析当前padding
                let match = styles.container.match(/padding:\s*(\d+)px\s*(\d+)px/);
                let paddingTop = '16', paddingLR = '16';
                if (match) {
                    paddingTop = match[1];
                    paddingLR = match[2];
                } else {
                    // 兼容只有一个值的情况
                    let single = styles.container.match(/padding:\s*(\d+)px/);
                    if (single) {
                        paddingTop = single[1];
                        paddingLR = single[1];
                    }
                }
                text.setValue(paddingTop)
                    .onChange(value => {
                        const v = parseInt(value) || 16;
                        // 只替换第一个值，第二个值保持原样
                        if (styles.container.match(/padding:\s*\d+px\s*\d+px/)) {
                            styles.container = styles.container.replace(/padding:\s*\d+px\s*\d+px/, `padding: ${v}px ${paddingLR}px`);
                        } else if (styles.container.match(/padding:\s*\d+px/)) {
                            styles.container = styles.container.replace(/padding:\s*\d+px/, `padding: ${v}px ${paddingLR}px`);
                        } else {
                            styles.container += ` padding: ${v}px ${paddingLR}px;`;
                        }
                    });
            });
    }

    private addParagraphAndEmphasisSettings(container: HTMLElement, styles: any) {
        const paragraphSection = container.createDiv('style-section'); // 修改为 style-section

        // 创建折叠面板标题区域
        const paragraphHeader = paragraphSection.createDiv('style-section-header');
        const paragraphTitleContainer = paragraphHeader.createDiv('style-section-title');
        const paragraphToggle = paragraphTitleContainer.createSpan('style-section-toggle');
        setIcon(paragraphToggle, 'chevron-right');
        paragraphTitleContainer.createEl('h4', { text: '段落样式' });

        // 创建内容区域
        const paragraphContent = paragraphSection.createDiv('style-section-content');
        paragraphContent.style.display = 'none'; // 初始状态为折叠

        paragraphHeader.addEventListener('click', () => {
            const isExpanded = paragraphContent.style.display === 'none';
            paragraphContent.style.display = isExpanded ? 'block' : 'none';
            setIcon(paragraphToggle, isExpanded ? 'chevron-down' : 'chevron-right');
        });

        new Setting(paragraphContent)
            .setName('下边距')
            .setDesc('设置段落与下方内容之间的间距（单位：em）')
            .addText(text => {
                const currentMargin = styles.paragraph.match(/margin-bottom:\s*([\d.]+)em/)?.[1];
                text.setValue(currentMargin)
                    .onChange(value => {
                        const margin = parseFloat(value) || 1.1;
                        styles.paragraph = styles.paragraph.replace(/margin-bottom:\s*[\d.]+em/, `margin-bottom: ${margin}em`);
                    });
            });

        new Setting(paragraphContent)
            .setName('字体大小')
            .setDesc('设置段落文本的字体大小（单位：像素）')
            .addText(text => {
                const currentSize = styles.paragraph.match(/font-size:\s*(\d+)px/)?.[1];
                text.setValue(currentSize)
                    .onChange(value => {
                        const size = parseInt(value) || 15;
                        styles.paragraph = styles.paragraph.replace(/font-size:\s*\d+px/, `font-size: ${size}px`);
                    });
            });

        new Setting(paragraphContent)
            .setName('文本颜色')
            .setDesc('设置段落文本的颜色')
            .addColorPicker(color => {
                const currentColor = styles.paragraph.match(/color:\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentColor)
                    .onChange(value => {
                        styles.paragraph = styles.paragraph.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                    });
            });

        const emphasisSection = container.createDiv('style-section'); // 修改为 style-section

        // 创建折叠面板标题区域
        const emphasisHeader = emphasisSection.createDiv('style-section-header');
        const emphasisTitleContainer = emphasisHeader.createDiv('style-section-title');
        const emphasisToggle = emphasisTitleContainer.createSpan('style-section-toggle');
        setIcon(emphasisToggle, 'chevron-right');
        emphasisTitleContainer.createEl('h4', { text: '强调样式' });

        // 创建内容区域
        const emphasisContent = emphasisSection.createDiv('style-section-content');
        emphasisContent.style.display = 'none'; // 初始状态为折叠

        emphasisHeader.addEventListener('click', () => {
            const isExpanded = emphasisContent.style.display === 'none';
            emphasisContent.style.display = isExpanded ? 'block' : 'none';
            setIcon(emphasisToggle, isExpanded ? 'chevron-down' : 'chevron-right');
        });

        new Setting(emphasisContent)
            .setName('粗体样式')
            .setDesc('设置粗体文本的样式')
            .addColorPicker(color => {
                const currentColor = styles.emphasis.strong.match(/color:\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentColor)
                    .onChange(value => {
                        styles.emphasis.strong = styles.emphasis.strong.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                    });
            });

        // 斜体设置
        new Setting(emphasisContent)
            .setName('斜体样式')
            .setDesc('设置斜体文本的样式')
            .addColorPicker(color => {
                const currentColor = styles.emphasis.em.match(/color:\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentColor)
                    .onChange(value => {
                        styles.emphasis.em = styles.emphasis.em.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                    });
            });

        // 删除线设置
        new Setting(emphasisContent)
            .setName('删除线样式')
            .setDesc('设置删除线文本的样式')
            .addColorPicker(color => {
                const currentColor = styles.emphasis.del.match(/color:\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentColor)
                    .onChange(value => {
                        styles.emphasis.del = styles.emphasis.del.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                    });
            });
    }

    private addListSettings(container: HTMLElement, styles: any) {
        const listSection = container.createDiv('list-section');

        new Setting(listSection)
            .setName('列表缩进')
            .setDesc('设置列表的左侧缩进（单位：像素）')
            .addText(text => {
                const currentPadding = styles.container.match(/padding-left:\s*(\d+)px/)?.[1];
                text.setValue(currentPadding)
                    .onChange(value => {
                        const padding = parseInt(value) || 26;
                        styles.container = styles.container.replace(/padding-left:\s*\d+px/, `padding-left: ${padding}px`);
                    });
            });

        new Setting(listSection)
            .setName('列表项间距')
            .setDesc('设置列表项之间的间距（单位：em）')
            .addText(text => {
                const currentMargin = styles.item.match(/margin-bottom:\s*([\d.]+)em/)?.[1];
                text.setValue(currentMargin)
                    .onChange(value => {
                        const margin = parseFloat(value) || 0.8;
                        styles.item = styles.item.replace(/margin-bottom:\s*[\d.]+em/, `margin-bottom: ${margin}em`);
                    });
            });

        new Setting(listSection)
            .setName('列表文本颜色')
            .setDesc('设置列表文本的颜色')
            .addColorPicker(color => {
                const currentColor = styles.item.match(/color:\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentColor)
                    .onChange(value => {
                        ['container', 'item', 'taskList'].forEach(key => {
                            styles[key] = styles[key].replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                        });
                    });
            });
    }

    private addQuoteSettings(container: HTMLElement, styles: any) {
        const quoteSection = container.createDiv('quote-section');

        new Setting(quoteSection)
            .setName('引用边框颜色')
            .setDesc('设置引用块左侧边框的颜色')
            .addColorPicker(color => {
                const currentColor = styles.quote.match(/border-left:\s*\d+px\s*solid\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentColor)
                    .onChange(value => {
                        styles.quote = styles.quote.replace(/border-left:\s*\d+px\s*solid\s*#[a-fA-F0-9]+/, `border-left: 3px solid ${value}`);

                        // 如果有渐变背景，也更新背景色
                        if (styles.quote.includes('linear-gradient')) {
                            styles.quote = styles.quote.replace(/rgba\([^)]+\)/, `rgba(${parseInt(value.slice(1, 3), 16)},${parseInt(value.slice(3, 5), 16)},${parseInt(value.slice(5, 7), 16)},0.1)`);
                        }
                    });
            });

        new Setting(quoteSection)
            .setName('引用文本颜色')
            .setDesc('设置引用块内文本的颜色')
            .addColorPicker(color => {
                const currentColor = styles.quote.match(/color:\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentColor)
                    .onChange(value => {
                        styles.quote = styles.quote.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                    });
            });

        new Setting(quoteSection)
            .setName('左侧内边距')
            .setDesc('设置引用块内容与左侧边框之间的距离（单位：像素）')
            .addText(text => {
                const currentPadding = styles.quote.match(/padding:\s*0\s*0\s*0\s*(\d+)px/)?.[1];
                text.setValue(currentPadding)
                    .onChange(value => {
                        const padding = parseInt(value) || 20;
                        styles.quote = styles.quote.replace(/padding:\s*0\s*0\s*0\s*\d+px/, `padding: 0 0 0 ${padding}px`);
                    });
            });
    }

    private addCodeSettings(container: HTMLElement, styles: any) {
        // 代码块设置
        const codeBlockSection = container.createDiv('style-section'); // 修改为 style-section

        // 创建折叠面板标题区域
        const codeBlockHeader = codeBlockSection.createDiv('style-section-header');
        const codeBlockTitleContainer = codeBlockHeader.createDiv('style-section-title');
        const codeBlockToggle = codeBlockTitleContainer.createSpan('style-section-toggle');
        setIcon(codeBlockToggle, 'chevron-right');
        codeBlockTitleContainer.createEl('h4', { text: '代码块样式' });

        // 创建内容区域
        const codeBlockContent = codeBlockSection.createDiv('style-section-content');
        codeBlockContent.style.display = 'none'; // 初始状态为折叠

        codeBlockHeader.addEventListener('click', () => {
            const isExpanded = codeBlockContent.style.display === 'none';
            codeBlockContent.style.display = isExpanded ? 'block' : 'none';
            setIcon(codeBlockToggle, isExpanded ? 'chevron-down' : 'chevron-right');
        });

        new Setting(codeBlockContent)
            .setName('文本颜色')
            .setDesc('设置代码块内文本的颜色')
            .addColorPicker(color => {
                const currentColor = styles.block.match(/color:\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentColor)
                    .onChange(value => {
                        styles.block = styles.block.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                    });
            });

        new Setting(codeBlockContent)
            .setName('圆角大小')
            .setDesc('设置代码块的圆角大小（单位：像素）')
            .addText(text => {
                const currentRadius = styles.block.match(/border-radius:\s*(\d+)px/)?.[1];
                text.setValue(currentRadius)
                    .onChange(value => {
                        const radius = parseInt(value) || 8;
                        styles.block = styles.block.replace(/border-radius:\s*\d+px/, `border-radius: ${radius}px`);
                    });
            });

        // 行内代码设置
        const inlineCodeSection = container.createDiv('style-section'); // 修改为 style-section

        // 创建折叠面板标题区域
        const inlineCodeHeader = inlineCodeSection.createDiv('style-section-header');
        const inlineCodeTitleContainer = inlineCodeHeader.createDiv('style-section-title');
        const inlineCodeToggle = inlineCodeTitleContainer.createSpan('style-section-toggle');
        setIcon(inlineCodeToggle, 'chevron-right');
        inlineCodeTitleContainer.createEl('h4', { text: '行内代码样式' });

        // 创建内容区域
        const inlineCodeContent = inlineCodeSection.createDiv('style-section-content');
        inlineCodeContent.style.display = 'none'; // 初始状态为折叠

        inlineCodeHeader.addEventListener('click', () => {
            const isExpanded = inlineCodeContent.style.display === 'none';
            inlineCodeContent.style.display = isExpanded ? 'block' : 'none';
            setIcon(inlineCodeToggle, isExpanded ? 'chevron-down' : 'chevron-right');
        });

        new Setting(inlineCodeContent)
            .setName('背景颜色')
            .setDesc('设置行内代码的背景颜色')
            .addColorPicker(color => {
                const currentBg = styles.inline.match(/background:\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentBg)
                    .onChange(value => {
                        styles.inline = styles.inline.replace(/background:\s*#[a-fA-F0-9]+/, `background: ${value}`);
                    });
            });

        new Setting(inlineCodeContent)
            .setName('文本颜色')
            .setDesc('设置行内代码的文本颜色')
            .addColorPicker(color => {
                const currentColor = styles.inline.match(/color:\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentColor)
                    .onChange(value => {
                        styles.inline = styles.inline.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                    });
            });
    }

    private addLinkSettings(container: HTMLElement, styles: any) {
        const linkSection = container.createDiv('link-section');

        new Setting(linkSection)
            .setName('链接颜色')
            .setDesc('设置链接文本的颜色')
            .addColorPicker(color => {
                const currentColor = styles.link.match(/color:\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentColor)
                    .onChange(value => {
                        styles.link = styles.link.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);

                        // 如果有下划线渐变，也更新下划线颜色
                        if (styles.link.includes('linear-gradient')) {
                            styles.link = styles.link.replace(/linear-gradient\([^)]+\)/, `linear-gradient(to right, ${value}80, ${value}80)`);
                        }
                    });
            });

        new Setting(linkSection)
            .setName('下划线样式')
            .setDesc('选择链接的下划线样式')
            .addDropdown(dropdown => {
                dropdown.addOption('none', '无下划线')
                    .addOption('underline', '实线下划线')
                    .addOption('gradient', '渐变下划线')
                    .setValue(styles.link.includes('text-decoration: none') && !styles.link.includes('background-image') ? 'none' :
                        styles.link.includes('text-decoration: underline') ? 'underline' : 'gradient')
                    .onChange(value => {
                        switch (value) {
                            case 'none':
                                styles.link = styles.link.replace(/text-decoration:[^;]+;/, 'text-decoration: none;')
                                    .replace(/background-image:[^;]+;/, '')
                                    .replace(/background-size:[^;]+;/, '')
                                    .replace(/background-repeat:[^;]+;/, '')
                                    .replace(/background-position:[^;]+;/, '');
                                break;
                            case 'underline':
                                styles.link = styles.link.replace(/text-decoration:[^;]+;/, 'text-decoration: underline;')
                                    .replace(/background-image:[^;]+;/, '')
                                    .replace(/background-size:[^;]+;/, '')
                                    .replace(/background-repeat:[^;]+;/, '')
                                    .replace(/background-position:[^;]+;/, '');
                                break;
                            case 'gradient':
                                const color = styles.link.match(/color:\s*(#[a-fA-F0-9]+)/)?.[1] || '#d2691e';
                                styles.link = styles.link.replace(/text-decoration:[^;]+;/, 'text-decoration: none;')
                                    + ` background-image: linear-gradient(to right, ${color}80, ${color}80); background-size: 0% 1px; background-repeat: no-repeat; background-position: 0 100%; transition: all 0.3s ease;`;
                                break;
                        }
                    });
            });
    }

    private addTableSettings(container: HTMLElement, styles: any) {
        const tableSection = container.createDiv('table-section');

        new Setting(tableSection)
            .setName('表格边框颜色')
            .setDesc('设置表格边框和分隔线的颜色')
            .addColorPicker(color => {
                const currentBorder = styles.container.match(/border:\s*1px\s*solid\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentBorder)
                    .onChange(value => {
                        styles.container = styles.container.replace(/border:\s*1px\s*solid\s*#[a-fA-F0-9]+/, `border: 1px solid ${value}`);
                        styles.header = styles.header.replace(/border-bottom:\s*\d+px\s*solid\s*#[a-fA-F0-9]+/, `border-bottom: 2px solid ${value}`);
                        styles.cell = styles.cell.replace(/border-top:\s*1px\s*solid\s*#[a-fA-F0-9]+/, `border-top: 1px solid ${value}`);
                    });
            });

        new Setting(tableSection)
            .setName('表头背景')
            .setDesc('设置表格头部的背景颜色')
            .addColorPicker(color => {
                const currentBg = styles.header.match(/background:\s*([^;]+)/)?.[1];
                // 如果是渐变色，取第一个颜色
                const firstColor = currentBg.includes('linear-gradient') ?
                    currentBg.match(/linear-gradient\([^,]+,\s*(#[a-fA-F0-9]+)/)?.[1] :
                    currentBg;

                color.setValue(firstColor)
                    .onChange(value => {
                        if (currentBg.includes('linear-gradient')) {
                            styles.header = styles.header.replace(/background:\s*linear-gradient\([^)]+\)/, `background: linear-gradient(135deg, ${value}, #fffaf5)`);
                        } else {
                            styles.header = styles.header.replace(/background:\s*[^;]+/, `background: ${value}`);
                        }
                    });
            });

        new Setting(tableSection)
            .setName('圆角大小')
            .setDesc('设置表格的圆角大小（单位：像素）')
            .addText(text => {
                const currentRadius = styles.container.match(/border-radius:\s*(\d+)px/)?.[1];
                text.setValue(currentRadius)
                    .onChange(value => {
                        const radius = parseInt(value) || 12;
                        styles.container = styles.container.replace(/border-radius:\s*\d+px/, `border-radius: ${radius}px`);
                    });
            });
    }

    private addHrSettings(container: HTMLElement, styles: any) {
        const hrSection = container.createDiv('hr-section');

        new Setting(hrSection)
            .setName('分隔线颜色')
            .setDesc('设置水平分隔线的颜色')
            .addColorPicker(color => {
                const currentColor = styles.hr.match(/border-top:\s*\d+px\s*solid\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentColor)
                    .onChange(value => {
                        styles.hr = styles.hr.replace(/border-top:\s*\d+px\s*solid\s*#[a-fA-F0-9]+/, `border-top: 2px solid ${value}`);
                    });
            });

        new Setting(hrSection)
            .setName('分隔线粗细')
            .setDesc('设置水平分隔线的粗细（单位：像素）')
            .addText(text => {
                const currentWidth = styles.hr.match(/border-top:\s*(\d+)px/)?.[1];
                text.setValue(currentWidth)
                    .onChange(value => {
                        const width = parseInt(value) || 2;
                        styles.hr = styles.hr.replace(/border-top:\s*\d+px/, `border-top: ${width}px`);
                    });
            });

        new Setting(hrSection)
            .setName('上下边距')
            .setDesc('设置分隔线与上下内容的间距（单位：像素）')
            .addText(text => {
                const currentMargin = styles.hr.match(/margin:\s*(\d+)px/)?.[1];
                text.setValue(currentMargin)
                    .onChange(value => {
                        const margin = parseInt(value) || 28;
                        styles.hr = styles.hr.replace(/margin:\s*\d+px/, `margin: ${margin}px`);
                    });
            });
    }

    private addFootnoteSettings(container: HTMLElement, styles: any) {
        const footnoteSection = container.createDiv('footnote-section');

        new Setting(footnoteSection)
            .setName('脚注颜色')
            .setDesc('设置脚注引用和返回链接的颜色')
            .addColorPicker(color => {
                const currentColor = styles.ref.match(/color:\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentColor)
                    .onChange(value => {
                        styles.ref = styles.ref.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                        styles.backref = styles.backref.replace(/color:\s*#[a-fA-F0-9]+/, `color: ${value}`);
                    });
            });

        new Setting(footnoteSection)
            .setName('字体样式')
            .setDesc('选择脚注的字体样式')
            .addDropdown(dropdown => {
                dropdown.addOption('normal', '常规')
                    .addOption('italic', '斜体')
                    .setValue(styles.ref.includes('font-style: italic') ? 'italic' : 'normal')
                    .onChange(value => {
                        const style = value === 'italic' ? 'italic' : 'normal';
                        styles.ref = styles.ref.replace(/font-style:[^;]*;/, `font-style: ${style};`);
                        styles.backref = styles.backref.replace(/font-style:[^;]*;/, `font-style: ${style};`);
                    });
            });
    }

    private addImageSettings(container: HTMLElement, styles: any) {
        const imageSection = container.createDiv('image-section');

        new Setting(imageSection)
            .setName('最大宽度')
            .setDesc('设置图片的最大显示宽度（支持百分比或像素值，例如：100% 或 800px）')
            .addText(text => {
                const currentWidth = styles.image.match(/max-width:\s*([^;]+)/)?.[1];
                text.setValue(currentWidth)
                    .onChange(value => {
                        // 验证输入值是否为有效的宽度值
                        const isValid = /^\d+(%|px)$/.test(value.trim());
                        const width = isValid ? value.trim() : '100%';
                        styles.image = styles.image.replace(/max-width:\s*[^;]+/, `max-width: ${width}`);
                    });
            });

        new Setting(imageSection)
            .setName('边距')
            .setDesc('设置图片与上下文本的间距（单位：em）')
            .addText(text => {
                const currentMargin = styles.image.match(/margin:\s*([\d.]+)em/)?.[1];
                text.setValue(currentMargin)
                    .onChange(value => {
                        const margin = parseFloat(value) || 1.5;
                        styles.image = styles.image.replace(/margin:\s*[\d.]+em/, `margin: ${margin}em`);
                    });
            });

        new Setting(imageSection)
            .setName('圆角大小')
            .setDesc('设置图片的圆角程度（单位：像素）')
            .addText(text => {
                const currentRadius = styles.image.match(/border-radius:\s*(\d+)px/)?.[1];
                text.setValue(currentRadius)
                    .onChange(value => {
                        const radius = parseInt(value) || 8;
                        styles.image = styles.image.replace(/border-radius:\s*\d+px/, `border-radius: ${radius}px`);
                    });
            });

        new Setting(imageSection)
            .setName('边框颜色')
            .setDesc('设置图片边框的颜色')
            .addColorPicker(color => {
                const currentColor = styles.image.match(/border:\s*1px solid\s*(#[a-fA-F0-9]+)/)?.[1];
                color.setValue(currentColor)
                    .onChange(value => {
                        styles.image = styles.image.replace(/border:\s*1px solid\s*#[a-fA-F0-9]+80/, `border: 1px solid ${value}80`);
                    });
            });
    }
}