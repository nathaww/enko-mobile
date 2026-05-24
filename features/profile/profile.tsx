import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/Button';
import { useLogoutMutation } from '@/features/auth/auth.mutations';
import { radii, spacing, typography } from '@/theme';

/**
 * Profile tab. Shows the signed-in user's identity and a Log out action.
 * Settings sections (currency, theme, categories, data export) live here
 * eventually; for now we ship the auth-critical chrome and the logout flow.
 */
export function Profile() {
  const theme = useTheme();
  const { user } = useAuth();
  const logout = useLogoutMutation();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const confirmLogout = () => {
    Alert.alert(
      'Log out?',
      'You can sign back in any time.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => logout.mutate(),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>Profile</Text>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.body}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identityCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {(user?.name?.[0] ?? '?').toUpperCase()}
            </Text>
          </View>
          <View style={styles.identityText}>
            <Text style={styles.name}>{user?.name ?? 'Loading…'}</Text>
            <Text style={styles.email}>{user?.email ?? ''}</Text>
            {user?.isVerified ? (
              <View style={styles.verifiedRow}>
                <View style={styles.verifiedDot} />
                <Text style={styles.verifiedLabel}>Verified</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preferences</Text>
          <View style={styles.placeholderRow}>
            <Text style={styles.placeholderText}>
              Currency, theme, hide-amounts, and AI key live here once Settings is wired.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <Button
            label={logout.isPending ? 'Logging out…' : 'Log out'}
            variant="danger"
            fullWidth
            disabled={logout.isPending}
            onPress={confirmLogout}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.surface },
    headerWrap: {
      paddingHorizontal: spacing['2xl'],
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    title: {
      ...typography.displayXL,
      color: theme.colors.onSurface,
    },
    body: {
      flexGrow: 1,
      paddingHorizontal: spacing['2xl'],
      paddingBottom: spacing['2xl'],
      gap: spacing.xl,
    },
    identityCard: {
      backgroundColor: theme.colors.surface1,
      borderRadius: radii['4xl'],
      padding: spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: radii['2xl'],
      backgroundColor: theme.colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: {
      fontFamily: typography.displayMD.fontFamily,
      fontSize: 26,
      color: theme.colors.onBrand,
      letterSpacing: -0.8,
    },
    identityText: {
      flex: 1,
      gap: spacing.xs,
    },
    name: {
      ...typography.titleLG,
      color: theme.colors.onSurface,
    },
    email: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
    },
    verifiedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    verifiedDot: {
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: theme.colors.brand,
    },
    verifiedLabel: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
      fontFamily: typography.button.fontFamily,
    },
    section: {
      gap: spacing.md,
    },
    sectionLabel: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
      paddingHorizontal: spacing.xs,
    },
    placeholderRow: {
      backgroundColor: theme.colors.surface1,
      borderRadius: radii['3xl'],
      padding: spacing.lg,
    },
    placeholderText: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
    },
  });
}

export default Profile;
