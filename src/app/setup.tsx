import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, type FC } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';

import { Icons } from '@/assets';
import { AppText, Eyebrow } from '@/components/AppText';
import { Button } from '@/components/Button';
import { PlantPhoto } from '@/components/PlantPhoto';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusPill } from '@/components/StatusPill';
import { TextField, type TextFieldHandle } from '@/components/TextField';
import { getSpecies, SPECIES } from '@/data/species';
import { idealCareLines } from '@/lib/insights';
import { useGarden } from '@/store/garden';
import { colors, gutter, radius } from '@/theme';

function CareRow({ icon: Icon, label, value }: { icon: FC<SvgProps>; label: string; value: string }) {
  return (
    <View style={styles.careRow}>
      <Icon width={20} height={20} />
      <View>
        <AppText size={11} lineHeight={15} color={colors.mint}>
          {label}
        </AppText>
        <AppText size={13} lineHeight={18} weight="medium" color={colors.white}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

/** 06 · Configurar planta (después del escaneo). */
export default function Setup() {
  const insets = useSafeAreaInsets();
  const draft = useGarden((s) => s.draft);
  const updateDraft = useGarden((s) => s.updateDraft);
  const nameRef = useRef<TextFieldHandle>(null);

  if (!draft) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 40 }]}>
        <AppText size={16} lineHeight={22} weight="semibold" align="center">
          No hay una planta en proceso.
        </AppText>
        <Button label="Escanear una hoja" onPress={() => router.replace('/scan')} />
      </View>
    );
  }

  const species = getSpecies(draft.speciesId);
  const care = idealCareLines(species);

  const cycleSpecies = () => {
    const idx = SPECIES.findIndex((sp) => sp.id === species.id);
    const next = SPECIES[(idx + 1) % SPECIES.length];
    const keepName = draft.name.trim() && !draft.name.startsWith(species.defaultName);
    updateDraft({ speciesId: next.id, name: keepName ? draft.name : next.defaultName });
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top, paddingBottom: insets.bottom + 12 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Tu nueva planta" subtitle="Una hoja, una nueva conexión." />

        <View style={styles.body}>
          <View style={styles.photoWrap}>
            <PlantPhoto photo={draft.photo} style={StyleSheet.absoluteFill} />
            <StatusPill tone="ok" label="Foto capturada" background={colors.white} style={styles.photoPill} />
          </View>

          <AppText size={13} lineHeight={18} weight="medium" style={styles.label}>
            Nombre de tu planta
          </AppText>
          <TextField
            ref={nameRef}
            value={draft.name}
            onChangeText={(name) => updateDraft({ name })}
            placeholder={species.defaultName}
            maxLength={28}
            returnKeyType="done"
            style={styles.nameInput}
            right={
              <Pressable accessibilityLabel="Editar nombre" hitSlop={10} onPress={() => nameRef.current?.focus()}>
                <Icons.edit width={20} height={20} />
              </Pressable>
            }
          />

          <View style={styles.speciesBlock}>
            <Eyebrow>ESPECIE DETECTADA</Eyebrow>
            <View style={styles.speciesRow}>
              <AppText size={21} lineHeight={28} weight="semibold" style={styles.flex}>
                {species.scientific}
              </AppText>
              <Icons.check20 width={20} height={20} />
            </View>
            <Pressable hitSlop={8} onPress={cycleSpecies} style={styles.change}>
              <AppText size={12} lineHeight={16} weight="medium" color={colors.forest}>
                ¿No es correcta? Cambiar especie
              </AppText>
            </Pressable>
          </View>
        </View>

        <View style={styles.spacer} />
        <View style={styles.care}>
          <AppText size={23} lineHeight={31} weight="semibold" color={colors.white}>
            Así se sentirá en casa
          </AppText>
          <View style={styles.careList}>
            <CareRow icon={Icons.leafLight} label="Estado visual" value={draft.leaf.title} />
            <CareRow icon={Icons.dropLight} label="Riego ideal" value={care.water} />
            <CareRow icon={Icons.sunLight} label="Luz ideal" value={care.light} />
          </View>
          <Button label="Guardar y vincular" onPress={() => router.push('/link')} style={styles.save} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  body: { paddingHorizontal: gutter },
  empty: { flex: 1, backgroundColor: colors.white, paddingHorizontal: gutter, gap: 20 },
  photoWrap: { marginTop: 6, height: 230, borderRadius: radius.photo, overflow: 'hidden', backgroundColor: colors.surface },
  photoPill: { position: 'absolute', left: 18, bottom: 13, height: 28, borderRadius: 14, minWidth: 132 },
  label: { marginTop: 23, marginBottom: 10 },
  nameInput: { fontSize: 16 },
  speciesBlock: { marginTop: 28 },
  speciesRow: { marginTop: 9, flexDirection: 'row', alignItems: 'center', paddingRight: 9 },
  change: { marginTop: 6, alignSelf: 'flex-start' },
  spacer: { flexGrow: 1, minHeight: 28 },
  care: {
    paddingTop: 23,
    paddingHorizontal: gutter,
    paddingBottom: 17,
    borderRadius: radius.photo,
    backgroundColor: colors.forest,
  },
  careList: { marginTop: 18, gap: 12 },
  careRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingLeft: 1 },
  save: { marginTop: 22 },
});
