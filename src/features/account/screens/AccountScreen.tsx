import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { BrandSwitch, SettingsRow, SettingsSection } from '@/components/settings/SettingsList';
import { useBiometricSupport } from '@/features/auth/hooks';
import { BIOMETRIC_LABEL } from '@/services/biometrics';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';

import { useBiometricSettings } from '../biometricSettings';
import { ProfileCard } from '../components/ProfileCard';

export function AccountScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: biometrics } = useBiometricSupport();
  const signInEnabled = useBiometricSettings((s) => s.signInEnabled);
  const isLoaded = useBiometricSettings((s) => s.isLoaded);
  const load = useBiometricSettings((s) => s.load);
  const setSignInEnabled = useBiometricSettings((s) => s.setSignInEnabled);

  useEffect(() => {
    if (!isLoaded) load();
  }, [isLoaded, load]);

  const biometricsUsable = !!biometrics?.hasHardware && !!biometrics.isEnrolled;
  const label = biometrics?.label ?? BIOMETRIC_LABEL;
  const go = (href: Href) => () => router.push(href);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Account" showBack={false} />
      <ScrollView contentContainerStyle={styles.content}>
        {user && <ProfileCard user={user} onPress={go('/account/profile')} />}

        <SettingsSection title="ACCOUNT">
          <SettingsRow
            title="My Profile"
            icon={{ ios: 'person.fill', android: 'person' }}
            onPress={go('/account/profile')}
          />
          <SettingsRow
            title="Settings"
            icon={{ ios: 'gearshape.fill', android: 'settings' }}
            onPress={go('/account/settings')}
          />
          <SettingsRow
            title="Version"
            icon={{ ios: 'square.grid.2x2.fill', android: 'info' }}
            value={Constants.expoConfig?.version}
            onPress={go('/account/about')}
          />
        </SettingsSection>

        <SettingsSection title="ADMIN">
          <SettingsRow
            title="Facility Users"
            icon={{ ios: 'building.2.fill', android: 'apartment' }}
            onPress={go('/account/admin/facility-users')}
          />
          <SettingsRow
            title="Pharmacy Users"
            icon={{ ios: 'person.2.fill', android: 'group' }}
            onPress={go('/account/admin/pharmacy-users')}
          />
          <SettingsRow
            title="Pharmacies"
            icon={{ ios: 'cross.case.fill', android: 'local_pharmacy' }}
            onPress={go('/account/admin/pharmacies')}
          />
        </SettingsSection>

        <SettingsSection title="MOBILE & SECURITY">
          <SettingsRow
            title="Notification Preferences"
            icon={{ ios: 'bell.fill', android: 'notifications' }}
            onPress={go('/account/notifications')}
          />
          <SettingsRow
            title="Change Password"
            icon={{ ios: 'lock.fill', android: 'password' }}
            onPress={go('/account/change-password')}
          />
          <SettingsRow
            title="Face ID / Biometric"
            subtitle={biometricsUsable ? undefined : 'Not set up on this device'}
            icon={{ ios: 'faceid', android: 'face' }}
            onPress={go('/account/face-id')}
            showChevron={false}
            right={
              <BrandSwitch
                value={signInEnabled}
                disabled={!biometricsUsable || !isLoaded}
                onValueChange={(value) => {
                  setSignInEnabled(value, label);
                }}
                accessibilityLabel={`Use ${label} to sign in`}
              />
            }
          />
        </SettingsSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 20, paddingBottom: 32 },
});
