import { Theme } from '../themeManager';
import  RedPlugin  from '../main';
import { EventEmitter } from 'events';
interface RedSettings {
    donateCount?: number;
    lastDonatePrompt?: number;
    templateId: string;
    themeId: string;
    fontFamily: string;
    fontSize: number;
    backgroundId: string;
    themes: Theme[];      // 添加主题列表
    customThemes: Theme[]; // 添加自定义主题列表
    // 添加用户信息设置
    userAvatar: string;
    userName: string;
    notesTitle: string;
    userId: string;
    showTime: boolean;
    timeFormat: string;
    showFooter?: boolean;
    footerLeftText: string;
    footerRightText: string;
    headingLevel: 'h1' | 'h2'; // 标题级别选项
    customFonts: { value: string; label: string; isPreset?: boolean }[];  // 添加自定义字体配置
    backgroundSettings: {
        imageUrl: string;
        scale: number;
        position: { x: number; y: number };
    };
}

export const DEFAULT_SETTINGS: RedSettings = {
    templateId: 'default',
    themeId: 'default',
    fontFamily: 'Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, "PingFang SC"',
    fontSize: 16,
    backgroundId: '',
    themes: [],
    customThemes: [],
    // 修改默认用户信息
    userAvatar: '',  // 默认为空，提示用户上传
    userName: '夜半',
    notesTitle: '备忘录',
    userId: '@Yeban',
    showTime: true,
    timeFormat: 'zh-CN',
    headingLevel: 'h2', // 默认使用二级标题
    footerLeftText: '夜半过后，光明便启程',
    footerRightText: '欢迎关注公众号：夜半',
    customFonts: [
        {
            value: 'Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, "PingFang SC", Cambria, Cochin, Georgia, Times, "Times New Roman", serif',
            label: '默认字体',
            isPreset: true
        },
        {
            value: 'SimSun, "宋体", serif',
            label: '宋体',
            isPreset: true
        },
        {
            value: 'SimHei, "黑体", sans-serif',
            label: '黑体',
            isPreset: true
        },
        {
            value: 'KaiTi, "楷体", serif',
            label: '楷体',
            isPreset: true
        },
        {
            value: '"Microsoft YaHei", "微软雅黑", sans-serif',
            label: '雅黑',
            isPreset: true
        }
    ],
    backgroundSettings: {
        imageUrl: '',
        scale: 1,
        position: { x: 0, y: 0 }
    },
}

export class SettingsManager extends EventEmitter {
    private plugin: RedPlugin;
    private settings: RedSettings;

    constructor(plugin: RedPlugin) {
        super();
        this.plugin = plugin;
        this.settings = DEFAULT_SETTINGS;
    }

    async loadSettings() {
        let savedData = await this.plugin.loadData();

        // 确保 savedData 是一个对象
        if (!savedData) {
            savedData = {};
        }
    
        // 如果是首次加载或 themes 为空，导入预设主题
        if (!savedData.themes || savedData.themes.length === 0) {
            const { templates } = await import('../templates');
            savedData.themes = Object.values(templates).map(theme => ({
                ...theme,
                isPreset: true
            }));
        }
    
        // 确保 customThemes 存在
        if (!savedData.customThemes) {
            savedData.customThemes = [];
        }
    
        this.settings = Object.assign({}, DEFAULT_SETTINGS, savedData);
    }

    // 主题相关方法
    getAllThemes(): Theme[] {
        return [...this.settings.themes, ...this.settings.customThemes];
    }

    // 新增：获取可见主题
    getVisibleThemes(): Theme[] {
        return this.getAllThemes().filter(theme => theme.isVisible !== false);
    }

    getTheme(themeId: string): Theme | undefined {
        return this.settings.themes.find(theme => theme.id === themeId) 
            || this.settings.customThemes.find(theme => theme.id === themeId);
    }

    async addCustomTheme(theme: Theme) {
        theme.isPreset = false;
        theme.isVisible = true;
        this.settings.customThemes.push(theme);
        await this.saveSettings();
        this.emit('theme-visibility-changed');
    }

    async updateTheme(themeId: string, updatedTheme: Partial<Theme>) {
        const presetThemeIndex = this.settings.themes.findIndex(t => t.id === themeId);
        if (presetThemeIndex !== -1) {
            if ('isVisible' in updatedTheme) {
                this.settings.themes[presetThemeIndex] = {
                    ...this.settings.themes[presetThemeIndex],
                    isVisible: updatedTheme.isVisible
                };
                await this.saveSettings();
                this.emit('theme-visibility-changed');
                return true;
            }
            return false;
        }

        const customThemeIndex = this.settings.customThemes.findIndex(t => t.id === themeId);
        if (customThemeIndex !== -1) {
            this.settings.customThemes[customThemeIndex] = {
                ...this.settings.customThemes[customThemeIndex],
                ...updatedTheme
            };
            await this.saveSettings();
            this.emit('theme-visibility-changed');
            return true;
        }
        
        return false;
    }

    async removeTheme(themeId: string): Promise<boolean> {
        const theme = this.getTheme(themeId);
        if (theme && !theme.isPreset) {
            this.settings.customThemes = this.settings.customThemes.filter(t => t.id !== themeId);
            if (this.settings.themeId === themeId) {
                this.settings.themeId = 'default';
            }
            await this.saveSettings();
            this.emit('theme-visibility-changed');
            return true;
        }
        return false;
    }

    async saveSettings() {
        await this.plugin.saveData(this.settings);
    }

    getSettings(): RedSettings {
        return this.settings;
    }

    async updateSettings(settings: Partial<RedSettings>) {
        this.settings = { ...this.settings, ...settings };
        await this.saveSettings();
    }

    getFontOptions() {
        return this.settings.customFonts;
    }

    async addCustomFont(font: { value: string; label: string }) {
        this.settings.customFonts.push({ ...font, isPreset: false });
        await this.saveSettings();
    }

    async removeFont(value: string) {
        const font = this.settings.customFonts.find(f => f.value === value);
        if (font && !font.isPreset) {
            this.settings.customFonts = this.settings.customFonts.filter(f => f.value !== value);
            await this.saveSettings();
        }
    }

    async updateFont(oldValue: string, newFont: { value: string; label: string }) {
        const index = this.settings.customFonts.findIndex(f => f.value === oldValue);
        if (index !== -1 && !this.settings.customFonts[index].isPreset) {
            this.settings.customFonts[index] = { ...newFont, isPreset: false };
            await this.saveSettings();
        }
    }
}
