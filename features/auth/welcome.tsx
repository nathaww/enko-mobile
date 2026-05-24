import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';
import { heroIllustrations } from '@/assets/illustrations';

export function Welcome() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <Image source={heroIllustrations.onboarding} style={styles.heroImg} resizeMode="contain" />
        <Text style={styles.title}>Welcome to Enko.</Text>
        <Text style={styles.subtitle}>
          Track expenses, manage accounts, and stay on budget — in one quiet, beautiful place.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button label="Create account" fullWidth onPress={() => router.push('/(auth)/register')} />
        <Button
          label="I already have an account"
          variant="ghost"
          fullWidth
          onPress={() => router.push('/(auth)/login')}
        />
        <Text style={styles.legal}>
          By continuing you agree to our{' '}
          <Text style={styles.legalLink}>Terms</Text> and{' '}
          <Text style={styles.legalLink}>Privacy Policy</Text>.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing['2xl'],
    },
    hero: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.lg,
    },
    heroImg: { width: 220, height: 220 },
    title: {
      ...typography.displayXL,
      color: theme.colors.onSurface,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    subtitle: {
      ...typography.body,
      color: theme.colors.onSurfaceMuted,
      textAlign: 'center',
      maxWidth: 320,
    },
    footer: {
      gap: spacing.sm,
      paddingBottom: spacing.lg,
    },
    legal: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceDim,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    legalLink: {
      color: theme.colors.onSurfaceMuted,
      fontFamily: typography.button.fontFamily,
    },
  });
}

export default Welcome;
