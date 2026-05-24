import React, { useMemo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Button } from './Button';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/theme';
import {
  emptyIllustrations,
  type EmptyIllustrationKey,
} from '@/assets/illustrations';

type Props = {
  illustration: EmptyIllustrationKey;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  illustrationSize?: number;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  illustration,
  title,
  description,
  action,
  illustrationSize = 180,
  style,
}: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const Illustration = emptyIllustrations[illustration];

  return (
    <View style={[styles.root, style]}>
      <View style={[styles.illustration, { width: illustrationSize, height: illustrationSize }]}>
        <Illustration width="100%" height="100%" />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {action ? (
        <View style={styles.action}>
          <Button label={action.label} onPress={action.onPress} variant="primary" />
        </View>
      ) : null}
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing['2xl'],
      gap: spacing.md,
    },
    illustration: {
      marginBottom: spacing.md,
    },
    title: {
      ...typography.displayMD,
      color: theme.colors.onSurface,
      textAlign: 'center',
    },
    description: {
      ...typography.body,
      color: theme.colors.onSurfaceMuted,
      textAlign: 'center',
      maxWidth: 280,
    },
    action: {
      marginTop: spacing.lg,
      alignSelf: 'stretch',
      paddingHorizontal: spacing['3xl'],
    },
  });
}
