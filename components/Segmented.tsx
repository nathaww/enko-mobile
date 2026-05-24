import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { radii, spacing, typography } from '@/theme';

type Option<T extends string> = { label: string; value: T };

type Props<T extends string> = {
  options: ReadonlyArray<Option<T>>;
  value: T;
  onChange: (value: T) => void;
  /** Optional accessibility label for the group. */
  accessibilityLabel?: string;
};

/**
 * Segmented control. Active option floats on surface-0 against a
 * surface-container-high background. Haptic-selection on change.
 *
 *   <Segmented
 *     options={[
 *       { label: 'Week',  value: 'week'  },
 *       { label: 'Month', value: 'month' },
 *       { label: 'Year',  value: 'year'  },
 *     ]}
 *     value={period}
 *     onChange={setPeriod}
 *   />
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: Props<T>) {
  const theme = useTheme();
  const haptic = useHaptic();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View
      style={styles.root}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => {
              if (!active) {
                haptic('selection');
                onChange(option.value);
              }
            }}
            style={[styles.segment, active && styles.segmentActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface2,
      borderRadius: radii.lg,
      padding: 4,
      gap: 2,
    },
    segment: {
      flex: 1,
      paddingVertical: spacing.sm + 1,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentActive: {
      backgroundColor: theme.colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
    },
    label: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
      fontFamily: typography.button.fontFamily,
    },
    labelActive: {
      color: theme.colors.onSurface,
    },
  });
}
