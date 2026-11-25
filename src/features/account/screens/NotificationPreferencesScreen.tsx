import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BrandSwitch, SettingsRow, SettingsSection } from '@/components/settings/SettingsList';
import { colors, radius } from '@/theme/colors';

import { useNotificationPreferences, useUpdateNotificationPreferences } from '../hooks';
import type { NotificationPreferences } from '../schemas';

const CHANNELS = [
  { key: 'push', label: 'Push' },
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
] as const;

export function NotificationPreferencesScreen() {
  const { data: prefs, isPending, isError, error, refetch } = useNotificationPreferences();
  const save = useUpdateNotificationPreferences();

  const update = (patch: Partial<NotificationPreferences>) => {
    if (prefs) save.mutate({ ...prefs, ...patch });
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Notification Preferences" />
      {isPending ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : isError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{getErrorMessage(error)}</Text>
          <Button title="Try again" variant="secondary" onPress={() => refetch()} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.channels}>
            {CHANNELS.map(({ key, label }) => (
              <View key={key} style={styles.channel}>
                <BrandSwitch
                  value={prefs.channels[key]}
                  onValueChange={(value) =>
                    update({ channels: { ...prefs.channels, [key]: value } })
                  }
                  accessibilityLabel={`${label} notifications`}
                />
                <Text style={styles.channelLabel}>{label}</Text>
              </View>
            ))}
          </View>

          <SettingsSection title="ALERT TYPES">
            {prefs.alertTypes.map((type) => (
              <SettingsRow
                key={type.id}
                title={type.label}
                subtitle={`${type.openAlerts} open alert${type.openAlerts === 1 ? '' : 's'}`}
                right={
                  <BrandSwitch
                    value={type.enabled}
                    onValueChange={(enabled) =>
                      update({
                        alertTypes: prefs.alertTypes.map((t) =>
                          t.id === type.id ? { ...t, enabled } : t,
                        ),
                      })
                    }
                    accessibilityLabel={`${type.label} notifications`}
                  />
                }
              />
            ))}
          </SettingsSection>

          <SettingsSection title="OPERATIONS">
            <SettingsRow
              title="Packing Slips"
              subtitle="New slip available"
              right={
                <BrandSwitch
                  value={prefs.operations.packingSlips}
                  onValueChange={(packingSlips) =>
                    update({ operations: { ...prefs.operations, packingSlips } })
                  }
                  accessibilityLabel="Packing slip notifications"
                />
              }
            />
            <SettingsRow
              title="Delivery updates"
              subtitle="Out for delivery, delivered"
              right={
                <BrandSwitch
                  value={prefs.operations.deliveryUpdates}
                  onValueChange={(deliveryUpdates) =>
                    update({ operations: { ...prefs.operations, deliveryUpdates } })
                  }
                  accessibilityLabel="Delivery update notifications"
                />
              }
            />
          </SettingsSection>

          <SettingsSection title="QUIET HOURS">
            <SettingsRow
              title={prefs.quietHours.label}
              subtitle="Urgent alerts still come through"
              right={
                <BrandSwitch
                  value={prefs.quietHours.enabled}
                  onValueChange={(enabled) =>
                    update({ quietHours: { ...prefs.quietHours, enabled } })
                  }
                  accessibilityLabel="Quiet hours"
                />
              }
            />
          </SettingsSection>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 20, paddingBottom: 32 },
  channels: { flexDirection: 'row', gap: 10 },
  channel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  channelLabel: { fontSize: 14, color: colors.textSecondary },
  loader: { marginTop: 40 },
  errorBox: { gap: 12, padding: 16 },
  errorText: { fontSize: 15, color: colors.danger, textAlign: 'center' },
});
