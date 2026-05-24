import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useField } from 'formik';
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
 * Formik-aware text field with themed styling and inline error display.
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

  // Animated border color: outline → brand on focus → error on invalid
  const borderProgress = useSharedValue(0);
  const errorProgress = useSharedValue(0);
  borderProgress.value = withTiming(focused ? 1 : 0, { duration: 160 });
  errorProgress.value = withTiming(hasError ? 1 : 0, { duration: 160 });

  const animBorder = useAnimatedStyle(() => {
    const focusColor = focused ? theme.colors.brand : theme.colors.outlineSoft;
    return {
      borderColor: hasError ? theme.colors.chipNegOn : focusColor,
    };
  });

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.wrap, animBorder]}>
        <TextInput
          value={field.value}
          onChangeText={helpers.setValue}
          onBlur={() => {
            helpers.setTouched(true);
            setFocused(false);
          }}
          onFocus={() => setFocused(true)}
          placeholderTextColor={theme.colors.onSurfaceDim}
          style={styles.input}
          secureTextEntry={hidden}
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
    input: {
      flex: 1,
      ...typography.body,
      color: theme.colors.onSurface,
      paddingVertical: spacing.md + 2,
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
