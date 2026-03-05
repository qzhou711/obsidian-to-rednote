import { BackgroundSettings } from './modals/BackgroundSettingModal';

export class BackgroundManager {
    constructor() {}

    public applyBackgroundStyles(element: HTMLElement, settings: BackgroundSettings) {
        const stylesArray = [
            `background-image: url(${settings.imageUrl})`,
            `background-size: ${settings.scale * 100}%`,
            `background-position: ${settings.position.x}px ${settings.position.y}px`,
            `background-repeat: no-repeat`
        ];

        stylesArray.forEach(style => {
            const match = style.match(/([^:]+):(.+)/);
            if (match) {
                const [, key, value] = match.map(item => item.trim());
                if (key && value) {
                    element.style[key as any] = value;
                }
            }
        });
    }

    public clearBackgroundStyles(element: HTMLElement) {
        const style = element.getAttribute('style') || '';
        // 只清除特定的四个背景样式属性
        const clearedStyle = style.replace(/background-image:[^;]+;|background-size:[^;]+;|background-position:[^;]+;|background-repeat:[^;]+;/g, '');
        element.setAttribute('style', clearedStyle);
    }
}