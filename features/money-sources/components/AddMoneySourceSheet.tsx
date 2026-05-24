import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Trash2, X } from 'lucide-react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { radii, spacing, typography } from '@/theme';

import { MoneySourceFormSchema } from '../money-sources.schemas';
import {
  useCreateMoneySource,
  useDeleteMoneySource,
  useUpdateMoneySource,
} from '../money-sources.mutations';
import type { MoneySource } from '../money-sources.types';

type Props = {
  visible: boolean;
  /** When set, the sheet opens in edit mode pre-filled from this account. */
  editing?: MoneySource | null;
  onClose: () => void;
};

type Errors = {
  name?: string;
  balance?: string;
  currency?: string;
  budget?: string;
};

// Common account kinds. Tap to pick — emoji is stored on the source so the
// list rows can render it without a lookup table.
const ICON_OPTIONS = ['🏦', '💵', '💳', '📱', '💰', '🪙', '🏧', '💼'];

// Short list of currencies seen in-product. Backend accepts any 3-letter code.
const CURRENCY_OPTIONS = ['ETB', 'USD', 'EUR', 'GBP'];

/**
 * Single sheet for both creating and editing money sources. Mirrors the
 * AddExpenseSheet state-machine (editing null → "Add", set → "Edit" + Delete)
 * so the CRUD shape stays consistent across the app.
 */
