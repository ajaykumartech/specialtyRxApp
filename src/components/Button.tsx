import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius } from '@/theme/colors';

type Variant = 'primary' | 'secondary' | 'link';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  icon?: ReactNode;
  /** 'danger' colours the label red (e.g. Log Out). */
  tone?: 'default' | 'danger';
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  tone = 'default',
  style,
  ...props
}: ButtonProps) {
  const isDisabled = !!disabled || loading;
  const textColor =
    variant === 'primary'
      ? colors.textOnPrimary
      : variant === 'link'
        ? colors.primary
        : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={variant === 'link' ? 8 : undefined}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && pressedStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            style={[styles.label, variant === 'link' && styles.linkLabel, { color: textColor }]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  primary: {
    minHeight: 50,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
  },
  secondary: {
    minHeight: 50,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 20,
  },
  link: { minHeight: 32 },
  disabled: { opacity: 0.55 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 16, fontWeight: '600' },
  linkLabel: { fontSize: 14, fontWeight: '500' },
});

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primaryPressed },
  secondary: { backgroundColor: colors.border },
  link: { opacity: 0.6 },
});
