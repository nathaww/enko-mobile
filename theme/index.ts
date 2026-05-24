import { darkTheme } from './dark';
import { lightTheme } from './light';
import { palette } from './colors';

export { palette } from './colors';
export { spacing, type SpacingKey } from './spacing';
export { radii, type RadiusKey } from './radii';
export { typography, fontFamily, type TypographyKey } from './typography';
export { shadows, type ShadowKey } from './shadows';
export { darkTheme, lightTheme };

export type ThemeMode = 'dark' | 'light';

export type Theme = {
  mode: ThemeMode;
  colors: {
    surface: string;
    surface1: string;
    surface2: string;
    surface3: string;
    onSurface: string;
    onSurfaceMuted: string;
    onSurfaceDim: string;
    outline: string;
    outlineSoft: string;

    brand: string;
    brandDeep: string;
    onBrand: string;
    brandSoft: string;

    chipPos: string;
    chipPosOn: string;
    chipNeg: string;
    chipNegOn: string;
    chipInfo: string;
    chipInfoOn: string;

    category: typeof palette.category;
  };
};

// Type-check that our themes match the public Theme shape.
const _darkCheck: Theme = darkTheme;
const _lightCheck: Theme = lightTheme;
void _darkCheck;
void _lightCheck;
