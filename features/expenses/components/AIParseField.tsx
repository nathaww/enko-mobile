import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { Input } from '@/components/Input';
import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { useParseExpense } from '../expenses.mutations';
import type { ParsedExpense } from '../expenses.types';
import { radii, spacing, typography } from '@/theme';

type Props = {
  onParsed: (result: ParsedExpense) => void;
};

/**
 * "Describe it" field — the AI shortcut for users who'd rather type natural
 * language than fill four pickers. On parse success, calls `onParsed` with
 * the structured fields so the parent sheet can pre-fill amount/category/
 * source/notes.
 */
export function AIParseField({ onParsed }: Props) {
  const theme = useTheme();
  const haptic = useHaptic();
  const parse = useParseExpense();
  const [text, setText] = useState('');
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const handleParse = async () => {
    if (!text.trim()) return;
    haptic('light');
    try {
      const result = await parse.mutateAsync(text.trim());
      onParsed(result);
      setText('');
    } catch {
      // Toast surfaced by the mutation onError.
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Sparkles size={14} color={theme.colors.brand} strokeWidth={2.4} />
        </View>
        <Text style={styles.label}>Or describe it</Text>
      </View>
      <View style={styles.field}>
        <Input
          value={text}
          onChangeText={setText}
          placeholder="Coffee 80 birr at CBE"
          multiline
          style={styles.input}
        />
        <Pressable
          onPress={handleParse}
          disabled={!text.trim() || parse.isPending}
          style={({ pressed }) => [
            styles.button,
            (!text.trim() || parse.isPending) && styles.buttonDisabled,
            pressed && { opacity: 0.8 },
          ]}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {parse.isPending ? 'Parsing…' : 'Parse'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { gap: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    iconWrap: {
      width: 22,
      height: 22,
      borderRadius: radii.sm,
      backgroundColor: theme.colors.brandSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: theme.colors.surface2,
      borderRadius: radii.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    input: {
      flex: 1,
      maxHeight: 80,
    },
    button: {
      backgroundColor: theme.colors.brand,
      borderRadius: radii.pill,
      paddingHorizontal: spacing.md + 2,
      paddingVertical: spacing.sm + 1,
      marginBottom: spacing.xs,
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: {
      ...typography.button,
      color: theme.colors.onBrand,
      fontSize: 12,
    },
  });
}