export function AddMoneySourceSheet({ visible, editing, onClose }: Props) {
  const theme = useTheme();
  const haptic = useHaptic();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const create = useCreateMoneySource();
  const update = useUpdateMoneySource();
  const del = useDeleteMoneySource();

  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState<string>(CURRENCY_OPTIONS[0]);
  const [icon, setIcon] = useState<string>(ICON_OPTIONS[0]);
  const [budget, setBudget] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const isEditing = !!editing;

  useEffect(() => {
    if (!visible) return;
    setErrors({});
    if (editing) {
      setName(editing.name);
      setBalance(String(editing.balance));
      setCurrency(editing.currency);
      setIcon(editing.icon ?? ICON_OPTIONS[0]);
      setBudget(editing.budget ? String(editing.budget) : '');
      setIsDefault(editing.isDefault);
    } else {
      setName('');
      setBalance('');
      setCurrency(CURRENCY_OPTIONS[0]);
      setIcon(ICON_OPTIONS[0]);
      setBudget('');
      setIsDefault(false);
    }
  }, [visible, editing?.id]);

  const submitting = create.isPending || update.isPending;

  const sanitizeNumber = (raw: string): string => {
    let s = raw.replace(/[^\d.]/g, '');
    const firstDot = s.indexOf('.');
    if (firstDot !== -1) {
      s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
    }
    const [whole, frac] = s.split('.');
    if (frac !== undefined && frac.length > 2) s = `${whole}.${frac.slice(0, 2)}`;
    return s;
  };

  const submit = async () => {
    const parsed = MoneySourceFormSchema.safeParse({
      name,
      balance,
      currency,
      icon,
      budget: budget.trim() === '' ? 0 : budget,
      isDefault,
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
      if (isEditing && editing) {
        await update.mutateAsync({
          id: editing.id,
          data: {
            name: parsed.data.name,
            balance: parsed.data.balance,
            currency: parsed.data.currency,
            icon: parsed.data.icon || undefined,
            budget: parsed.data.budget,
            isDefault: parsed.data.isDefault,
          },
        });
      } else {
        await create.mutateAsync({
          name: parsed.data.name,
          balance: parsed.data.balance,
          currency: parsed.data.currency,
          icon: parsed.data.icon || undefined,
          budget: parsed.data.budget,
          isDefault: parsed.data.isDefault,
        });
      }
      onClose();
    } catch {
      // Toast handled in mutation; keep sheet open so user can retry.
    }
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert(
      'Delete account?',
      'Expenses recorded against it will keep their record but lose this label.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await del.mutateAsync(editing.id);
              onClose();
            } catch {
              // Toast handles error.
            }
          },
        },
      ],
      { cancelable: true }
    );
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
            <Text style={styles.title}>
              {isEditing ? 'Edit account' : 'New account'}
            </Text>
            {isEditing ? (
              <Pressable
                onPress={confirmDelete}
                hitSlop={8}
                style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
                accessibilityLabel="Delete account"
                disabled={del.isPending}
              >
                <Trash2 size={20} color={theme.colors.chipNegOn} strokeWidth={2.2} />
              </Pressable>
            ) : (
              <View style={styles.iconBtn} />
            )}
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.preview}>
              <View style={styles.previewIcon}>
                <Text style={styles.previewEmoji}>{icon}</Text>
              </View>
              <Text style={styles.previewName}>{name.trim() || 'Untitled'}</Text>
              <Text style={styles.previewBalance}>
                {currency} {balance.trim() || '0'}
              </Text>
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
                  placeholder="e.g. CBE checking"
                  maxLength={50}
                  autoCapitalize="words"
                  returnKeyType="next"
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
                      onPress={() => {
                        haptic('selection');
                        setIcon(emoji);
                      }}
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

            <View style={styles.row2}>
              <View style={[styles.fieldBlock, styles.flex]}>
                <Text style={styles.fieldLabel}>Balance</Text>
                <View style={styles.inputWrap}>
                  <Input
                    value={balance}
                    onChangeText={(t) => {
                      setBalance(sanitizeNumber(t));
                      if (errors.balance) setErrors((e) => ({ ...e, balance: undefined }));
                    }}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
                {errors.balance ? <Text style={styles.error}>{errors.balance}</Text> : null}
              </View>

              <View style={[styles.fieldBlock, { width: 120 }]}>
                <Text style={styles.fieldLabel}>Currency</Text>
                <View style={styles.currencyRow}>
                  {CURRENCY_OPTIONS.map((code) => {
                    const selected = code === currency;
                    return (
                      <Pressable
                        key={code}
                        onPress={() => {
                          haptic('selection');
                          setCurrency(code);
                        }}
                        style={({ pressed }) => [
                          styles.currencyChip,
                          selected && styles.currencyChipSelected,
                          pressed && { opacity: 0.85 },
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                      >
                        <Text
                          style={[
                            styles.currencyText,
                            selected && styles.currencyTextSelected,
                          ]}
                        >
                          {code}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Monthly budget · optional</Text>
              <View style={styles.inputWrap}>
                <Input
                  value={budget}
                  onChangeText={(t) => {
                    setBudget(sanitizeNumber(t));
                    if (errors.budget) setErrors((e) => ({ ...e, budget: undefined }));
                  }}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>
              {errors.budget ? <Text style={styles.error}>{errors.budget}</Text> : null}
            </View>

            <View style={styles.defaultRow}>
              <View
                style={[
                  styles.defaultIcon,
                  isDefault && { backgroundColor: theme.colors.brand },
                ]}
              >
                <Star
                  size={18}
                  color={isDefault ? theme.colors.onBrand : theme.colors.onSurfaceMuted}
                  strokeWidth={2}
                  fill={isDefault ? theme.colors.onBrand : 'transparent'}
                />
              </View>
              <View style={styles.flex}>
                <Text style={styles.defaultTitle}>Default account</Text>
                <Text style={styles.defaultHint}>
                  {isEditing && editing?.isDefault
                    ? 'Set another account as default to change.'
                    : 'New expenses default to this source.'}
                </Text>
              </View>
              <Switch
                value={isDefault}
                onValueChange={(next) => {
                  haptic('selection');
                  // Can't demote the existing default from this toggle —
                  // user picks a new default by promoting another account.
                  if (isEditing && editing?.isDefault) return;
                  setIsDefault(next);
                }}
                disabled={isEditing && editing?.isDefault}
                trackColor={{
                  false: theme.colors.surface2,
                  true: theme.colors.brand,
                }}
                thumbColor={theme.colors.surface}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button label="Cancel" variant="ghost" onPress={onClose} style={styles.cancelBtn} />
            <Button
              label={
                submitting
                  ? isEditing
                    ? 'Saving…'
                    : 'Adding…'
                  : isEditing
                  ? 'Save changes'
                  : 'Add account'
              }
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
      gap: spacing.xs,
      paddingVertical: spacing.lg,
    },
    previewIcon: {
      width: 72,
      height: 72,
      borderRadius: radii.xl,
      backgroundColor: theme.colors.brandSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewEmoji: { fontSize: 34 },
    previewName: {
      ...typography.titleMD,
      color: theme.colors.onSurface,
    },
    previewBalance: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
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
      width: 48,
      height: 48,
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
    iconChipEmoji: { fontSize: 22 },
    row2: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'flex-start',
    },
    currencyRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    currencyChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface2,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    currencyChipSelected: {
      backgroundColor: theme.colors.brand,
      borderColor: theme.colors.brand,
    },
    currencyText: {
      ...typography.bodySm,
      color: theme.colors.onSurface,
      fontFamily: typography.button.fontFamily,
      fontSize: 12,
    },
    currencyTextSelected: {
      color: theme.colors.onBrand,
    },
    defaultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: theme.colors.surface1,
      borderRadius: radii.lg,
      padding: spacing.lg,
    },
    defaultIcon: {
      width: 40,
      height: 40,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    defaultTitle: {
      ...typography.body,
      color: theme.colors.onSurface,
      fontFamily: typography.button.fontFamily,
    },
    defaultHint: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
      fontSize: 12,
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
