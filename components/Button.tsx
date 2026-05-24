import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { radii, shadows, spacing, typography } from '@/theme';

type Variant = 'primary' | 'tonal' | 'ghost' | 'danger';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: Variant;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Haptic kind on press. Defaults to 'medium' for primary, 'light' for others. */
  haptic?: 'light' | 'medium' | 'heavy' | 'selection' | 'none';
};

export function Button({
  label,
  variant = 'primary',
  fullWidth,
  loading,
  leftIcon,
  rightIcon,
  style,
  haptic,
  onPress,
  disabled,
  ...rest
}: Props) {
  const theme = useTheme();
  const trigger = useHaptic();

  const styles = useMemo(() => makeStyles(theme, variant), [theme, variant]);

  const handlePress: PressableProps['onPress'] = (e) => {
    const kind = haptic ?? (variant === 'primary' ? 'medium' : 'light');
    if (kind !== 'none') trigger(kind);
    onPress?.(e);
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.root,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={styles.text.color as string} />
      ) : (
        <View style={styles.inner}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          <Text style={styles.text}>{label}</Text>
          {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>, variant: Variant) {
  const palette = {
    primary: {
      bg: theme.colors.brand,
      fg: theme.colors.onBrand,
      border: 'transparent',
      shadow: shadows.fab,
    },
    tonal: {
      bg: theme.colors.surface2,
      fg: theme.colors.onSurface,
      border: 'transparent',
      shadow: shadows.none,
    },
    ghost: {
      bg: 'transparent',
      fg: theme.colors.onSurface,
      border: theme.colors.outline,
      shadow: shadows.none,
    },
    danger: {
      bg: theme.colors.chipNeg,
      fg: theme.colors.chipNegOn,
      border: 'transparent',
      shadow: shadows.none,
    },
  }[variant];

  return StyleSheet.create({
    root: {
      borderRadius: radii.pill,
      paddingVertical: spacing.lg + 1, // 17
      paddingHorizontal: spacing['2xl'] - 2, // 22
      backgroundColor: palette.bg,
      borderWidth: variant === 'ghost' ? 1.5 : 0,
      borderColor: palette.border,
      alignItems: 'center',
      justifyContent: 'center',
      ...palette.shadow,
    },
    fullWidth: { alignSelf: 'stretch' },
    pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
    disabled: { opacity: 0.5 },
    inner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    icon: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
    text: { ...typography.button, color: palette.fg },
  });
}
