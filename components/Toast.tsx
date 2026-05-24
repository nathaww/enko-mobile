import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Toast, {
  type BaseToastProps,
  type ToastConfig,
} from 'react-native-toast-message';
import { useTheme } from '@/hooks/useTheme';
import { radii, shadows, spacing, typography } from '@/theme';

type Kind = 'success' | 'error' | 'info';

function ToastView({ kind, text1, text2 }: BaseToastProps & { kind: Kind }) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme, kind), [theme, kind]);

  return (
    <View style={styles.root}>
      <View style={styles.dot} />
      <View style={{ flex: 1 }}>
        {text1 ? <Text style={styles.title}>{text1}</Text> : null}
        {text2 ? <Text style={styles.desc}>{text2}</Text> : null}
      </View>
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: (props) => <ToastView kind="success" {...props} />,
  error: (props) => <ToastView kind="error" {...props} />,
  info: (props) => <ToastView kind="info" {...props} />,
};

export function AppToast() {
  return <Toast config={toastConfig} />;
}

function makeStyles(theme: ReturnType<typeof useTheme>, kind: Kind) {
  const accent =
    kind === 'success'
      ? theme.colors.brand
      : kind === 'error'
      ? theme.colors.chipNegOn
      : theme.colors.chipInfoOn;

  return StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginHorizontal: spacing.lg,
      padding: spacing.lg,
      borderRadius: radii['2xl'],
      backgroundColor: theme.colors.surface1,
      borderWidth: 1,
      borderColor: theme.colors.outlineSoft,
      ...shadows.card,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      backgroundColor: accent,
    },
    title: {
      ...typography.titleMD,
      color: theme.colors.onSurface,
      fontSize: 14,
      lineHeight: 18,
    },
    desc: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
      marginTop: 2,
    },
  });
}
