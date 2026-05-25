import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showBack?: boolean;
  /** Show the small "E" brand mark above the title. */
  showBrand?: boolean;
};

/**
 * Standard auth screen layout: top safe area, back button, big display title,
 * subtitle, scrollable body, sticky footer with action buttons. Handles
 * keyboard avoidance on iOS automatically.
 */
export function AuthScaffold({
  title,
  subtitle,
  children,
  footer,
  showBack = true,
  showBrand = false,
}: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            {showBack ? (
              <Pressable
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/welcome'))}
                hitSlop={12}
                style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.backChevron}>‹</Text>
              </Pressable>
            ) : (
              <View style={styles.backPlaceholder} />
            )}
          </View>

          {showBrand ? <View style={styles.brand}><Text style={styles.brandLetter}>E</Text></View> : null}

          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          <View style={styles.body}>{children}</View>
        </ScrollView>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.surface },
    flex: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: spacing.sm,
      paddingBottom: spacing.lg,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backChevron: {
      fontSize: 26,
      lineHeight: 26,
      color: theme.colors.onSurface,
      fontFamily: typography.button.fontFamily,
    },
    backPlaceholder: { height: 40 },
    brand: {
      width: 48,
      height: 48,
      borderRadius: radii.md,
      backgroundColor: theme.colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    brandLetter: {
      fontSize: 26,
      letterSpacing: -1.2,
      color: theme.colors.onBrand,
      fontFamily: typography.displayMD.fontFamily,
    },
    title: {
      ...typography.displayXL,
      color: theme.colors.onSurface,
    },
    subtitle: {
      ...typography.body,
      color: theme.colors.onSurfaceMuted,
      marginTop: spacing.sm,
      maxWidth: 360,
    },
    body: {
      marginTop: spacing['2xl'],
      gap: spacing.lg,
    },
    footer: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      gap: spacing.sm,
    },
  });
}
