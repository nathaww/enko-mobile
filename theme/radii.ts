export const radii = {
  xs: 8,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 22,
  '3xl': 24,
  '4xl': 28,
  '5xl': 36,
  pill: 999,
} as const;

export type RadiusKey = keyof typeof radii;
