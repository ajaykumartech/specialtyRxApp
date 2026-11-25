import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { colors, radius } from '@/theme/colors';

import type { AlertCategory } from '../schemas';

const COLUMNS = 3;

const CATEGORY_ICONS: Record<string, IconName> = {
  authorization: { ios: 'checkmark.shield.fill', android: 'verified_user' },
  clarification: { ios: 'text.bubble.fill', android: 'chat' },
  non_covered: { ios: 'nosign', android: 'block' },
  prior_auth: { ios: 'doc.text.fill', android: 'description' },
  high_cost: { ios: 'dollarsign.circle.fill', android: 'paid' },
  admission_review: { ios: 'waveform.path.ecg', android: 'monitor_heart' },
  refill_too_soon: { ios: 'clock.arrow.circlepath', android: 'history' },
  narcotics_refill: { ios: 'pills.fill', android: 'medication' },
  therapeutic_interchange: { ios: 'arrow.left.arrow.right', android: 'swap_horiz' },
  pump_pickup: { ios: 'cross.vial.fill', android: 'vaccines' },
  alf_new_script: { ios: 'doc.badge.plus', android: 'note_add' },
};
const FALLBACK_ICON: IconName = {
  ios: 'exclamationmark.circle.fill',
  android: 'error',
};

type Props = {
  categories: AlertCategory[];
  onPressCategory: (category: AlertCategory) => void;
};

export function AlertCategoryGrid({ categories, onPressCategory }: Props) {
  const rows: (AlertCategory | null)[][] = [];
  for (let i = 0; i < categories.length; i += COLUMNS) {
    const row: (AlertCategory | null)[] = categories.slice(i, i + COLUMNS);
    while (row.length < COLUMNS) row.push(null);
    rows.push(row);
  }

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((category, colIndex) =>
            category ? (
              <Pressable
                key={category.id}
                onPress={() => onPressCategory(category)}
                accessibilityRole="button"
                accessibilityLabel={`${category.label}, ${category.count} alerts${category.hasUnread ? ', unread' : ''}`}
                style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
                {category.hasUnread && <View style={styles.dot} />}
                <Icon
                  name={CATEGORY_ICONS[category.id] ?? FALLBACK_ICON}
                  size={22}
                  color={colors.primaryMuted}
                />
                <Text style={styles.count}>{category.count}</Text>
                <Text style={styles.label} numberOfLines={2}>
                  {category.label}
                </Text>
              </Pressable>
            ) : (
              <View key={`empty-${colIndex}`} style={styles.empty} />
            ),
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  tile: {
    flex: 1,
    minHeight: 132,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 6,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  empty: { flex: 1 },
  dot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.unreadDot,
  },
  count: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginTop: 'auto',
  },
  label: { fontSize: 14, color: colors.textSecondary },
});
