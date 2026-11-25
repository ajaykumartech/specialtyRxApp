import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/theme/colors';

/** Temporary screen for tabs whose designs aren't built yet. */
export function ComingSoon({
  title,
  showBack = false,
  children,
}: {
  title: string;
  showBack?: boolean;
  children?: ReactNode;
}) {
  return (
    <View style={styles.screen}>
      <ScreenHeader title={title} showBack={showBack} />
      <View style={styles.body}>
        <Text style={styles.text}>{title} is coming soon.</Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: 24, gap: 16, justifyContent: 'center' },
  text: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
});
