import { App } from 'obsidian';
import { SettingsManager } from './settings/settings';

export interface Theme {
    id: string;
    name: string;
    description: string;
    isPreset?: boolean;  // 添加预设主题标识
    isVisible?: boolean; // 控制主题是否显示
    styles: {
        // 容器基础样式
        imagePreview: string;
        // 页眉样式组
        header: {
            avatar: {
                container: string;
                placeholder: string;
                image: string;
            };
            nameContainer: string;
            userName: string;
            userId: string;
            postTime: string;
            verifiedIcon: string;
        };
        // 页脚样式组
        footer: {
            container: string;
            text: string;
            separator: string;
        };
        title: {
            h1: {
                base: string;
                content: string;
                after: string;
            };
            h2: {
                base: string;
                content: string;
                after: string;
            };
            h3: {
                base: string;
                content: string;
                after: string;
            };
            base: {
                base: string;
                content: string;
                after: string;
            };
        };
        paragraph: string;
        list: {
            container: string;
            item: string;
            taskList: string;
        };
        quote: string;
        code: {
            block: string;
            inline: string;
        };
        image: string;
        link: string;
        emphasis: {
            strong: string;
            em: string;
            del: string;
        };
        table: {
            container: string;
            header: string;
            cell: string;
        };
        hr: string;
        footnote: {
            ref: string;
            backref: string;
        };
    };
}

export class ThemeManager {
    private currentTheme: Theme;
    private currentFont: string = '-apple-system';
    private currentFontSize: number = 16;
    private app: App;
    private settingsManager: SettingsManager;

    constructor(app: App, settingsManager: SettingsManager) {
        this.app = app;
        this.settingsManager = settingsManager;
    }

    public setCurrentTheme(id: string): boolean {
        const theme = this.settingsManager.getTheme(id);
        if (theme) {
            this.currentTheme = theme;
            return true;
        }
        console.error('主题未找到:', id);
        return false;
    }

    // 修改 applyTheme 方法
    public applyTheme(element: HTMLElement, theme?: Theme): void {
        const styles = theme ? theme.styles : this.currentTheme.styles; // 修改为从参数 theme 获取样式
        // 修改应用基础样式的方式
        const imagePreview = element.querySelector('.red-image-preview') as HTMLElement;
        if (imagePreview) {
            const styleProperties = styles.imagePreview.split(';');
            styleProperties.forEach(property => {
                const [key, value] = property.split(':').map(item => item.trim());
                if (key && value) {
                    imagePreview.style[key as any] = value; // 使用 as any 绕过 TypeScript 的类型检查
                }
            });
        }

        // 应用页眉样式
        const header = element.querySelector('.red-preview-header');
        if (header) {
            // 用户头像
            header.querySelectorAll('.red-user-avatar').forEach(el => {
                el.setAttribute('style', styles.header.avatar.container);
            });
            header.querySelectorAll('.red-avatar-placeholder').forEach(el => {
                el.setAttribute('style', styles.header.avatar.placeholder);
            });
            header.querySelectorAll('.red-user-avatar img').forEach(el => {
                el.setAttribute('style', styles.header.avatar.image);
            });

            // 用户名容器
            header.querySelectorAll('.red-user-name-container').forEach(el => {
                el.setAttribute('style', styles.header.nameContainer);
            });

            // 用户名
            header.querySelectorAll('.red-user-name').forEach(el => {
                el.setAttribute('style', styles.header.userName);
            });

            // 用户ID
            header.querySelectorAll('.red-user-id').forEach(el => {
                el.setAttribute('style', styles.header.userId);
            });

            // 发布时间
            header.querySelectorAll('.red-post-time').forEach(el => {
                el.setAttribute('style', styles.header.postTime);
            });

            // 认证图标
            header.querySelectorAll('.red-verified-icon').forEach(el => {
                el.setAttribute('style', styles.header.verifiedIcon);
            });
        }

        // 应用页脚样式
        const footer = element.querySelector('.red-preview-footer');
        if (footer) {
            // 页脚容器
            footer.setAttribute('style', styles.footer.container);

            // 页脚文本
            footer.querySelectorAll('.red-footer-text').forEach(el => {
                el.setAttribute('style', styles.footer.text);
            });

            // 分隔符
            footer.querySelectorAll('.red-footer-separator').forEach(el => {
                el.setAttribute('style', styles.footer.separator);
            });
        }

        // 应用标题样式
        ['h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
            element.querySelectorAll(tag).forEach(el => {
                // 检查是否已经处理过
                if (!el.querySelector('.content')) {
                    const content = document.createElement('span');
                    content.className = 'content';

                    // 将原有内容移动到新的 span 中
                    while (el.firstChild) {
                        content.appendChild(el.firstChild);
                    }

                    el.appendChild(content);

                    const after = document.createElement('span');
                    after.className = 'after';
                    el.appendChild(after);
                }

                // 根据标签选择对应的样式
                const styleKey = (tag === 'h4' || tag === 'h5' || tag === 'h6' ? 'base' : tag) as keyof typeof styles.title;
                const titleStyle = styles.title[styleKey];

                // 应用样式
                el.setAttribute('style', `${titleStyle.base}; font-family: ${this.currentFont};`);
                el.querySelector('.content')?.setAttribute('style', titleStyle.content);
                el.querySelector('.after')?.setAttribute('style', titleStyle.after);
            });
        });

