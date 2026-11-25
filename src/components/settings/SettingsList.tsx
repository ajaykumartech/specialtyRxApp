import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View, type SwitchProps } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { colors, radius } from '@/theme/colors';

export function BrandSwitch(props: SwitchProps) {
  return (
    <Switch
      trackColor={{ true: colors.primary, false: colors.border }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={colors.border}
      {...props}
    />
  );
}

type SectionProps = { title?: string; footer?: string; children: ReactNode };

/** Uppercase heading + a bordered card with hairline separators between rows. */
export function SettingsSection({ title, footer, children }: SectionProps) {
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={styles.section}>
      {!!title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.card}>
        {rows.map((row, index) => (
          <Fragment key={row.key ?? index}>
            {index > 0 && <View style={styles.separator} />}
            {row}
          </Fragment>
        ))}
      </View>
      {!!footer && <Text style={styles.footer}>{footer}</Text>}
    </View>
  );
}

type RowProps = {
  title: string;
  /** Small muted line under the title. */
  subtitle?: string;
  /** Small muted label shown above the title (profile-style rows). */
  caption?: string;
  value?: string;
  icon?: IconName;
  onPress?: () => void;
  right?: ReactNode;
  showChevron?: boolean;
  left?: ReactNode;
  disabled?: boolean;
};

export function SettingsRow({
  title,
  subtitle,
  caption,
  value,
  icon,
  onPress,
  right,
  showChevron = !!onPress,
  left,
  disabled,
}: RowProps) {
  const content = (
    <>
      {left}
      {icon && <Icon name={icon} size={18} color={colors.textSecondary} />}
      <View style={styles.texts}>
        {!!caption && <Text style={styles.caption}>{caption}</Text>}
        <Text style={[styles.title, disabled && styles.disabled]} numberOfLines={2}>
          {title}
        </Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {!!value && <Text style={styles.value}>{value}</Text>}
      {right}
      {showChevron && (
        <Icon
          name={{ ios: 'chevron.right', android: 'chevron_right' }}
          size={13}
          color={colors.textMuted}
        />
      )}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[caption, title, value].filter(Boolean).join(', ')}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  texts: { flex: 1, gap: 2 },
  caption: { fontSize: 12, color: colors.textMuted },
  title: { fontSize: 15, color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted },
  value: { fontSize: 14, color: colors.textSecondary },
  disabled: { color: colors.textMuted },
  footer: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
});
