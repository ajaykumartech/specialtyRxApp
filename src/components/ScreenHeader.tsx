import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { colors } from '@/theme/colors';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Shows a back chevron. Defaults to true when there is a screen to go back to. */
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
};

export function ScreenHeader({ title, subtitle, showBack, onBack, right }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const canGoBack = showBack ?? router.canGoBack();

  return (
    <LinearGradient
      colors={colors.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <StatusBar style="light" />
      <View style={styles.row}>
        {canGoBack && (
          <Pressable
            onPress={onBack ?? (() => router.back())}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.back}>
            <Icon
              name={{ ios: 'chevron.left', android: 'chevron_left' }}
              size={18}
              color="#FFFFFF"
            />
          </Pressable>
        )}
        <View style={styles.titles}>
          <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {right}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  back: { paddingVertical: 4, paddingRight: 4 },
  titles: { flex: 1, gap: 4 },
  title: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)' },
});
