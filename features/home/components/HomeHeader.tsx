import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, Settings } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';

type Props = {
  greeting: string;
  name: string;
  onPressNotifications?: () => void;
  onPressSettings?: () => void;
  hasUnreadNotifications?: boolean;
};

/**
 * Home greeting row. Time-aware greeting on the left, two icon buttons
 * (notifications, settings) on the right.
 */
export function HomeHeader({
  greeting,
  name,
  onPressNotifications,
  onPressSettings,
  hasUnreadNotifications,
}: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.greeting}>{greeting},</Text>
        <Text style={styles.name}>{name}.</Text>
      </View>
      <View style={styles.actions}>
        <IconButton onPress={onPressNotifications} showDot={hasUnreadNotifications}>
          <Bell size={20} color={theme.colors.onSurface} strokeWidth={2} />
        </IconButton>
        <IconButton onPress={onPressSettings}>
          <Settings size={20} color={theme.colors.onSurface} strokeWidth={2} />
        </IconButton>
      </View>
    </View>
  );
}

function IconButton({
  onPress,
  showDot,
  children,
}: {
  onPress?: () => void;
  showDot?: boolean;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: 40,
          height: 40,
          borderRadius: radii.lg,
          backgroundColor: theme.colors.surface1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        pressed && { opacity: 0.7 },
      ]}
      accessibilityRole="button"
    >
      {children}
      {showDot ? (
        <View
          style={{
            position: 'absolute',
            top: 9,
            right: 11,
            width: 7,
            height: 7,
            borderRadius: 999,
            backgroundColor: theme.colors.brand,
            borderWidth: 1.5,
            borderColor: theme.colors.surface1,
          }}
        />
      ) : null}
    </Pressable>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    greeting: {
      ...typography.body,
      color: theme.colors.onSurfaceMuted,
    },
    name: {
      ...typography.displayLG,
      color: theme.colors.onSurface,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
  });
}
