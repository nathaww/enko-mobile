import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Card } from './Card';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/theme';

type Props = {
  label: string;
  /** Optional trailing element next to the label (e.g. "Manage →" link). */
  trailing?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Section header + grouped card body. Used for any "label above + grouped
 * rows below" pattern: Profile preferences, Categories list, Money sources,
 * etc.
 */
export function SettingsSection({ label, trailing, children, style }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.root, style]}>
      <View style={styles.head}>
        <Text style={[styles.label, { color: theme.colors.onSurfaceMuted }]}>
          {label}
        </Text>
        {trailing ?? null}
      </View>
      <Card variant="tight">{children}</Card>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  label: {
    ...typography.labelUp,
  },
});
