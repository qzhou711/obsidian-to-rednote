import { ItemView, WorkspaceLeaf, MarkdownRenderer, TFile, Notice, setIcon } from 'obsidian';
import { RedConverter } from './converter';
import { DownloadManager } from './downloadManager';
import type { ThemeManager } from './themeManager';
import { DonateManager } from './donateManager';
import type { SettingsManager } from './settings/settings';
import { ClipboardManager } from './clipboardManager';
import { ImgTemplateManager } from './imgTemplateManager';
import { BackgroundSettingModal } from './modals/BackgroundSettingModal';
import { BackgroundManager } from './backgroundManager';
export const VIEW_TYPE_RED = 'note-to-red';

export class RedView extends ItemView {
    // #region 属性定义
    private previewEl: HTMLElement;
    private currentFile: TFile | null = null;
    private updateTimer: number | null = null;
    private isPreviewLocked: boolean = false;
    private currentImageIndex: number = 0;
    private backgroundManager: BackgroundManager;
    // 添加捐赠提醒相关属性
    private donateCount: number = 0;
    private lastDonatePrompt: number = 0;
    private MAX_COUNT_BEFORE_PROMPT: number = 5; // 每使用5次提醒一次

    // UI 元素
    private lockButton: HTMLButtonElement;
    private copyButton: HTMLButtonElement;
    private customTemplateSelect: HTMLElement;
    private customThemeSelect: HTMLElement;
    private customFontSelect: HTMLElement;
    private fontSizeSelect: HTMLInputElement;
    private navigationButtons: {
        prev: HTMLButtonElement;
        next: HTMLButtonElement;
        indicator: HTMLElement;
    } | undefined;

    // 管理器实例
    private themeManager: ThemeManager;
    private settingsManager: SettingsManager;
    private imgTemplateManager: ImgTemplateManager;
    // #endregion

    // #region 基础视图方法
    constructor(
        leaf: WorkspaceLeaf,
        themeManager: ThemeManager,
        settingsManager: SettingsManager
    ) {
        super(leaf);
        this.themeManager = themeManager;
        this.settingsManager = settingsManager;
        this.backgroundManager = new BackgroundManager();
        this.imgTemplateManager = new ImgTemplateManager(
            this.settingsManager,
            this.updatePreview.bind(this),
            this.themeManager
        );

        // 从设置中恢复捐赠计数和上次提示时间
        const settings = this.settingsManager.getSettings();
        this.donateCount = settings.donateCount || 0;
        this.lastDonatePrompt = settings.lastDonatePrompt || 0;
    }

    getViewType() {
        return VIEW_TYPE_RED;
    }

    getDisplayText() {
        return '小红书预览';
    }

    getIcon() {
        return 'image';
    }
    // #endregion

    // #region 视图初始化
    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.className = 'red-view-content';

        await this.initializeToolbar(container as HTMLElement);
        this.initializePreviewArea(container as HTMLElement);
        this.initializeBottomBar(container as HTMLElement);
        this.initializeEventListeners();

