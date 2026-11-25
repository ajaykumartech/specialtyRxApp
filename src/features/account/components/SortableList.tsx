import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Icon } from '@/components/Icon';
import { colors } from '@/theme/colors';

export const SORTABLE_ROW_HEIGHT = 60;

type Positions = Record<string, number>;

function toPositions(ids: string[]): Positions {
  return Object.fromEntries(ids.map((id, index) => [id, index]));
}

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

/** Moves the item at `from` to `to`, shifting everything in between. */
function move(positions: Positions, from: number, to: number): Positions {
  'worklet';
  const next: Positions = {};
  for (const id in positions) {
    const p = positions[id];
    if (p === from) next[id] = to;
    else if (from < to && p > from && p <= to) next[id] = p - 1;
    else if (from > to && p >= to && p < from) next[id] = p + 1;
    else next[id] = p;
  }
  return next;
}

type SortableListProps<T extends { id: string }> = {
  items: T[];
  renderRow: (item: T) => ReactNode;
  onReorder: (orderedIds: string[]) => void;
  /** Lets the parent disable scrolling while a row is being dragged. */
  onDragStateChange?: (dragging: boolean) => void;
};

/** Fixed-height list reordered by dragging each row's handle. */
export function SortableList<T extends { id: string }>({
  items,
  renderRow,
  onReorder,
  onDragStateChange,
}: SortableListProps<T>) {
  const ids = items.map((item) => item.id);
  const idsKey = ids.join('|');
  const positions = useSharedValue<Positions>(toPositions(ids));

  // Server data changed (toggle, refetch): reset to its order.
  useEffect(() => {
    positions.set(toPositions(idsKey ? idsKey.split('|') : []));
  }, [idsKey, positions]);

  const handleDrop = (finalPositions: Positions) => {
    onDragStateChange?.(false);
    const ordered = Object.keys(finalPositions).sort(
      (a, b) => finalPositions[a] - finalPositions[b],
    );
    if (ordered.join('|') !== idsKey) onReorder(ordered);
  };

  return (
    <View style={[styles.container, { height: items.length * SORTABLE_ROW_HEIGHT }]}>
      {items.map((item) => (
        <SortableRow
          key={item.id}
          id={item.id}
          count={items.length}
          positions={positions}
          onDragStart={() => onDragStateChange?.(true)}
          onDrop={handleDrop}
          onMoveBy={(delta) => {
            const from = ids.indexOf(item.id);
            const to = from + delta;
            if (to < 0 || to >= ids.length) return;
            const next = [...ids];
            next.splice(to, 0, ...next.splice(from, 1));
            onReorder(next);
          }}>
          {renderRow(item)}
        </SortableRow>
      ))}
    </View>
  );
}

type SortableRowProps = {
  id: string;
  count: number;
  positions: SharedValue<Positions>;
  onDragStart: () => void;
  onDrop: (positions: Positions) => void;
  /** Screen reader "move up / move down" actions. */
  onMoveBy: (delta: number) => void;
  children: ReactNode;
};

function SortableRow({
  id,
  count,
  positions,
  onDragStart,
  onDrop,
  onMoveBy,
  children,
}: SortableRowProps) {
  const top = useSharedValue((positions.get()[id] ?? 0) * SORTABLE_ROW_HEIGHT);
  const startTop = useSharedValue(0);
  const dragging = useSharedValue(false);

  // Slide into place when another row moves past this one.
  useAnimatedReaction(
    () => positions.get()[id],
    (position, previous) => {
      if (position !== previous && position !== undefined && !dragging.get()) {
        top.set(withTiming(position * SORTABLE_ROW_HEIGHT, { duration: 180 }));
      }
    },
  );

  const pan = usePanGesture({
    minDistance: 0,
    onActivate: () => {
      'worklet';
      dragging.set(true);
      startTop.set(top.get());
      scheduleOnRN(onDragStart);
    },
    onUpdate: (event) => {
      'worklet';
      top.set(clamp(startTop.get() + event.translationY, 0, (count - 1) * SORTABLE_ROW_HEIGHT));
      const to = clamp(Math.round(top.get() / SORTABLE_ROW_HEIGHT), 0, count - 1);
      const from = positions.get()[id];
      if (to !== from) positions.set(move(positions.get(), from, to));
    },
    onFinalize: () => {
      'worklet';
      if (!dragging.get()) return;
      dragging.set(false);
      top.set(withTiming(positions.get()[id] * SORTABLE_ROW_HEIGHT, { duration: 180 }));
      scheduleOnRN(onDrop, positions.get());
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    top: top.get(),
    zIndex: dragging.get() ? 10 : 0,
    shadowOpacity: withTiming(dragging.get() ? 0.15 : 0),
    elevation: dragging.get() ? 6 : 0,
    backgroundColor: dragging.get() ? colors.surfaceMuted : colors.surface,
  }));

  return (
    <Animated.View
      style={[styles.row, animatedStyle]}
      accessibilityActions={[
        { name: 'moveUp', label: 'Move up' },
        { name: 'moveDown', label: 'Move down' },
      ]}
      onAccessibilityAction={(event) =>
        onMoveBy(event.nativeEvent.actionName === 'moveUp' ? -1 : 1)
      }>
      <GestureDetector gesture={pan}>
        <View
          style={styles.handle}
          hitSlop={8}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          <Icon
            name={{ ios: 'line.3.horizontal', android: 'drag_indicator' }}
            size={16}
            color={colors.textMuted}
          />
        </View>
      </GestureDetector>
      <View style={styles.content}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  row: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SORTABLE_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  handle: { width: 40, height: '100%', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 14, gap: 12 },
});
