import { palette } from './colors';

export const lightTheme = {
  mode: 'light' as const,
  colors: {
    surface: palette.lightSurface,
    surface1: palette.lightSurface1,
    surface2: palette.lightSurface2,
    surface3: palette.lightSurface3,
    onSurface: palette.lightOnSurface,
    onSurfaceMuted: palette.lightOnSurfaceMuted,
    onSurfaceDim: palette.lightOnSurfaceDim,
    outline: palette.lightOutline,
    outlineSoft: palette.lightOutlineSoft,

    brand: palette.brand,
    brandDeep: palette.brandDeep,
    onBrand: palette.onBrand,
    brandSoft: palette.brandSoftLight,

    chipPos: palette.chipPosLight,
    chipPosOn: palette.chipPosLightOn,
    chipNeg: palette.chipNegLight,
    chipNegOn: palette.chipNegLightOn,
    chipInfo: palette.chipInfoLight,
    chipInfoOn: palette.chipInfoLightOn,

    category: palette.category,
  },
};
