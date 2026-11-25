import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SettingsRow, SettingsSection } from '@/components/settings/SettingsList';
import { useLogout } from '@/features/auth/hooks';
import { colors } from '@/theme/colors';

import { Avatar } from '../components/ProfileCard';
import { useProfile } from '../hooks';

export function ProfileScreen() {
  const { data: user, refetch, isRefetching } = useProfile();
  const logout = useLogout();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="My Profile" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
            tintColor={colors.primary}
          />
        }>
        {user && (
          <>
            <View style={styles.avatar}>
              <Avatar name={user.fullName} size={88} />
            </View>

            <SettingsSection title="CONTACT">
              <SettingsRow caption="Full name" title={user.fullName} />
              <SettingsRow caption="Email" title={user.email} />
              {!!user.phone && <SettingsRow caption="Phone" title={user.phone} />}
            </SettingsSection>

            <SettingsSection title="ROLE">
              {!!user.title && <SettingsRow caption="Title" title={user.title} />}
              <SettingsRow
                caption="Assigned facilities"
                title={user.facilities.length ? user.facilities.join(' • ') : 'None'}
              />
            </SettingsSection>
          </>
        )}

        <Button
          title="Log Out"
          variant="secondary"
          tone="danger"
          loading={logout.isPending}
          onPress={() => logout.mutate()}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 20, paddingBottom: 32 },
  avatar: { alignItems: 'center', paddingVertical: 8 },
});
