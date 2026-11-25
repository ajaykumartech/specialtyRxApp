import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';

export type IconName = { ios: SFSymbol; android: AndroidSymbol };

type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
};

/** SF Symbols on iOS, Material Symbols on Android and web. */
export function Icon({ name, size = 20, color = colors.text, style }: IconProps) {
  return (
    <SymbolView
      name={{ ios: name.ios, android: name.android, web: name.android }}
      size={size}
      tintColor={color}
      style={style}
    />
  );
}
