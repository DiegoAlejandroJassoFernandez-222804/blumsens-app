import * as Haptics from 'expo-haptics';
import type { FC, ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { colors, radius } from '@/theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'outline' | 'compact';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  /** Ícono a la izquierda del texto. */
  icon?: FC<SvgProps>;
  /** Ícono pegado al borde derecho (botón "Comenzar"). */
  trailingIcon?: FC<SvgProps>;
  disabled?: boolean;
  loading?: boolean;
  height?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function tapFeedback() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}

/**
 * Botones del diseño:
 *  - primary: terracota, 54 px, radio 18 (Comenzar, Entrar, Guardar y vincular…)
 *  - compact: terracota, 40 px, radio 16 (Reconectar sensor, + Maceta)
 *  - outline: blanco con borde (Marcar atendida)
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  trailingIcon: Trailing,
  disabled,
  loading,
  height,
  style,
}: ButtonProps) {
  const isOutline = variant === 'outline';
  const h = height ?? (variant === 'primary' ? 54 : variant === 'compact' ? 40 : 32);
  const textColor = isOutline ? colors.forest : colors.white;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
      disabled={disabled || loading}
      onPress={() => {
        tapFeedback();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.base,
        {
          height: h,
          borderRadius: variant === 'primary' ? radius.button : variant === 'compact' ? radius.chip : 12,
          paddingHorizontal: variant === 'primary' ? 24 : 14,
        },
        isOutline ? styles.outline : styles.filled,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {Icon ? <Icon /> : null}
          <AppText
            size={variant === 'primary' ? 15 : variant === 'compact' ? 13 : 11}
            lineHeight={variant === 'primary' ? 20 : 16}
            weight="semibold"
            color={textColor}
          >
            {label}
          </AppText>
        </View>
      )}
      {Trailing && !loading ? (
        <View style={styles.trailing}>
          <Trailing />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  filled: { backgroundColor: colors.terracotta },
  outline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trailing: { position: 'absolute', right: 31 },
});
