import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Logo } from '@/components/Logo';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SettingsRow, SettingsSection } from '@/components/settings/SettingsList';
import { envLabel } from '@/config/env';
import { colors } from '@/theme/colors';

import { useAppInfo } from '../hooks';

/** Returns true when `a` is an older version than `b` (e.g. 1.2.0 < 1.10.0). */
function isOlder(a: string, b: string) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff < 0;
  }
  return false;
}

export function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '0.0.0';
  const { data: info, refetch, isFetching } = useAppInfo();

  const checkForUpdates = async () => {
    const { data } = await refetch();
    if (!data) {
      Alert.alert('Check for updates', 'Could not check for updates. Please try again.');
    } else if (isOlder(version, data.latestVersion)) {
      Alert.alert('Update available', `Version ${data.latestVersion} is available in the store.`);
    } else {
      Alert.alert('You’re up to date', `Specialty365 ${version} is the latest version.`);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="About" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <Logo size={38} />
          <Text style={styles.version}>
            Version {version} • {envLabel}
          </Text>
        </View>

        {info && info.whatsNew.highlights.length > 0 && (
          <Card style={styles.whatsNew}>
            <Text style={styles.sectionTitle}>WHAT&apos;S NEW IN {info.whatsNew.version}</Text>
            {info.whatsNew.highlights.map((item) => (
              <View key={item} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </Card>
        )}

        <SettingsSection title="DETAILS">
          <SettingsRow
            title="Release notes"
            onPress={() => info && WebBrowser.openBrowserAsync(info.releaseNotesUrl)}
          />
          <SettingsRow
            title={isFetching ? 'Checking…' : 'Check for updates'}
            onPress={checkForUpdates}
          />
          <SettingsRow title="Environment" value={envLabel} />
        </SettingsSection>

        <Text style={styles.footer}>© Specialty365</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 24, paddingBottom: 32 },
  brand: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  version: { fontSize: 15, color: colors.textSecondary },
  whatsNew: { gap: 10 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primaryMuted,
    marginTop: 8,
  },
  bulletText: { flex: 1, fontSize: 15, lineHeight: 21, color: colors.text },
  footer: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 24 },
});
