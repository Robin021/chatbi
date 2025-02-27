import { ThemeOption } from './types';
import { defaultTheme } from './themes/default';
import { darkTheme } from './themes/dark';
import { romanticTheme } from './themes/romantic';
import { vintageTheme } from './themes/vintage';
import { techBlueTheme } from './themes/techBlue';

class ThemeManager {
    private currentTheme: string = 'default';
    private themes: Record<string, ThemeOption> = {
        default: defaultTheme,
        dark: darkTheme,
        romantic: romanticTheme,
        vintage: vintageTheme,
        techBlue: techBlueTheme
    };
    private themeChangeListeners: ((theme: string) => void)[] = [];

    getCurrentTheme(): ThemeOption {
        return this.themes[this.currentTheme] || defaultTheme;
    }

    getCurrentThemeName(): string {
        return this.currentTheme;
    }

    setCurrentTheme(themeName: string) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            this.notifyThemeChange(themeName);
        } else {
            console.warn(`Theme ${themeName} not found, using default theme`);
            this.currentTheme = 'default';
            this.notifyThemeChange('default');
        }
    }

    getColorPalette(): string[] {
        return this.getCurrentTheme().color || defaultTheme.color || [];
    }

    addThemeChangeListener(listener: (theme: string) => void) {
        this.themeChangeListeners.push(listener);
    }

    removeThemeChangeListener(listener: (theme: string) => void) {
        this.themeChangeListeners = this.themeChangeListeners.filter(l => l !== listener);
    }

    private notifyThemeChange(theme: string) {
        this.themeChangeListeners.forEach(listener => listener(theme));
    }

    getAllThemes(): Record<string, string> {
        return {
            default: '默认主题',
            dark: '深色主题',
            romantic: '浪漫主题',
            vintage: '复古主题',
            techBlue: '科技蓝主题'
        };
    }
}

export const themeManager = new ThemeManager(); 