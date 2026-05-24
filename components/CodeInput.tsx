import React, { useMemo, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useField } from 'formik';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';

type Props = {
  name: string;
  length?: number;
  autoFocus?: boolean;
  onComplete?: (code: string) => void;
};

/**
 * 6-digit OTP entry. Formik-aware: backs onto a string field of length N.
 *
 * Uses a single hidden TextInput so iOS SMS autofill (`textContentType="oneTimeCode"`)
 * and Android one-tap (`autoComplete="sms-otp"`) both work. The visible boxes
 * are styled <View>s that mirror the underlying string.
 */
export function CodeInput({ name, length = 6, autoFocus = true, onComplete }: Props) {
  const theme = useTheme();
  const [field, meta, helpers] = useField<string>(name);
  const inputRef = useRef<TextInput>(null);
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const value = field.value ?? '';
  const hasError = meta.touched && !!meta.error;

  const handleChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, length);
    helpers.setValue(clean);
    if (clean.length === length) {
      helpers.setTouched(true, false);
      onComplete?.(clean);
    }
  };

  return (
    <View style={styles.root}>
      <Pressable onPress={() => inputRef.current?.focus()} style={styles.row}>
        {Array.from({ length }).map((_, i) => {
          const filled = i < value.length;
          const focused = i === value.length;
          return (
            <View
              key={i}
              style={[
                styles.box,
                hasError && styles.boxError,
                !hasError && focused && styles.boxFocused,
                filled && styles.boxFilled,
              ]}
            >
              <Text style={styles.digit}>{value[i] ?? ''}</Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onBlur={() => helpers.setTouched(true)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        autoFocus={autoFocus}
        style={styles.hidden}
        caretHidden
      />
      {hasError ? <Text style={styles.error}>{meta.error}</Text> : null}
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { gap: spacing.sm },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
      justifyContent: 'space-between',
    },
    box: {
      flex: 1,
      height: 64,
      borderRadius: radii.lg,
      backgroundColor: theme.colors.surface2,
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    boxFocused: { borderColor: theme.colors.brand },
    boxFilled: { backgroundColor: theme.colors.surface3 },
    boxError: { borderColor: theme.colors.chipNegOn },
    digit: {
      ...typography.displayMD,
      color: theme.colors.onSurface,
    },
    hidden: {
      position: 'absolute',
      width: 1,
      height: 1,
      opacity: 0,
    },
    error: {
      ...typography.bodySm,
      color: theme.colors.chipNegOn,
      paddingHorizontal: spacing.xs,
    },
  });
}
