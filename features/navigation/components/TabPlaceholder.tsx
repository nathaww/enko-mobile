import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
};

/**
 * Temporary screen used by all 5 tabs until each feature is built out.
 * NativeTabs adjusts the system safe-area inset to include its own height,
 * so we let SafeAreaView handle bottom padding automatically.
 */
export function TabPlaceholder({ title, subtitle }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </SafeAreaView>
      <ScrollView
        contentContainerStyle={styles.body}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.center}>
          <Text style={styles.placeholder}>Coming soon.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    headerWrap: {
      paddingHorizontal: spacing['2xl'],
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    title: {
      ...typography.displayXL,
      color: theme.colors.onSurface,
    },
    subtitle: {
      ...typography.body,
      color: theme.colors.onSurfaceMuted,
      marginTop: spacing.xs,
    },
    body: {
      flexGrow: 1,
      paddingHorizontal: spacing['2xl'],
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholder: {
      ...typography.body,
      color: theme.colors.onSurfaceDim,
    },
  });
}
