import React, { useMemo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Button } from './Button';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/theme';
import {
  errorIllustrations,
  type ErrorIllustrationKey,
} from '@/assets/illustrations';

type Props = {
  illustration?: ErrorIllustrationKey;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  illustrationSize?: number;
  style?: StyleProp<ViewStyle>;
};

export function ErrorState({
  illustration = 'generic',
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  onRetry,
  retryLabel = 'Try again',
  secondaryAction,
  illustrationSize = 180,
  style,
}: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const Illustration = errorIllustrations[illustration];

  return (
    <View style={[styles.root, style]}>
      <View style={[styles.illustration, { width: illustrationSize, height: illustrationSize }]}>
        <Illustration width="100%" height="100%" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {(onRetry || secondaryAction) && (
        <View style={styles.actions}>
          {onRetry ? <Button label={retryLabel} onPress={onRetry} variant="primary" /> : null}
          {secondaryAction ? (
            <Button
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              variant="ghost"
            />
          ) : null}
        </View>
      )}
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
    actions: {
      marginTop: spacing.lg,
      alignSelf: 'stretch',
      paddingHorizontal: spacing['3xl'],
      gap: spacing.sm,
    },
  });
}
