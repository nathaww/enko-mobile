import { palette } from './colors';

export const darkTheme = {
  mode: 'dark' as const,
  colors: {
    surface: palette.darkSurface,
    surface1: palette.darkSurface1,
    surface2: palette.darkSurface2,
    surface3: palette.darkSurface3,
    onSurface: palette.darkOnSurface,
    onSurfaceMuted: palette.darkOnSurfaceMuted,
    onSurfaceDim: palette.darkOnSurfaceDim,
    outline: palette.darkOutline,
    outlineSoft: palette.darkOutlineSoft,

    brand: palette.brand,
    brandDeep: palette.brandDeep,
    onBrand: palette.onBrand,
    brandSoft: palette.brandSoftDark,

    chipPos: palette.chipPosDark,
    chipPosOn: palette.chipPosDarkOn,
    chipNeg: palette.chipNegDark,
    chipNegOn: palette.chipNegDarkOn,
    chipInfo: palette.chipInfoDark,
    chipInfoOn: palette.chipInfoDarkOn,

    category: palette.category,
  },
};
