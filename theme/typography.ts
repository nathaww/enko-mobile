import type { TextStyle } from 'react-native';

export const fontFamily = {
  display: 'PlusJakartaSans_800ExtraBold',
  bold: 'PlusJakartaSans_700Bold',
  semibold: 'PlusJakartaSans_600SemiBold',
  medium: 'PlusJakartaSans_500Medium',
  regular: 'PlusJakartaSans_400Regular',
} as const;

export const typography = {
  // Display lineHeights are ~1.18x fontSize. Plus Jakarta ExtraBold has
  // tall ascenders + descenders (the "g", "y", "p" tails); a sub-1.15x
  // lineHeight clips them on the visible page, especially when the title
  // sits flush against a sibling element above. 1.18x is the sweet spot
  // for a tight display feel without losing glyph extremities.
  displayXL: {
    fontFamily: fontFamily.display,
    fontSize: 44,
    lineHeight: 52,
    letterSpacing: -2.0,
  },
  displayLG: {
    fontFamily: fontFamily.display,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -1.4,
  },
  displayMD: {
    fontFamily: fontFamily.display,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.72,
  },
  titleLG: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  titleMD: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.34,
  },
  body: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  labelUp: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: -0.1,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyKey = keyof typeof typography;
