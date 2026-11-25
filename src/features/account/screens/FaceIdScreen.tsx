import { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BrandSwitch, SettingsRow, SettingsSection } from '@/components/settings/SettingsList';
import { useBiometricSupport } from '@/features/auth/hooks';
import { authenticateWithBiometrics, BIOMETRIC_LABEL } from '@/services/biometrics';
import { colors } from '@/theme/colors';

import { useBiometricSettings } from '../biometricSettings';

export function FaceIdScreen() {
  const { data: biometrics } = useBiometricSupport();
  const settings = useBiometricSettings();
  const { isLoaded, load } = settings;

  useEffect(() => {
    if (!isLoaded) load();
  }, [isLoaded, load]);

  const label = biometrics?.label ?? BIOMETRIC_LABEL;
  const usable = !!biometrics?.hasHardware && !!biometrics.isEnrolled;

  const verify = async () => {
    const ok = await authenticateWithBiometrics(`Verify ${label}`);
    if (ok) Alert.alert(`${label} verified`, `${label} is working on this device.`);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title={label} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Icon name={{ ios: 'faceid', android: 'face' }} size={44} color={colors.primary} />
        </View>
        <View style={styles.heading}>
          <Text style={styles.title} accessibilityRole="header">
            {label} sign-in
          </Text>
          <Text style={styles.subtitle}>
            Use {label} instead of your password to sign in and approve secure actions.
          </Text>
        </View>

        {!usable && (
          <Text style={styles.warning}>
            {label} isn&apos;t set up on this device. Turn it on in your device settings first.
          </Text>
        )}

        <SettingsSection>
          <SettingsRow
            title={`Use ${label} to sign in`}
            right={
              <BrandSwitch
                value={settings.signInEnabled}
                disabled={!usable || !isLoaded}
                onValueChange={(value) => {
                  settings.setSignInEnabled(value, label);
                }}
                accessibilityLabel={`Use ${label} to sign in`}
              />
            }
          />
          <SettingsRow
            title={`Require ${label} for secure messages`}
            right={
              <BrandSwitch
                value={settings.requireForMessages}
                disabled={!usable || !isLoaded}
                onValueChange={(value) => settings.setPref('requireForMessages', value)}
                accessibilityLabel={`Require ${label} for secure messages`}
              />
            }
          />
          <SettingsRow
            title={`Require ${label} for approval`}
            right={
              <BrandSwitch
                value={settings.requireForApproval}
                disabled={!usable || !isLoaded}
                onValueChange={(value) => settings.setPref('requireForApproval', value)}
                accessibilityLabel={`Require ${label} for approval`}
              />
            }
          />
        </SettingsSection>

        <View style={styles.info}>
          <Icon name={{ ios: 'info.circle', android: 'info' }} size={16} color={colors.info} />
          <Text style={styles.infoText}>Your biometric data never leaves this device.</Text>
        </View>

        <View style={styles.flex} />
        <Button title={`Verify ${label}`} variant="secondary" disabled={!usable} onPress={verify} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 16, gap: 20, paddingBottom: 32 },
  hero: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  heading: { alignItems: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 15, lineHeight: 22, color: colors.textMuted, textAlign: 'center' },
  warning: { fontSize: 14, color: colors.danger, textAlign: 'center' },
  info: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  infoText: { flex: 1, fontSize: 14, color: colors.info },
});
