import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { colors } from '@/theme/colors';

import type { DeliveryStep } from '../schemas';

const STEPS: { id: DeliveryStep; label: string; icon: IconName }[] = [
  {
    id: 'packed',
    label: 'Packed',
    icon: { ios: 'shippingbox.fill', android: 'inventory_2' },
  },
  {
    id: 'picked_up',
    label: 'Picked up',
    icon: { ios: 'bag.fill', android: 'local_mall' },
  },
  {
    id: 'out_for_delivery',
    label: 'Out',
    icon: { ios: 'truck.box.fill', android: 'local_shipping' },
  },
  {
    id: 'delivered',
    label: 'Delivered',
    icon: { ios: 'checkmark.circle.fill', android: 'check_circle' },
  },
];

export function DeliveryTrackingCard({ currentStep }: { currentStep: DeliveryStep }) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
  const currentLabel = STEPS[currentIndex]?.label ?? '';

  return (
    <Card accessible accessibilityLabel={`Delivery tracking. Current status: ${currentLabel}`}>
      <Text style={styles.heading}>DELIVERY TRACKING</Text>
      <View style={styles.track}>
        {STEPS.map((step, index) => {
          const reached = index <= currentIndex;
          return (
            <Fragment key={step.id}>
              {index > 0 && (
                <View style={[styles.line, index <= currentIndex && styles.lineReached]} />
              )}
              <Icon
                name={step.icon}
                size={18}
                color={reached ? colors.primary : colors.textMuted}
              />
            </Fragment>
          );
        })}
      </View>
      <View style={styles.labels}>
        {STEPS.map((step, index) => (
          <Text
            key={step.id}
            style={[styles.label, index === currentIndex && styles.labelCurrent]}
            numberOfLines={1}>
            {step.label}
          </Text>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 13,
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 16,
  },
  track: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  line: {
    flex: 1,
    height: 1.5,
    marginHorizontal: 6,
    backgroundColor: colors.border,
  },
  lineReached: { backgroundColor: colors.primaryMuted },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  label: { fontSize: 14, color: colors.textSecondary },
  labelCurrent: { color: colors.primary, fontWeight: '600' },
});
