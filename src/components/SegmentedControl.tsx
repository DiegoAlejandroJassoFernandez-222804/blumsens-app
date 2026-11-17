import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';
import { AppText } from './AppText';
import { tapFeedback } from './Button';

interface Option<T extends string> {
  value: T;
  label: string;
}

/** Filtros tipo píldora: "24 hrs | 7 días | 30 días", "Todas | Riego | Salud | Conexión". */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (!active) tapFeedback();
              onChange(o.value);
            }}
            style={[styles.option, active && styles.active]}
          >
            <AppText
              size={12}
              lineHeight={16}
              weight={active ? 'semibold' : 'medium'}
              color={active ? colors.white : colors.muted}
              numberOfLines={1}
            >
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 42,
    padding: 4,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  option: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  active: { backgroundColor: colors.forest },
});
