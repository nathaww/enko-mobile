import React, { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight,
  Globe,
  Eye,
  Sparkles,
  Sun,
  Tag,
  DollarSign,
  Download,
  Upload,
  KeyRound,
  type LucideIcon,
} from 'lucide-react-native';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useToast } from '@/hooks/useToast';

import { Card } from '@/components/Card';
import { ListItem } from '@/components/ListItem';
import { Button } from '@/components/Button';
import { AmountChip } from '@/components/AmountChip';
import { SettingsSection } from '@/components/SettingsSection';
import { useLogoutMutation } from '@/features/auth/auth.mutations';

import { radii, spacing, typography } from '@/theme';

export function Profile() {
  const theme = useTheme();
  const { user } = useAuth();
  const { override, setOverride } = useThemeContext();
  const toast = useToast();
  const logout = useLogoutMutation();
  const [hideAmounts, setHideAmounts] = React.useState(false);

  const styles = useMemo(() => makeStyles(theme), [theme]);

  const themeLabel: 'System' | 'Light' | 'Dark' =
    override === 'light' ? 'Light' : override === 'dark' ? 'Dark' : 'System';

  const pickTheme = () => {
    Alert.alert(
      'Theme',
      'Choose how Enko looks.',
      [
        {
          text: themeLabel === 'System' ? '✓ System' : 'System',
          onPress: () => setOverride(null),
        },
        {
          text: themeLabel === 'Light' ? '✓ Light' : 'Light',
          onPress: () => setOverride('light'),
        },
        {
          text: themeLabel === 'Dark' ? '✓ Dark' : 'Dark',
          onPress: () => setOverride('dark'),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

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

  const comingSoon = (label: string) => () =>
    toast('info', { title: 'Coming soon', description: `${label} is on its way.` });

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
        {/* Identity card */}
        <Card variant="hero" style={styles.identityCard}>
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
        </Card>

        {/* Preferences */}
        <SettingsSection label="Preferences">
          <ListItem
            leading={<RowIcon Icon={Globe} colorKey="transit" />}
            title="Currency"
            subtitle="Default for new expenses"
            trailing={
              <View style={styles.trailing}>
                <Text style={styles.trailingValue}>ETB</Text>
                <ChevronRight size={18} color={theme.colors.onSurfaceDim} />
              </View>
            }
            onPress={comingSoon('Currency picker')}
          />
          <ListItem
            leading={<RowIcon Icon={Sun} colorKey="food" />}
            title="Theme"
            subtitle="Appearance across the app"
            trailing={
              <View style={styles.trailing}>
                <Text style={styles.trailingValue}>{themeLabel}</Text>
                <ChevronRight size={18} color={theme.colors.onSurfaceDim} />
              </View>
            }
            onPress={pickTheme}
          />
          <ListItem
            leading={<RowIcon Icon={Eye} colorKey="bills" />}
            title="Hide amounts"
            subtitle="Blur balances by default"
            trailing={
              <Switch
                value={hideAmounts}
                onValueChange={setHideAmounts}
                trackColor={{
                  false: theme.colors.surface2,
                  true: theme.colors.brand,
                }}
                thumbColor={theme.colors.surface}
              />
            }
            hideDivider
          />
          <ListItem
            leading={<RowIcon Icon={Sparkles} colorKey="shop" />}
            title="Gemini API key"
            subtitle="Used for AI expense parsing"
            trailing={
              <View style={styles.trailing}>
                <AmountChip variant="muted">Not set</AmountChip>
                <ChevronRight size={18} color={theme.colors.onSurfaceDim} />
              </View>
            }
            onPress={comingSoon('Gemini API key')}
            hideDivider
          />
        </SettingsSection>

        {/* Data */}
        <SettingsSection label="Data">
          <ListItem
            leading={<RowIcon Icon={Tag} colorKey="fun" />}
            title="Categories"
            subtitle="Manage default and custom"
            trailing={<ChevronRight size={18} color={theme.colors.onSurfaceDim} />}
            onPress={comingSoon('Categories')}
          />
          <ListItem
            leading={<RowIcon Icon={DollarSign} colorKey="income" />}
            title="Exchange rates"
            subtitle="Currency conversion rates"
            trailing={<ChevronRight size={18} color={theme.colors.onSurfaceDim} />}
            onPress={comingSoon('Exchange rates')}
          />
          <ListItem
            leading={<RowIcon Icon={Download} colorKey="health" />}
            title="Export data"
            subtitle="Download all your data"
            trailing={<ChevronRight size={18} color={theme.colors.onSurfaceDim} />}
            onPress={comingSoon('Export')}
          />
          <ListItem
            leading={<RowIcon Icon={Upload} colorKey="transit" />}
            title="Import data"
            subtitle="From a backup file"
            trailing={<ChevronRight size={18} color={theme.colors.onSurfaceDim} />}
            onPress={comingSoon('Import')}
            hideDivider
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection label="Account">
          <ListItem
            leading={<RowIcon Icon={KeyRound} colorKey="bills" />}
            title="Change password"
            subtitle="Update your sign-in credentials"
            trailing={<ChevronRight size={18} color={theme.colors.onSurfaceDim} />}
            onPress={comingSoon('Password change')}
            hideDivider
          />
        </SettingsSection>

        <Button
          label={logout.isPending ? 'Logging out…' : 'Log out'}
          variant="danger"
          fullWidth
          disabled={logout.isPending}
          onPress={confirmLogout}
        />

        <Text style={styles.versionLine}>Enko · v1.0.0 (dev)</Text>
      </ScrollView>
    </View>
  );
}

// ──────────────────────────── Helpers ────────────────────────────

type CategoryColorKey = 'food' | 'transit' | 'shop' | 'fun' | 'health' | 'bills' | 'income';

function RowIcon({
  Icon,
  colorKey,
}: {
  Icon: LucideIcon;
  colorKey: CategoryColorKey;
}) {
  const theme = useTheme();
  const accent = theme.colors.category[colorKey];
  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: radii.md,
        backgroundColor: withAlpha(accent, 0.18),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={18} color={accent} strokeWidth={2} />
    </View>
  );
}

function withAlpha(hex: string, alpha: number): string {
  if (!hex.startsWith('#')) return hex;
  const clean = hex.slice(1);
  const [r, g, b] =
    clean.length === 3
      ? [clean[0] + clean[0], clean[1] + clean[1], clean[2] + clean[2]]
      : [clean.slice(0, 2), clean.slice(2, 4), clean.slice(4, 6)];
  return `rgba(${parseInt(r, 16)},${parseInt(g, 16)},${parseInt(b, 16)},${alpha})`;
}

// ──────────────────────────── Styles ────────────────────────────

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.surface },
    headerWrap: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    title: {
      ...typography.displayXL,
      color: theme.colors.onSurface,
    },
    body: {
      flexGrow: 1,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing['3xl'],
      gap: spacing.xl,
    },
    identityCard: {
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
    identityText: { flex: 1, gap: spacing.xs },
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
    trailing: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    trailingValue: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
      fontFamily: typography.button.fontFamily,
    },
    versionLine: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceDim,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  });
}

export default Profile;
