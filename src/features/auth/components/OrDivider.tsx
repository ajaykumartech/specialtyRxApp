import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

export function OrDivider() {
  return (
    <View style={styles.row} accessible={false}>
      <View style={styles.line} />
      <Text style={styles.text}>or</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 48,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  text: { fontSize: 13, color: colors.textMuted },
});