        // 应用段落样式
        element.querySelectorAll('p').forEach(el => {
            if (!el.parentElement?.closest('p') && !el.parentElement?.closest('blockquote')) {
                el.setAttribute('style', `${styles.paragraph}; font-family: ${this.currentFont}; font-size: ${this.currentFontSize}px;`);
            }
        });

        // 应用列表样式
        element.querySelectorAll('ul, ol').forEach(el => {
            el.setAttribute('style', styles.list.container);
        });
        element.querySelectorAll('li').forEach(el => {
            el.setAttribute('style', `${styles.list.item}; font-family: ${this.currentFont}; font-size: ${this.currentFontSize}px;`);
        });
        element.querySelectorAll('.task-list-item').forEach(el => {
            el.setAttribute('style', `${styles.list.taskList}; font-family: ${this.currentFont}; font-size: ${this.currentFontSize}px;`);
        });

        // 应用引用样式
        element.querySelectorAll('blockquote').forEach(el => {
            el.setAttribute('style', `${styles.quote}; font-family: ${this.currentFont}; font-size: ${this.currentFontSize}px;`);
        });

        // 应用代码样式
        element.querySelectorAll('pre').forEach(el => {
            el.setAttribute('style', `${styles.code.block}; font-size: ${this.currentFontSize}px;`);
        });
        element.querySelectorAll('code:not(pre code)').forEach(el => {
            el.setAttribute('style', `${styles.code.inline}; font-size: ${this.currentFontSize}px;`);
        });

        // 应用链接样式
        element.querySelectorAll('a').forEach(el => {
            el.setAttribute('style', styles.link);
        });

        // 应用强调样式
        element.querySelectorAll('strong').forEach(el => {
            el.setAttribute('style', styles.emphasis.strong);
        });
        element.querySelectorAll('em').forEach(el => {
            el.setAttribute('style', styles.emphasis.em);
        });
        element.querySelectorAll('del').forEach(el => {
            el.setAttribute('style', styles.emphasis.del);
        });

        // 应用表格样式（内容表格，非包裹表格）
        element.querySelectorAll('table').forEach(el => {
            el.setAttribute('style', styles.table.container);
        });
        element.querySelectorAll('th').forEach(el => {
            el.setAttribute('style', `${styles.table.header}; font-family: ${this.currentFont}; font-size: ${this.currentFontSize}px;`);
        });
        element.querySelectorAll('td').forEach(el => {
            el.setAttribute('style', `${styles.table.cell}; font-family: ${this.currentFont}; font-size: ${this.currentFontSize}px;`);
        });

        // 应用分割线样式
        element.querySelectorAll('hr').forEach(el => {
            el.setAttribute('style', styles.hr);
        });

        // 应用脚注样式
        element.querySelectorAll('.footnote-ref').forEach(el => {
            el.setAttribute('style', styles.footnote.ref);
        });
        element.querySelectorAll('.footnote-backref').forEach(el => {
            el.setAttribute('style', styles.footnote.backref);
        });

        // 应用图片样式
        element.querySelectorAll('img').forEach(el => {
            el.setAttribute('style', styles.image);
            const parent = el.parentElement;
            if (parent && parent.tagName.toLowerCase() === 'p') {
                if (parent.childNodes.length === 1) {
                    parent.classList.add('red-image-container');
                }
            }
        });
    }

    // 移除不再需要的方法
    public setFont(fontFamily: string) {
        this.currentFont = fontFamily;
    }

    public setFontSize(size: number) {
        this.currentFontSize = size;
    }
}

export const themeManager = (app: App, settingsManager: SettingsManager) => new ThemeManager(app, settingsManager);
