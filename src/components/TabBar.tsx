import type { TabTriggerSlotProps } from 'expo-router/ui';
import type { FC } from 'react';
import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';

import { colors, gutter } from '@/theme';
import { AppText } from './AppText';
import { tapFeedback } from './Button';

/** Contenedor de la "Navegación inferior" del diseño. */
export function TabBarContainer({ children, style, ...props }: ViewProps) {
  const insets = useSafeAreaInsets();
  return (
    <View {...props} style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }, style]}>
      <View style={styles.border} />
      {children}
    </View>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  label: string;
  icon: FC<SvgProps>;
  activeIcon: FC<SvgProps>;
  badge?: number;
};

/** Pestaña: ícono de 22 px con píldora activa de 72×34 y texto de 11 px. */
export function TabButton({
  label,
  icon: Icon,
  activeIcon: ActiveIcon,
  badge,
  isFocused,
  onPress,
  ref: _ref,
  ...props
}: TabButtonProps) {
  const I = isFocused ? ActiveIcon : Icon;
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={badge ? `${label}, ${badge} pendientes` : label}
      accessibilityState={{ selected: !!isFocused }}
      onPress={(e) => {
        if (!isFocused) tapFeedback();
        onPress?.(e);
      }}
      style={styles.tab}
    >
      <View style={[styles.pill, isFocused && styles.pillActive]}>
        <I width={22} height={22} />
        {badge ? <View style={styles.badge} /> : null}
      </View>
      <AppText
        size={11}
        lineHeight={15}
        weight={isFocused ? 'semibold' : 'regular'}
        color={isFocused ? colors.forest : colors.muted}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.white, paddingTop: 8 },
  border: { position: 'absolute', top: 0, left: gutter, right: gutter, height: 1, backgroundColor: colors.border },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  pill: { width: 72, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: colors.surface },
  badge: {
    position: 'absolute',
    top: 6,
    right: 22,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.terracotta,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
});
