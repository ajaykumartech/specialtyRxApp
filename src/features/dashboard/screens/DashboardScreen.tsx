import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, radius } from '@/theme/colors';

import { AlertCategoryGrid } from '../components/AlertCategoryGrid';
import { DeliveryTrackingCard } from '../components/DeliveryTrackingCard';
import { StatsCard } from '../components/StatsCard';
import { useDashboardSummary } from '../hooks';

export function DashboardScreen() {
  const [search, setSearch] = useState('');
  const [hideResolved, setHideResolved] = useState(true);
  const { data, isPending, isError, error, refetch, isRefetching } =
    useDashboardSummary(hideResolved);

  const subtitle = data ? `${data.scopeLabel} · ${data.openAlerts} open alerts` : undefined;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="SpecialtyRX" subtitle={subtitle} showBack={false} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
            tintColor={colors.primary}
          />
        }>
        <View style={styles.search}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            accessibilityLabel="Search patients, alerts and packing slips"
          />
          <Icon
            name={{ ios: 'magnifyingglass', android: 'search' }}
            size={18}
            color={colors.info}
          />
        </View>

        <View style={styles.filters}>
          <View style={styles.toggle}>
            <Text style={styles.toggleLabel}>Hide Resolved</Text>
            <Switch
              value={hideResolved}
              onValueChange={setHideResolved}
              trackColor={{ true: colors.primary, false: colors.border }}
              accessibilityLabel="Hide resolved alerts"
            />
          </View>
          <Pressable
            style={({ pressed }) => [styles.filterButton, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="Facility filter">
            <Icon
              name={{ ios: 'slider.horizontal.3', android: 'tune' }}
              size={16}
              color={colors.text}
            />
            <Text style={styles.filterText}>Facility Filter</Text>
          </Pressable>
        </View>

        {isPending ? (
          <ActivityIndicator style={styles.loader} color={colors.primary} />
        ) : isError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {getErrorMessage(error, 'Could not load the dashboard.')}
            </Text>
            <Button title="Try again" variant="secondary" onPress={() => refetch()} />
          </View>
        ) : (
          <>
            <StatsCard stats={data.stats} />
            <DeliveryTrackingCard currentStep={data.delivery.currentStep} />
            <Text style={styles.sectionTitle}>ALERT CATEGORIES</Text>
            <AlertCategoryGrid
              categories={data.alertCategories}
              onPressCategory={(category) =>
                router.push({
                  pathname: '/alerts',
                  params: { category: category.id },
                })
              }
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, minHeight: 46, fontSize: 15, color: colors.text },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleLabel: { fontSize: 15, color: colors.textSecondary },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: { fontSize: 14, color: colors.textSecondary },
  sectionTitle: {
    fontSize: 14,
    letterSpacing: 1,
    color: colors.textSecondary,
    marginTop: 8,
  },
  loader: { marginTop: 48 },
  errorBox: { gap: 12, marginTop: 24 },
  errorText: { fontSize: 15, color: colors.danger, textAlign: 'center' },
});
