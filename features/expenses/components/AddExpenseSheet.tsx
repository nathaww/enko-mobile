import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { X, Trash2 } from 'lucide-react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { radii, spacing, typography } from '@/theme';
import { listCategories } from '@/features/categories/categories-api';
import { categoriesQueryKeys } from '@/features/categories/categories.queryKeys';
import { listMoneySources } from '@/features/money-sources/money-sources-api';
import { moneySourcesQueryKeys } from '@/features/money-sources/money-sources.queryKeys';

import { ExpenseFormSchema } from '../expenses.schemas';
import {
  useCreateExpense,
  useDeleteExpense,
  useUpdateExpense,
} from '../expenses.mutations';
import type { Expense } from '../expenses.types';

import { AmountInput } from './AmountInput';
import { AIParseField } from './AIParseField';
import { PickerChips } from './PickerChips';
import { DateField } from './DateField';

type Props = {
  visible: boolean;
  /** When set, the sheet opens in edit mode pre-filled from this expense. */
  editing?: Expense | null;
  onClose: () => void;
};

type Errors = {
  amount?: string;
  categoryId?: string;
  moneySourceId?: string;
};

/**
 * Single sheet for both creating and editing expenses. State machine:
 *   - props.editing === null/undefined → "Add expense" + Save
 *   - props.editing !== null         → "Edit expense" + Save + Delete
 *
 * Validation: light Zod parse on submit (the schemas file owns the rules).
 * We don't reach for Formik here — the form has ~5 fields with custom UI,
 * so plain useState is more honest than wiring Formik against non-standard
 * inputs (chip pickers, the AI parse field).
 */
export function AddExpenseSheet({ visible, editing, onClose }: Props) {
  const theme = useTheme();
  const toast = useToast();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const categoriesQ = useQuery({
    queryKey: categoriesQueryKeys.list(),
    queryFn: listCategories,
  });
  const sourcesQ = useQuery({
    queryKey: moneySourcesQueryKeys.list(),
    queryFn: listMoneySources,
  });

  const create = useCreateExpense();
  const update = useUpdateExpense();
  const del = useDeleteExpense();

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [sourceId, setSourceId] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const isEditing = !!editing;

  // Reset form whenever the sheet (re)opens. In edit mode we pre-fill from
  // the expense; in add mode we pick sensible defaults (default money source
  // when available, today's date, empty fields).
  useEffect(() => {
    if (!visible) return;
    setErrors({});
    if (editing) {
      setAmount(String(editing.amount));
      // The backend's ExpenseDto excludes the raw foreign-key fields and only
      // returns the nested `category` and `moneySource` objects. Read IDs
      // through them and fall back to the (possibly undefined) raw fields
      // for dev-stub responses.
      setCategoryId(editing.category?.id ?? editing.categoryId ?? '');
      setSourceId(editing.moneySource?.id ?? editing.moneySourceId ?? '');
      setDate(new Date(editing.date));
      setNotes(editing.notes ?? '');
    } else {
      setAmount('');
      setCategoryId(categoriesQ.data?.[0]?.id ?? '');
      const defaultSource =
        sourcesQ.data?.find((s) => s.isDefault) ?? sourcesQ.data?.[0];
      setSourceId(defaultSource?.id ?? '');
      setDate(new Date());
      setNotes('');
    }
    // Only re-run when visibility or the editing target flips. Picker data is
    // intentionally NOT a dependency — we don't want defaults to clobber the
    // user's selections after the data loads in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, editing?.id]);

  const submitting = create.isPending || update.isPending;

  const submit = async () => {
    const parsed = ExpenseFormSchema.safeParse({
      amount,
      date: date.toISOString(),
      notes: notes.trim() || undefined,
      categoryId,
      moneySourceId: sourceId,
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
        await update.mutateAsync({ id: editing.id, data: parsed.data });
      } else {
        await create.mutateAsync(parsed.data);
      }
      onClose();
    } catch {
      // Toast already shown by the mutation; keep sheet open so user can retry.
    }
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert(
      'Delete expense?',
      'This cannot be undone.',
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

  const onAIParsed = (result: {
    amount: number;
    date?: string;
    notes?: string;
    categoryId?: string;
    moneySourceId?: string;
  }) => {
    setAmount(String(result.amount));
    if (result.categoryId) setCategoryId(result.categoryId);
    if (result.moneySourceId) setSourceId(result.moneySourceId);
    if (result.notes) setNotes(result.notes);
    if (result.date) setDate(new Date(result.date));
    setErrors({});
    toast('success', { title: 'Parsed', description: 'Review the details and save.' });
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
          {/* Header */}
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
              {isEditing ? 'Edit expense' : 'Add expense'}
            </Text>
            {isEditing ? (
              <Pressable
                onPress={confirmDelete}
                hitSlop={8}
                style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
                accessibilityLabel="Delete expense"
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
            <AmountInput
              value={amount}
              onChange={setAmount}
              error={errors.amount}
              autoFocus={!isEditing}
            />

            {!isEditing ? <AIParseField onParsed={onAIParsed} /> : null}

            <View style={styles.fieldBlock}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>Category</Text>
                <Pressable
                  onPress={() => {
                    onClose();
                    router.push('/categories');
                  }}
                  hitSlop={6}
                  accessibilityRole="button"
                >
                  <Text style={styles.fieldLink}>Manage →</Text>
                </Pressable>
              </View>
              <PickerChips
                options={
                  categoriesQ.data?.map((c) => ({
                    id: c.id,
                    label: c.name,
                    icon: c.icon,
                  })) ?? []
                }
                value={categoryId}
                onChange={(id) => {
                  setCategoryId(id);
                  setErrors((e) => ({ ...e, categoryId: undefined }));
                }}
                loading={categoriesQ.isLoading}
                emptyText="No categories yet."
                emptyActionLabel="Add"
                onEmptyAction={() => {
                  onClose();
                  router.push('/categories');
                }}
              />
              {errors.categoryId ? <Text style={styles.error}>{errors.categoryId}</Text> : null}
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Source</Text>
              <PickerChips
                options={
                  sourcesQ.data?.map((s) => ({
                    id: s.id,
                    label: s.name,
                    icon: s.icon,
                  })) ?? []
                }
                value={sourceId}
                onChange={(id) => {
                  setSourceId(id);
                  setErrors((e) => ({ ...e, moneySourceId: undefined }));
                }}
                loading={sourcesQ.isLoading}
                emptyText="No money sources yet."
                emptyActionLabel="Add"
                onEmptyAction={() => {
                  // TODO: route to money-sources management when that screen ships
                  onClose();
                }}
              />
              {errors.moneySourceId ? (
                <Text style={styles.error}>{errors.moneySourceId}</Text>
              ) : null}
            </View>

            <DateField value={date} onChange={setDate} />

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Notes</Text>
              <Input
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional…"
                multiline
                style={styles.notesInput}
              />
            </View>
          </ScrollView>

          {/* Footer */}
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
                  : 'Save expense'
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
    fieldBlock: { gap: spacing.sm },
    fieldHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xs,
    },
    fieldLabel: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
      paddingHorizontal: spacing.xs,
    },
    fieldLink: {
      ...typography.bodySm,
      color: theme.colors.brand,
      fontFamily: typography.button.fontFamily,
    },
    notesInput: {
      backgroundColor: theme.colors.surface2,
      borderRadius: radii.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      minHeight: 56,
      maxHeight: 120,
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
