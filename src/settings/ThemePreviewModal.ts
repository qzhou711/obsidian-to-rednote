import { App, Modal } from 'obsidian';
import { ThemeManager } from '../themeManager';
import { SettingsManager } from '../settings/settings';

export class ThemePreviewModal extends Modal {
    private theme: any;
    private themeManager: ThemeManager;
    private settingsManager: SettingsManager;

    constructor(app: App, settingsManager: SettingsManager, theme: any, themeManager: ThemeManager) {
        super(app);
        this.settingsManager = settingsManager;
        this.theme = theme;
        this.themeManager = themeManager;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('theme-preview-modal');

        // 添加标题
        contentEl.createEl('h2', { text: `主题预览: ${this.theme.name}`, cls: 'red-theme-title' });

        // 添加预览区域
        const container = contentEl.createDiv('tp-red-preview-container');
        const previewContainer = container.createDiv('red-image-preview');

        const settings = this.settingsManager.getSettings();

        // 页眉区域
        const header = previewContainer.createDiv('red-preview-header');
        const userInfo = header.createEl('div', { cls: 'red-user-info' });
        const userLeft = userInfo.createEl('div', { cls: 'red-user-left' });
        const avatar = userLeft.createEl('div', { cls: 'red-user-avatar' });
        if (settings.userAvatar) {
            avatar.createEl('img', {
                attr: {
                    src: settings.userAvatar,
                    alt: '用户头像'
                }
            });
        } else {
            const placeholder = avatar.createEl('div', { cls: 'red-avatar-placeholder' });
            placeholder.createEl('span', {
                cls: 'red-avatar-upload-icon',
                text: '📷'
            });
        }
        const userMeta = userLeft.createEl('div', { cls: 'red-user-meta' });
        const userNameContainer = userMeta.createEl('div', { cls: 'red-user-name-container' });
        userNameContainer.createEl('div', { cls: 'red-user-name', text: `${settings.userName}` });
        userNameContainer.createEl('span', {
            cls: 'red-verified-icon',
            attr: {
                'aria-label': 'Verified account',
                role: 'img'
            }
        }).innerHTML = `<svg viewBox="0 0 22 22" class="r-4qtqp9 r-yyyyoo r-1xvli5t r-bnwqim r-lrvibr r-m6rgpd r-1cvl2hr r-f9ja8p r-og9te1 r-3t4u6i"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg>`;
 
        userMeta.createEl('div', { cls: 'red-user-id', text: `${settings.userId}` });
        const userRight = userInfo.createEl('div', { cls: 'red-user-right' });
        userRight.createEl('div', { cls: 'red-post-time', text: '2025/4/20' });

        // 内容区域
        const content = previewContainer.createDiv('red-preview-content');

        // 标题样式
        content.createEl('h2', { text: '探索夜半插件的无限可能' });

        // 段落样式
        const paragraph1 = content.createEl('p');
        paragraph1.createEl('span', { text: '插件提供多种' });
        paragraph1.createEl('strong', { text: '优雅的操作，' });
        paragraph1.createEl('span', { text: '助您轻松发布笔记。' });

        // 列表样式
        const list = content.createEl('ul');
        list.createEl('li', { text: '轻松定制主题样式' });
        list.createEl('li', { text: '实时预览主题效果' });

        // 引用样式
        const quote = content.createEl('blockquote');
        quote.createEl('p', { text: '“让笔记发帖变得如此简单。”' });

        // 代码样式
        const codeBlock = content.createEl('pre');
        codeBlock.classList.add('red-pre'); // 添加样式类
        const dots = codeBlock.createDiv('red-code-dots'); // 添加窗口按钮
        ['red', 'yellow', 'green'].forEach(color => {
            dots.createSpan({ cls: `red-code-dot red-code-dot-${color}` });
        });
        codeBlock.createEl('code', { text: 'console.log("欢迎使用夜半插件！");' });

        // 分隔线样式
        content.createEl('hr');

        content.createEl('strong', { text: '如果您觉得我的插件对您有帮助，请打赏支持我。' });

        // 页脚区域
        const footer = previewContainer.createDiv('red-preview-footer');
        // 页脚内容
        if (footer) {
            // 检查是否显示页脚
            if (settings.showFooter !== false) {
                footer.createEl('div', { cls: 'red-footer-text', text: `${settings.footerLeftText}` });
                footer.createEl('div', { cls: 'red-footer-separator', text: '|' });
                footer.createEl('div', { cls: 'red-footer-text', text: `${settings.footerRightText}` });
            } else {
                // 完全移除页脚元素
                footer.remove();
            }
        }

        this.themeManager.applyTheme(container, this.theme);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}