        const currentFile = this.app.workspace.getActiveFile();
        await this.onFileOpen(currentFile);
    }

    private async initializeToolbar(container: HTMLElement) {
        const toolbar = container.createEl('div', { cls: 'red-toolbar' });
        const controlsGroup = toolbar.createEl('div', { cls: 'red-controls-group' });

        await this.initializeLockButton(controlsGroup);
        await this.initializeTemplateSelect(controlsGroup);
        await this.initializeThemeSelect(controlsGroup);
        await this.initializeFontSelect(controlsGroup);
        await this.initializeFontSizeControls(controlsGroup);
        await this.restoreSettings();
    }

    // 添加背景设置按钮初始化方法
    private async initializeBackgroundButton(parent: HTMLElement) {
        const bgButton = parent.createEl('button', {
            cls: 'red-background-button',
            attr: { 'aria-label': '设置背景图片' }
        });
        setIcon(bgButton, 'image');

        bgButton.addEventListener('click', () => {
            const currentSettings = this.settingsManager.getSettings().backgroundSettings;
            new BackgroundSettingModal(
                this.app,
                async (backgroundSettings) => {
                    await this.settingsManager.updateSettings({ backgroundSettings });
                    const imagePreview = this.previewEl.querySelector('.red-image-preview') as HTMLElement;
                    this.backgroundManager.applyBackgroundStyles(
                        imagePreview,
                        backgroundSettings
                    );
                },
                this.previewEl,
                this.backgroundManager,
                currentSettings
            ).open();
        });
    }

    private initializePreviewArea(container: HTMLElement) {
        const wrapper = container.createEl('div', { cls: 'red-preview-wrapper' });
        this.previewEl = wrapper.createEl('div', { cls: 'red-preview-container' });

        // 创建导航容器
        const navContainer = wrapper.createEl('div', { cls: 'red-nav-container' });

        const prevButton = navContainer.createEl('button', {
            cls: 'red-nav-button',
            text: '←'
        });

        const indicator = navContainer.createEl('span', {
            cls: 'red-page-indicator',
            text: '1/1'
        });

        const nextButton = navContainer.createEl('button', {
            cls: 'red-nav-button',
            text: '→'
        });

        this.navigationButtons = { prev: prevButton, next: nextButton, indicator };

        prevButton.addEventListener('click', () => this.navigateImages('prev'));
        nextButton.addEventListener('click', () => this.navigateImages('next'));
    }

    private updateNavigationState() {
        const sections = this.previewEl.querySelectorAll('.red-content-section');
        if (!this.navigationButtons) return;

        sections.forEach((section, i) => {
            (section as HTMLElement).classList.toggle('red-section-active', i === this.currentImageIndex);
        });

        this.navigationButtons.prev.classList.toggle('red-nav-hidden', this.currentImageIndex === 0);
        this.navigationButtons.next.classList.toggle('red-nav-hidden', this.currentImageIndex === sections.length - 1);
        this.navigationButtons.indicator.textContent = `${this.currentImageIndex + 1}/${sections.length}`;
    }

    private navigateImages(direction: 'prev' | 'next') {
        const sections = this.previewEl.querySelectorAll('.red-content-section');
        if (direction === 'prev' && this.currentImageIndex > 0) {
            this.currentImageIndex--;
        } else if (direction === 'next' && this.currentImageIndex < sections.length - 1) {
            this.currentImageIndex++;
        }
        this.updateNavigationState();
    }

    private initializeBottomBar(container: HTMLElement) {
        const bottomBar = container.createEl('div', { cls: 'red-bottom-bar' });
        const bottomControlsGroup = bottomBar.createEl('div', { cls: 'red-controls-group' });

        this.initializeHelpButton(bottomControlsGroup);
        this.initializeBackgroundButton(bottomControlsGroup);
        this.initializeDonateButton(bottomControlsGroup);
        this.initializeExportButtons(bottomControlsGroup);
    }

    private initializeEventListeners() {
        this.registerEvent(
            this.app.workspace.on('file-open', this.onFileOpen.bind(this))
        );
        this.registerEvent(
            this.app.vault.on('modify', this.onFileModify.bind(this))
        );
        this.initializeCopyButtonListener();
    }
    // #endregion

    // #region 控件初始化
    private async initializeLockButton(parent: HTMLElement) {
        this.lockButton = parent.createEl('button', {
            cls: 'red-lock-button',
            attr: { 'aria-label': '关闭实时预览状态' }
        });
        setIcon(this.lockButton, 'lock');
        this.lockButton.addEventListener('click', () => this.togglePreviewLock());
    }

    private async initializeTemplateSelect(parent: HTMLElement) {
        this.customTemplateSelect = this.createCustomSelect(
            parent,
            'red-template-select',
            await this.getTemplateOptions()
        );
        this.customTemplateSelect.id = 'template-select';

        this.customTemplateSelect.querySelector('.red-select')?.addEventListener('change', async (e: any) => {
            const value = e.detail.value;
            this.imgTemplateManager.setCurrentTemplate(value);
            await this.settingsManager.updateSettings({ templateId: value });
            this.imgTemplateManager.applyTemplate(this.previewEl, this.settingsManager.getSettings());
            await this.updatePreview();
        });
    }

    private async initializeThemeSelect(parent: HTMLElement) {
        this.customThemeSelect = this.createCustomSelect(
            parent,
            'red-theme-select',
            await this.getThemeOptions()
        );
        this.customThemeSelect.id = 'theme-select';

        this.customThemeSelect.querySelector('.red-select')?.addEventListener('change', async (e: any) => {
            const value = e.detail.value;
            this.themeManager.setCurrentTheme(value);
            await this.settingsManager.updateSettings({ themeId: value });
            this.themeManager.applyTheme(this.previewEl);
        });
    }

    private async initializeFontSelect(parent: HTMLElement) {
        this.customFontSelect = this.createCustomSelect(
            parent,
            'red-font-select',
            this.getFontOptions()
        );
        this.customFontSelect.id = 'font-select';

        this.customFontSelect.querySelector('.red-select')?.addEventListener('change', async (e: any) => {
            const value = e.detail.value;
            this.themeManager.setFont(value);
            await this.settingsManager.updateSettings({ fontFamily: value });
            this.themeManager.applyTheme(this.previewEl);
            await new Promise(resolve => setTimeout(resolve, 50));
            this.splitOverflowSections();
            this.updateNavigationState();
        });
    }

    private async initializeFontSizeControls(parent: HTMLElement) {
        const fontSizeGroup = parent.createEl('div', { cls: 'red-font-size-group' });

        const decreaseButton = fontSizeGroup.createEl('button', {
            cls: 'red-font-size-btn',
            text: '-'
        });

        this.fontSizeSelect = fontSizeGroup.createEl('input', {
            cls: 'red-font-size-input',
            type: 'text',
            value: '16',
            attr: {
                style: 'border: none; outline: none; background: transparent;'
            }
        });

        const increaseButton = fontSizeGroup.createEl('button', {
            cls: 'red-font-size-btn',
            text: '+'
        });

        const updateFontSize = async () => {
            const size = parseInt(this.fontSizeSelect.value);
            this.themeManager.setFontSize(size);
            await this.settingsManager.updateSettings({ fontSize: size });
            this.themeManager.applyTheme(this.previewEl);
            await new Promise(resolve => setTimeout(resolve, 50));
            this.splitOverflowSections();
            this.updateNavigationState();
        };

        decreaseButton.addEventListener('click', () => {
            const currentSize = parseInt(this.fontSizeSelect.value);
            if (currentSize > 12) {
                this.fontSizeSelect.value = (currentSize - 1).toString();
                updateFontSize();
            }
        });

        increaseButton.addEventListener('click', () => {
            const currentSize = parseInt(this.fontSizeSelect.value);
            if (currentSize < 30) {
                this.fontSizeSelect.value = (currentSize + 1).toString();
                updateFontSize();
            }
        });

        this.fontSizeSelect.addEventListener('change', updateFontSize);
    }

    private initializeHelpButton(parent: HTMLElement) {
        const helpButton = parent.createEl('button', {
            cls: 'red-help-button',
            attr: { 'aria-label': '使用指南' }
        });
        setIcon(helpButton, 'help');
        parent.createEl('div', {
            cls: 'red-help-tooltip',
            text: `使用指南：
                1. 核心用法：用 --- 分割线来分隔内容，每段内容生成一张小红书配图
                2. 首图制作：单独调整首节字号至20-24px，使用【下载当前页】导出
                3. 长文优化：内容较多的章节可调小字号至14-16px后单独导出
                4. 批量操作：保持统一字号时，用【导出全部页】批量生成
                5. 模板切换：顶部选择器可切换不同视觉风格
                6. 实时编辑：解锁状态(🔓)下编辑文档即时预览效果
                7. 支持创作：点击❤️关于作者可进行打赏支持`
        });
    }

    private initializeDonateButton(parent: HTMLElement) {
        const likeButton = parent.createEl('button', { cls: 'red-like-button' });
        likeButton.createEl('span', {
            text: '❤️',
            attr: { style: 'margin-right: 4px' }
        });
        likeButton.createSpan({ text: '关于作者' });
        likeButton.addEventListener('click', () => {
            DonateManager.showDonateModal(this.containerEl);
        });
    }

    private initializeExportButtons(parent: HTMLElement) {
        // 单张下载按钮
        const singleDownloadButton = parent.createEl('button', {
            text: '下载当前页',
            cls: 'red-export-button'
        });

        singleDownloadButton.addEventListener('click', async () => {
            if (this.previewEl) {
                // 检查是否需要显示捐赠弹窗
                if (this.shouldShowDonatePrompt()) {
                    DonateManager.showDonateModal(this.containerEl);
                }

                singleDownloadButton.disabled = true;
                singleDownloadButton.setText('导出中...');

                try {
                    await DownloadManager.downloadSingleImage(this.previewEl);
                    singleDownloadButton.setText('导出成功');
                } catch (error) {
                    singleDownloadButton.setText('导出失败');
                } finally {
                    setTimeout(() => {
                        singleDownloadButton.disabled = false;
                        singleDownloadButton.setText('下载当前页');
                    }, 2000);
                }
            }
        });

        // 批量导出按钮
        this.copyButton = parent.createEl('button', {
            text: '导出全部页',
            cls: 'red-export-button'
        });

        this.copyButton.addEventListener('click', async () => {
            if (this.previewEl) {
                // 检查是否需要显示捐赠弹窗
                if (this.shouldShowDonatePrompt()) {
                    DonateManager.showDonateModal(this.containerEl);
                }

                this.copyButton.disabled = true;
                this.copyButton.setText('导出中...');

                try {
                    await DownloadManager.downloadAllImages(this.previewEl);
                    this.copyButton.setText('导出成功');
                } catch (error) {
                    this.copyButton.setText('导出失败');
                } finally {
                    setTimeout(() => {
                        this.copyButton.disabled = false;
                        this.copyButton.setText('导出全部页');
                    }, 2000);
                }
            }
        });
    }

    private initializeCopyButtonListener() {
        const copyButtonHandler = async (e: CustomEvent) => {
            const { copyButton } = e.detail;
            if (copyButton) {
                copyButton.addEventListener('click', async () => {
                    copyButton.disabled = true;
                    try {
                        // 检查是否需要显示捐赠弹窗
                        if (this.shouldShowDonatePrompt()) {
                            DonateManager.showDonateModal(this.containerEl);
                        }

                        await ClipboardManager.copyImageToClipboard(this.previewEl);
                        new Notice('图片已复制到剪贴板');
                    } catch (error) {
                        new Notice('复制失败');
                        console.error('复制图片失败:', error);
                    } finally {
                        setTimeout(() => {
                            copyButton.disabled = false;
                        }, 1000);
                    }
                });
            }
        };

        this.containerEl.addEventListener('copy-button-added', copyButtonHandler as EventListener);
        this.register(() => {
            this.containerEl.removeEventListener('copy-button-added', copyButtonHandler as EventListener);
        });
    }
    // #endregion

    // #region 设置管理
    private async restoreSettings() {
        const settings = this.settingsManager.getSettings();

        if (settings.themeId) {
            await this.restoreThemeSettings(settings.themeId);
        }
        if (settings.fontFamily) {
            await this.restoreFontSettings(settings.fontFamily);
        }
        if (settings.fontSize) {
            this.fontSizeSelect.value = settings.fontSize.toString();
            this.themeManager.setFontSize(settings.fontSize);
        }
        if (settings.templateId) { // 添加模板 ID 的恢复逻辑
            await this.restoreTemplateSettings(settings.templateId);
        }
    }

    private async restoreTemplateSettings(templateId: string) {
        const templateSelect = this.customTemplateSelect.querySelector('.red-select-text');
        const templateDropdown = this.customTemplateSelect.querySelector('.red-select-dropdown');
        if (templateSelect && templateDropdown) {
            const option = await this.getTemplateOptions();
            const selected = option.find(o => o.value === templateId);
            if (selected) {
                templateSelect.textContent = selected.label;
                this.customTemplateSelect.querySelector('.red-select')?.setAttribute('data-value', selected.value);
                templateDropdown.querySelectorAll('.red-select-item').forEach(el => {
                    if (el.getAttribute('data-value') === selected.value) {
                        el.classList.add('red-selected');
                    } else {
                        el.classList.remove('red-selected');
                    }
                });
            }
        }
        this.imgTemplateManager.setCurrentTemplate(templateId);
    }

    private async restoreThemeSettings(themeId: string) {
        const templateSelect = this.customThemeSelect.querySelector('.red-select-text');
        const templateDropdown = this.customThemeSelect.querySelector('.red-select-dropdown');
        if (templateSelect && templateDropdown) {
            const option = await this.getThemeOptions();
            const selected = option.find(o => o.value === themeId);
            if (selected) {
                templateSelect.textContent = selected.label;
                this.customThemeSelect.querySelector('.red-select')?.setAttribute('data-value', selected.value);
                templateDropdown.querySelectorAll('.red-select-item').forEach(el => {
                    if (el.getAttribute('data-value') === selected.value) {
                        el.classList.add('red-selected');
                    } else {
                        el.classList.remove('red-selected');
                    }
                });
            }
        }
        this.themeManager.setCurrentTheme(themeId);
    }

    private async restoreFontSettings(fontFamily: string) {
        const fontSelect = this.customFontSelect.querySelector('.red-select-text');
        const fontDropdown = this.customFontSelect.querySelector('.red-select-dropdown');
        if (fontSelect && fontDropdown) {
            const option = this.getFontOptions();
            const selected = option.find(o => o.value === fontFamily);
            if (selected) {
                fontSelect.textContent = selected.label;
                this.customFontSelect.querySelector('.red-select')?.setAttribute('data-value', selected.value);
                fontDropdown.querySelectorAll('.red-select-item').forEach(el => {
                    if (el.getAttribute('data-value') === selected.value) {
                        el.classList.add('red-selected');
                    } else {
                        el.classList.remove('red-selected');
                    }
                });
            }
        }
        this.themeManager.setFont(fontFamily);
    }
    // #endregion

    // #region 预览更新
    private async updatePreview() {
        if (!this.currentFile) return;
        this.previewEl.empty();

        const content = await this.app.vault.cachedRead(this.currentFile);
        await MarkdownRenderer.render(
            this.app,
            content,
            this.previewEl,
            this.currentFile.path,
            this
        );

        // 等待 Obsidian 异步渲染完成（代码块、嵌入等）
        await new Promise(resolve => setTimeout(resolve, 100));

        const hasValidContent = RedConverter.hasValidContent(this.previewEl);
        RedConverter.formatContent(this.previewEl);

        if (hasValidContent) {
            // 应用当前模板
            this.imgTemplateManager.applyTemplate(this.previewEl, this.settingsManager.getSettings());
            // 应用当前背景设置
            const settings = this.settingsManager.getSettings();
            if (settings.backgroundSettings.imageUrl) {
                const previewContainer = this.previewEl.querySelector('.red-image-preview');
                if (previewContainer) {
                    this.backgroundManager.applyBackgroundStyles(previewContainer as HTMLElement, settings.backgroundSettings);
                }
            }
            // 等待布局稳定后，将溢出的 section 拆分为多页
            await new Promise(resolve => setTimeout(resolve, 50));
            this.splitOverflowSections();
        }

        this.updateControlsState(hasValidContent);
        if (!hasValidContent) {
            this.copyButton.setAttribute('title', '请先添加一级标题内容');
        } else {
            this.copyButton.removeAttribute('title');
        }
        this.updateNavigationState();
    }

    private splitOverflowSections() {
        const contentArea = this.previewEl.querySelector('.red-preview-content') as HTMLElement;
        if (!contentArea) return;

        const imagePreview = this.previewEl.querySelector('.red-image-preview') as HTMLElement;
        if (!imagePreview) return;

        const header = this.previewEl.querySelector('.red-preview-header') as HTMLElement;
        const footer = this.previewEl.querySelector('.red-preview-footer') as HTMLElement;
        const headerH = header ? header.getBoundingClientRect().height : 0;
        const footerH = footer ? footer.getBoundingClientRect().height : 0;
        const previewH = imagePreview.getBoundingClientRect().height;
        const availableH = previewH - headerH - footerH - 40;

        if (availableH <= 0) return;

        const container = contentArea.querySelector('.red-content-container') as HTMLElement;
        if (!container) return;

        // 第一步：删除上次拆分产生的续页，把内容归还给原始 section
        const continuations = Array.from(container.querySelectorAll('.red-content-section[data-continuation]')) as HTMLElement[];
        for (const cont of continuations) {
            const originalIndex = cont.getAttribute('data-continuation');
            const original = container.querySelector(`.red-content-section[data-original-index="${originalIndex}"]`) as HTMLElement;
            if (original) {
                // 把续页的子元素全部移回原始 section
                while (cont.firstChild) {
                    original.appendChild(cont.firstChild);
                }
            }
            cont.remove();
        }

        // 第二步：对每个原始 section 标记 data-original-index（首次运行时设置）
        const originals = Array.from(container.querySelectorAll('.red-content-section:not([data-continuation])')) as HTMLElement[];
        originals.forEach((s, i) => s.setAttribute('data-original-index', String(i)));

        // 第三步：逐个检测并拆分溢出的 section
        let insertAfter: HTMLElement | null = null;
        for (const section of originals) {
            section.style.display = 'block';
            insertAfter = section;

            if (section.scrollHeight <= availableH) {
                section.style.display = '';
                continue;
            }

            // 超出：逐个子元素往里塞，溢出就新建续页
            const originalIndex = section.getAttribute('data-original-index')!;
            const allChildren = Array.from(section.children) as HTMLElement[];
            section.innerHTML = '';

            let currentSection = section;

            for (const child of allChildren) {
                currentSection.appendChild(child);
                if (currentSection.scrollHeight > availableH) {
                    currentSection.removeChild(child);
                    currentSection.style.display = '';

                    // 新建续页，插入到 insertAfter 之后
                    const newSection = document.createElement('section');
                    newSection.className = 'red-content-section';
                    newSection.setAttribute('data-continuation', originalIndex);
                    newSection.style.display = 'block';
                    newSection.appendChild(child);

                    if (insertAfter.nextSibling) {
                        container.insertBefore(newSection, insertAfter.nextSibling);
                    } else {
                        container.appendChild(newSection);
                    }
                    insertAfter = newSection;
                    currentSection = newSection;
                }
            }
            currentSection.style.display = '';
        }

        // 第四步：重新连续编号所有 sections
        const allSections = Array.from(container.querySelectorAll('.red-content-section')) as HTMLElement[];
        allSections.forEach((s, i) => s.setAttribute('data-index', String(i)));
    }

    private updateControlsState(enabled: boolean) {
        this.lockButton.disabled = !enabled;

        const templateSelect = this.customTemplateSelect.querySelector('.red-select');
        const themeSelect = this.customThemeSelect.querySelector('.red-select');
        const fontSelect = this.customFontSelect.querySelector('.red-select');
        if (templateSelect) {
            templateSelect.classList.toggle('disabled', !enabled);
            templateSelect.setAttribute('style', `pointer-events: ${enabled ? 'auto' : 'none'}`);
        }
        if (themeSelect) {
            themeSelect.classList.toggle('disabled', !enabled);
            themeSelect.setAttribute('style', `pointer-events: ${enabled ? 'auto' : 'none'}`);
        }
        if (fontSelect) {
            fontSelect.classList.toggle('disabled', !enabled);
            fontSelect.setAttribute('style', `pointer-events: ${enabled ? 'auto' : 'none'}`);
        }

        this.fontSizeSelect.disabled = !enabled;
        const fontSizeButtons = this.containerEl.querySelectorAll('.red-font-size-btn');
        fontSizeButtons.forEach(button => {
            (button as HTMLButtonElement).disabled = !enabled;
        });

        this.copyButton.disabled = !enabled;
        const singleDownloadButton = this.containerEl.querySelector('.red-export-button');
        if (singleDownloadButton) {
            (singleDownloadButton as HTMLButtonElement).disabled = !enabled;
        }
    }
    // #endregion

    // #region 文件处理
    async onFileOpen(file: TFile | null) {
        this.currentFile = file;
        this.currentImageIndex = 0;

        if (!file || file.extension !== 'md') {
            this.previewEl.empty();
            this.previewEl.createEl('div', {
                text: '只能预览 markdown 文本文档',
                cls: 'red-empty-state'
            });
            this.updateControlsState(false);
            return;
        }

        this.updateControlsState(true);
        this.isPreviewLocked = false;
        setIcon(this.lockButton, 'unlock');
        await this.updatePreview();
    }

    async onFileModify(file: TFile) {
        if (file === this.currentFile && !this.isPreviewLocked) {
            if (this.updateTimer) {
                window.clearTimeout(this.updateTimer);
            }
            this.updateTimer = window.setTimeout(() => {
                this.updatePreview();
            }, 500);
        }
    }

    private async togglePreviewLock() {
        this.isPreviewLocked = !this.isPreviewLocked;
        const lockIcon = this.isPreviewLocked ? 'lock' : 'unlock';
        const lockStatus = this.isPreviewLocked ? '开启实时预览状态' : '关闭实时预览状态';
        setIcon(this.lockButton, lockIcon);
        this.lockButton.setAttribute('aria-label', lockStatus);

        if (!this.isPreviewLocked) {
            await this.updatePreview();
        }
    }

    // #region 工具方法
    private createCustomSelect(
        parent: HTMLElement,
        className: string,
        options: { value: string; label: string }[]
    ) {
        const container = parent.createEl('div', { cls: `red-select-container ${className}` });
        const select = container.createEl('div', { cls: 'red-select' });
        const selectedText = select.createEl('span', { cls: 'red-select-text' });
        select.createEl('span', { cls: 'red-select-arrow', text: '▾' });

        const dropdown = container.createEl('div', { cls: 'red-select-dropdown' });

        options.forEach(option => {
            const item = dropdown.createEl('div', {
                cls: 'red-select-item',
                text: option.label
            });

            item.dataset.value = option.value;
            item.addEventListener('click', () => {
                dropdown.querySelectorAll('.red-select-item').forEach(el =>
                    el.classList.remove('red-selected'));
                item.classList.add('red-selected');
                selectedText.textContent = option.label;
                select.dataset.value = option.value;
                dropdown.classList.remove('red-show');
                select.dispatchEvent(new CustomEvent('change', {
                    detail: { value: option.value }
                }));
            });
        });

        if (options.length > 0) {
            selectedText.textContent = options[0].label;
            select.dataset.value = options[0].value;
            dropdown.querySelector('.red-select-item')?.classList.add('red-selected');
        }

        select.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('red-show');
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('red-show');
        });

        return container;
    }

    private async getThemeOptions() {
        const templates = this.settingsManager.getVisibleThemes();
        return templates.length > 0
            ? templates.map(t => ({ value: t.id, label: t.name }))
            : [{ value: 'default', label: '默认主题' }];
    }

    private async getTemplateOptions() {
        return this.imgTemplateManager.getImgTemplateOptions();
    }

    private getFontOptions() {
        return this.settingsManager.getFontOptions();
    }
    // #endregion


    // 检查是否需要显示捐赠弹窗
    private shouldShowDonatePrompt(): boolean {
        // 增加使用次数
        this.donateCount++;

        // 保存到设置中
        if (this.settingsManager) {
            const settings = this.settingsManager.getSettings();
            settings.donateCount = this.donateCount;
            this.settingsManager.updateSettings(settings);
        }

        const now = Date.now();
        const oneDayInMs = 24 * 60 * 60 * 1000; // 一天的毫秒数

        // 如果使用次数达到阈值且24小时内未显示过
        if (this.donateCount % this.MAX_COUNT_BEFORE_PROMPT === 0 && now - this.lastDonatePrompt > oneDayInMs) {
            // 更新上次显示时间
            this.lastDonatePrompt = now;

            // 保存到设置中
            if (this.settingsManager) {
                const settings = this.settingsManager.getSettings();
                settings.lastDonatePrompt = this.lastDonatePrompt;
                this.settingsManager.updateSettings(settings);
            }

            return true;
        }

        return false;
    }
}
