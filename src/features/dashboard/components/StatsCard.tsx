import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/theme/colors';

import type { DashboardSummary } from '../schemas';

export function StatsCard({ stats }: { stats: DashboardSummary['stats'] }) {
  const items = [
    { label: 'New today', value: stats.newToday },
    { label: 'Pending', value: stats.pending },
    { label: 'Urgent', value: stats.urgent },
  ];
  return (
    <View style={styles.card}>
      {items.map((item) => (
        <View
          key={item.label}
          style={styles.item}
          accessible
          accessibilityLabel={`${item.value} ${item.label}`}>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingVertical: 16,
  },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  value: { fontSize: 24, fontWeight: '600', color: colors.text },
  label: { fontSize: 15, color: colors.textSecondary },
});
