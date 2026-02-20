import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_COLORS, DARK_COLORS } from '@/constants/theme';

type Theme = 'light' | 'dark' | 'auto';
type ColorScheme = typeof LIGHT_COLORS;

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  colors: ColorScheme;
  setTheme: (theme: Theme) => Promise<void>;
  loadTheme: () => Promise<void>;
}

const THEME_KEY = '@1way/theme';

export const useTheme = create<ThemeState>((set, get) => ({
  theme: 'light',
  isDark: false,
  colors: LIGHT_COLORS,

  setTheme: async (theme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
      
      const isDark = theme === 'dark';
      
      set({
        theme,
        isDark,
        colors: isDark ? DARK_COLORS : LIGHT_COLORS,
      });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  },

  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      const theme = (savedTheme as Theme) || 'light';
      const isDark = theme === 'dark';
      
      set({
        theme,
        isDark,
        colors: isDark ? DARK_COLORS : LIGHT_COLORS,
      });
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  },
}));
