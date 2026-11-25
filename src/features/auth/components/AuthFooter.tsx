import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

export function AuthFooter() {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>© Specialty365</Text>
      <Text style={styles.text} accessibilityRole="link">
        Privacy Policy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 24,
  },
  text: { fontSize: 12, color: colors.textMuted },
});
