import { StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <Text
      style={[styles.base, { fontSize: size }]}
      accessibilityRole="image"
      accessibilityLabel="Specialty365">
      Specialty<Text style={styles.accent}>365</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { fontWeight: '600', color: colors.text, letterSpacing: -0.5 },
  accent: {
    fontStyle: 'italic',
    fontWeight: '400',
    color: colors.primaryMuted,
  },
});
