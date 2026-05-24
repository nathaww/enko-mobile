import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextInputProps,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useField } from 'formik';
import { Input } from './Input';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';

type Props = Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> & {
  /** Formik field name */
  name: string;
  label: string;
  /** Optional right-side adornment (icon, button, etc.) */
  rightAdornment?: React.ReactNode;
};

/**
 * Formik-aware text field. Composes <Input> (themed primitive) with a label,
 * an animated bordered wrapper, and inline error text.
 *
 *   <FormField name="email" label="Email" keyboardType="email-address" />
 *
 * Validation comes from the Formik schema/validate prop. The error appears
 * only after the field has been touched.
 */
export function FormField({ name, label, rightAdornment, secureTextEntry, ...rest }: Props) {
  const theme = useTheme();
  const [field, meta, helpers] = useField<string>(name);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  const hasError = meta.touched && !!meta.error;
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // Animated border color: resting outline → brand on focus → error red on invalid.
  // Writes happen in effects (not during render) to satisfy Reanimated strict mode.
  const focusProgress = useSharedValue(0);
  const errorProgress = useSharedValue(0);

  useEffect(() => {
    focusProgress.value = withTiming(focused ? 1 : 0, { duration: 160 });
  }, [focused, focusProgress]);

  useEffect(() => {
    errorProgress.value = withTiming(hasError ? 1 : 0, { duration: 160 });
  }, [hasError, errorProgress]);

  const restColor = theme.colors.outlineSoft;
  const focusColor = theme.colors.brand;
  const errorColor = theme.colors.chipNegOn;

  const animBorder = useAnimatedStyle(() => {
    const focused = interpolateColor(focusProgress.value, [0, 1], [restColor, focusColor]);
    const withError = interpolateColor(errorProgress.value, [0, 1], [focused, errorColor]);
    return { borderColor: withError };
  });

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.wrap, animBorder]}>
        <Input
          value={field.value}
          onChangeText={helpers.setValue}
          onBlur={() => {
            helpers.setTouched(true);
            setFocused(false);
          }}
          onFocus={() => setFocused(true)}
          secureTextEntry={hidden}
          style={styles.inputSlot}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            style={({ pressed }) => [styles.adornment, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.adornmentText}>{hidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        ) : null}
        {rightAdornment ? <View style={styles.adornment}>{rightAdornment}</View> : null}
      </Animated.View>
      {hasError ? <Text style={styles.error}>{meta.error}</Text> : null}
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { gap: spacing.sm },
    label: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
    },
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radii.lg,
      backgroundColor: theme.colors.surface2,
      borderWidth: 1.5,
      paddingHorizontal: spacing.md,
    },
    inputSlot: {
      flex: 1,
    },
    adornment: {
      paddingLeft: spacing.sm,
      paddingVertical: spacing.sm,
    },
    adornmentText: {
      ...typography.bodySm,
      color: theme.colors.brand,
      fontFamily: typography.button.fontFamily,
    },
    error: {
      ...typography.bodySm,
      color: theme.colors.chipNegOn,
      paddingHorizontal: spacing.xs,
    },
  });
}
