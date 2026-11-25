import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BrandSwitch, SettingsRow, SettingsSection } from '@/components/settings/SettingsList';
import { colors, radius } from '@/theme/colors';

import { SortableList } from '../components/SortableList';
import { useDashboardWidgets, useUpdateDashboardWidgets } from '../hooks';
import type { DashboardWidget } from '../schemas';

function alertsText(count: number) {
  return `${count} open alert${count === 1 ? '' : 's'}`;
}

export function CustomizeWidgetsScreen() {
  const { data, isPending, isError, error, refetch } = useDashboardWidgets();
  const save = useUpdateDashboardWidgets();
  const [dragging, setDragging] = useState(false);

  const widgets = data?.widgets ?? [];
  const visible = widgets.filter((w) => w.visible);
  const hidden = widgets.filter((w) => !w.visible);

  const commit = (nextVisible: DashboardWidget[], nextHidden: DashboardWidget[]) =>
    save.mutate({ widgets: [...nextVisible, ...nextHidden] });

  const hide = (widget: DashboardWidget) =>
    commit(
      visible.filter((w) => w.id !== widget.id),
      [{ ...widget, visible: false }, ...hidden],
    );

  const show = (widget: DashboardWidget) =>
    commit(
      [...visible, { ...widget, visible: true }],
      hidden.filter((w) => w.id !== widget.id),
    );

  const reorder = (orderedIds: string[]) =>
    commit(orderedIds.map((id) => visible.find((w) => w.id === id)!).filter(Boolean), hidden);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Customize Widgets" />
      <ScrollView contentContainerStyle={styles.content} scrollEnabled={!dragging}>
        <Text style={styles.hint}>Drag to reorder. Toggle to show or hide on your dashboard.</Text>

        {isPending ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : isError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{getErrorMessage(error)}</Text>
            <Button title="Try again" variant="secondary" onPress={() => refetch()} />
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ALERT TYPES</Text>
              <View style={styles.card}>
                {visible.length === 0 ? (
                  <Text style={styles.empty}>No widgets on your dashboard.</Text>
                ) : (
                  <SortableList
                    items={visible}
                    onReorder={reorder}
                    onDragStateChange={setDragging}
                    renderRow={(widget) => (
                      <>
                        <View style={styles.texts}>
                          <Text style={styles.label} numberOfLines={1}>
                            {widget.label}
                          </Text>
                          <Text style={styles.subtitle}>{alertsText(widget.openAlerts)}</Text>
                        </View>
                        {widget.locked && (
                          <Icon
                            name={{ ios: 'lock.fill', android: 'lock' }}
                            size={14}
                            color={colors.textMuted}
                          />
                        )}
                        <BrandSwitch
                          value
                          disabled={widget.locked}
                          onValueChange={() => hide(widget)}
                          accessibilityLabel={`Show ${widget.label} on dashboard`}
                        />
                      </>
                    )}
                  />
                )}
              </View>
            </View>

            {hidden.length > 0 && (
              <SettingsSection title="HIDDEN">
                {hidden.map((widget) => (
                  <SettingsRow
                    key={widget.id}
                    title={widget.label}
                    subtitle={alertsText(widget.openAlerts)}
                    disabled
                    right={
                      <BrandSwitch
                        value={false}
                        onValueChange={() => show(widget)}
                        accessibilityLabel={`Show ${widget.label} on dashboard`}
                      />
                    }
                  />
                ))}
              </SettingsSection>
            )}

            <Text style={styles.footer}>
              Locked widgets are required by your facility admin and can&apos;t be hidden.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 20, paddingBottom: 32 },
  hint: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  texts: { flex: 1, gap: 2 },
  label: { fontSize: 15, color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted },
  empty: { padding: 16, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  footer: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  loader: { marginTop: 40 },
  errorBox: { gap: 12 },
  errorText: { fontSize: 15, color: colors.danger, textAlign: 'center' },
});
