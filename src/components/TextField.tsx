import type { ComponentRef, FC, ReactNode, Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { colors, fonts } from '@/theme';

export type TextFieldHandle = ComponentRef<typeof TextInput>;

interface TextFieldProps extends Omit<TextInputProps, 'ref'> {
  ref?: Ref<TextFieldHandle>;
  icon?: FC<SvgProps>;
  right?: ReactNode;
}

/** Campo de 56 px, radio 20, fondo gris claro (Correo, Contraseña, Nombre, ID de módulo). */
export function TextField({ ref, icon: Icon, right, style, ...rest }: TextFieldProps) {
  return (
    <View style={styles.box}>
      {Icon ? <Icon width={22} height={22} /> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.muted}
        selectionColor={colors.forest}
        {...rest}
        style={[styles.input, style]}
      />
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.forestInk,
    padding: 0,
  },
});
