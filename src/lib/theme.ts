import { useColorScheme } from 'react-native';

const palette = {
  light: {
    bg: '#F5F6F8',
    card: '#FFFFFF',
    text: '#11181C',
    sub: '#5B6770',
    border: '#E6E8EB',
    accent: '#208AEF',
    accentText: '#FFFFFF',
    accentSoft: '#E6F0FF',
    chip: '#EEF1F4',
  },
  dark: {
    bg: '#0B0D0F',
    card: '#16191C',
    text: '#ECEDEE',
    sub: '#9BA1A6',
    border: '#23272B',
    accent: '#4FA3FF',
    accentText: '#06121F',
    accentSoft: '#10243B',
    chip: '#1E2329',
  },
} as const;

export type Theme = (typeof palette)[keyof typeof palette];

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? palette.dark : palette.light;
}

export const radius = { sm: 8, md: 14, lg: 20, xl: 28 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
