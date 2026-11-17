import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, fonts } from '@/theme';

type Weight = keyof typeof fonts;

export interface AppTextProps extends TextProps {
  size?: number;
  lineHeight?: number;
  weight?: Weight;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

/** Texto con Inter y los tamaños del diseño. */
export function AppText({
  size = 14,
  lineHeight,
  weight = 'regular',
  color = colors.forestInk,
  align,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        { fontFamily: fonts[weight], fontSize: size, lineHeight: lineHeight ?? Math.round(size * 1.35), color },
        align && { textAlign: align },
        style,
      ]}
    />
  );
}

/** Etiqueta en mayúsculas pequeñas: "TU JARDÍN CONECTADO". */
export function Eyebrow({ children, color = colors.muted }: { children: string; color?: string }) {
  return (
    <AppText size={10} lineHeight={14} weight="medium" color={color} style={styles.eyebrow}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
  eyebrow: { letterSpacing: 0.3 },
});
