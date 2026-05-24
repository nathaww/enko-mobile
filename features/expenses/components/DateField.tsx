import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { radii, spacing, typography } from '@/theme';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
};

/**
 * Native date picker wrapper.
 *   - iOS: shows the wheel/calendar inline-compact when toggled open
 *   - Android: shows the native dialog and self-dismisses on select/cancel
 *
 * Keeps the surface API simple — caller passes a Date; we manage the open
 * state and platform quirks internally.
 */
export function DateField({ value, onChange, label = 'Date' }: Props) {
  const theme = useTheme();
  const haptic = useHaptic();
  const [open, setOpen] = useState(false);
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const display = formatDate(value);

  const onPress = () => {
    haptic('light');
    setOpen((o) => !o);
  };

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.field, pressed && { opacity: 0.7 }]}
        accessibilityRole="button"
      >
        <Calendar size={18} color={theme.colors.onSurfaceMuted} strokeWidth={2} />
        <Text style={styles.value}>{display}</Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={new Date()}
          onChange={(event, selected) => {
            // Android: any tap on the dialog buttons closes the picker. iOS
            // 'inline' mode keeps it open, user closes via the toggle.
            if (Platform.OS === 'android') setOpen(false);
            if (event.type === 'set' && selected) onChange(selected);
          }}
          themeVariant={theme.mode}
          accentColor={theme.colors.brand}
        />
      ) : null}
    </View>
  );
}

function formatDate(d: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(d, today)) return `Today, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  if (isSameDay(d, yesterday))
    return `Yesterday, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { gap: spacing.sm },
    label: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: theme.colors.surface2,
      borderRadius: radii.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md + 2,
    },
    value: {
      ...typography.body,
      color: theme.colors.onSurface,
      fontFamily: typography.button.fontFamily,
    },
  });
}
