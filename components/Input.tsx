import React, { forwardRef, useMemo } from 'react';
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/theme';

type Variant = 'body' | 'display';

export type InputProps = TextInputProps & {
  /** Typography variant. 'body' for normal fields, 'display' for big amount inputs. */
  variant?: Variant;
};

/**
 * Themed TextInput primitive. Use this anywhere a user can type — never a
 * bare <TextInput>. This component encodes platform fixes that are easy to
 * forget:
 *
 *   - iOS clips descenders (j, g, p, y) when `lineHeight` is set explicitly
 *     and the field is focused. We spread fontFamily/fontSize but NOT
 *     lineHeight, then use paddingVertical to control overall height.
 *   - Android adds invisible top/bottom padding to text by default. We set
 *     `includeFontPadding: false` + `textAlignVertical: 'center'` to match
 *     iOS layout.
 *   - `placeholderTextColor` defaults to the theme's dim on-surface so
 *     placeholders read as hints, not active values.
 *
 * For wrappers that need a border or adornment (like FormField), nest <Input>
 * inside a styled <View> rather than re-styling the input itself.
 */
export const Input = forwardRef<TextInput, InputProps>(
  ({ variant = 'body', style, placeholderTextColor, ...rest }, ref) => {
    const theme = useTheme();

    const baseStyle = useMemo<TextStyle>(() => {
      const typo =
        variant === 'display'
          ? {
              fontFamily: typography.displayMD.fontFamily,
              fontSize: typography.displayMD.fontSize,
              letterSpacing: typography.displayMD.letterSpacing,
            }
          : {
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              letterSpacing: 0,
            };
      return {
        fontFamily: typo.fontFamily,
        fontSize: typo.fontSize,
        // Letter spacing is safe on TextInput (no clipping); only set it where
        // the typography variant calls for it.
        letterSpacing: typo.letterSpacing,
        color: theme.colors.onSurface,
        paddingVertical: variant === 'display' ? spacing.md + 2 : spacing.md,
        includeFontPadding: false,
        textAlignVertical: 'center',
      };
    }, [theme, variant]);

    return (
      <TextInput
        ref={ref}
        placeholderTextColor={placeholderTextColor ?? theme.colors.onSurfaceDim}
        {...rest}
        style={[styles.base, baseStyle, style]}
      />
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  base: {
    // Padding/horizontal margin should come from the parent container, not the
    // input itself, so it composes cleanly with bordered wrappers.
    paddingHorizontal: 0,
    margin: 0,
  },
});
