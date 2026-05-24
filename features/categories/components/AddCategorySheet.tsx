import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';

import { CategoryFormSchema } from '../categories.schemas';
import { useCreateCategory } from '../categories.mutations';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type Errors = {
  name?: string;
  icon?: string;
  color?: string;
};

// Curated emoji set covering common spending domains. Users tap to pick.
const ICON_OPTIONS = [
  '🍴', '🚗', '🏠', '⚡', '📶', '🔄', '🎬', '🛍️', '❤️', '🎓',
  '🎁', '✈️', '☕', '🐾', '💊', '👶', '💼', '🏋️', '🎨', '📚',
];

// Hex without '#' (matches backend CreateCategoryDto.color).
const COLOR_OPTIONS = [
  'F0A23B', '5DA8FF', 'C18AFF', 'FF7B9D', '71D9C8', '8A8FA8', '9FE870', 'FFB347',
];

/**
 * Bottom sheet for creating a custom category. Mirrors AddExpenseSheet's
 * layout (header X, scroll body, sticky footer with Cancel/Save) so users
 * get one consistent sheet shape across the app.
 *
 * Validation runs on submit via the shared CategoryFormSchema — name is
 * required, icon defaults to the first emoji, color defaults to the first
 * swatch.
 */
export function AddCategorySheet({ visible, onClose }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const create = useCreateCategory();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>(ICON_OPTIONS[0]);
  const [color, setColor] = useState<string>(COLOR_OPTIONS[0]);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!visible) return;
    setName('');
    setIcon(ICON_OPTIONS[0]);
    setColor(COLOR_OPTIONS[0]);
    setErrors({});
  }, [visible]);

  const submitting = create.isPending;

  const submit = async () => {
    const parsed = CategoryFormSchema.safeParse({
      name,
      icon,
      color,
    });

    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof Errors;
        if (path && !next[path]) next[path] = issue.message;
      }
      setErrors(next);
      return;
    }

    try {
      await create.mutateAsync({
        name: parsed.data.name,
        icon: parsed.data.icon || undefined,
        color: parsed.data.color || undefined,
      });
      onClose();
    } catch {
      // Toast handled in mutation; keep sheet open for retry.
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'formSheet' : 'fullScreen'}
      onRequestClose={onClose}
      transparent={false}
    >
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <View style={styles.header}>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
              accessibilityLabel="Close"
            >
              <X size={20} color={theme.colors.onSurface} strokeWidth={2.2} />
            </Pressable>
            <Text style={styles.title}>New category</Text>
            <View style={styles.iconBtn} />
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.preview}>
              <View
                style={[
                  styles.previewIcon,
                  { backgroundColor: `#${color}22`, borderColor: `#${color}` },
                ]}
              >
                <Text style={styles.previewEmoji}>{icon}</Text>
              </View>
              <Text style={styles.previewName}>{name.trim() || 'Untitled'}</Text>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Name</Text>
              <View style={styles.inputWrap}>
                <Input
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
                  }}
                  placeholder="e.g. Coffee runs"
                  maxLength={50}
                  autoCapitalize="sentences"
                  returnKeyType="done"
                />
              </View>
              {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Icon</Text>
              <View style={styles.iconGrid}>
                {ICON_OPTIONS.map((emoji) => {
                  const selected = emoji === icon;
                  return (
                    <Pressable
                      key={emoji}
                      onPress={() => setIcon(emoji)}
                      style={({ pressed }) => [
                        styles.iconChip,
                        selected && styles.iconChipSelected,
                        pressed && { opacity: 0.85 },
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`Icon ${emoji}`}
                    >
                      <Text style={styles.iconChipEmoji}>{emoji}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Color</Text>
              <View style={styles.colorRow}>
                {COLOR_OPTIONS.map((hex) => {
                  const selected = hex === color;
                  return (
                    <Pressable
                      key={hex}
                      onPress={() => setColor(hex)}
                      style={({ pressed }) => [
                        styles.colorChip,
                        {
                          backgroundColor: `#${hex}`,
                          borderColor: selected ? theme.colors.onSurface : 'transparent',
                        },
                        pressed && { opacity: 0.85 },
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`Color ${hex}`}
                    />
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button label="Cancel" variant="ghost" onPress={onClose} style={styles.cancelBtn} />
            <Button
              label={submitting ? 'Adding…' : 'Add category'}
              onPress={submit}
              loading={submitting}
              disabled={submitting}
              style={styles.saveBtn}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.surface },
    flex: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing['2xl'],
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      ...typography.titleLG,
      color: theme.colors.onSurface,
    },
    body: {
      paddingHorizontal: spacing['2xl'],
      paddingBottom: spacing['2xl'],
      gap: spacing.xl,
    },
    preview: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.lg,
    },
    previewIcon: {
      width: 72,
      height: 72,
      borderRadius: radii.xl,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    previewEmoji: { fontSize: 32 },
    previewName: {
      ...typography.titleMD,
      color: theme.colors.onSurface,
    },
    fieldBlock: { gap: spacing.sm },
    fieldLabel: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
      paddingHorizontal: spacing.xs,
    },
    inputWrap: {
      backgroundColor: theme.colors.surface2,
      borderRadius: radii.lg,
      paddingHorizontal: spacing.lg,
    },
    iconGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    iconChip: {
      width: 44,
      height: 44,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    iconChipSelected: {
      borderColor: theme.colors.brand,
      backgroundColor: theme.colors.surface1,
    },
    iconChipEmoji: { fontSize: 20 },
    colorRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    colorChip: {
      width: 36,
      height: 36,
      borderRadius: radii.pill,
      borderWidth: 3,
    },
    error: {
      ...typography.bodySm,
      color: theme.colors.chipNegOn,
      paddingHorizontal: spacing.xs,
    },
    footer: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing['2xl'],
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.outlineSoft,
    },
    cancelBtn: { flex: 1 },
    saveBtn: { flex: 2 },
  });
}
