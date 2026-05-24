import React, { useMemo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LottieAnimation } from './LottieView';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/theme';

type Props = {
  message?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function LoadingView({ message, size = 96, style }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={[styles.root, style]}>
      <LottieAnimation group="loading" name="spinner" size={size} loop />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      padding: spacing['2xl'],
    },
    message: {
      ...typography.body,
      color: theme.colors.onSurfaceMuted,
      textAlign: 'center',
    },
  });
}
