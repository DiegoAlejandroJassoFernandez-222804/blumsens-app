import { Image, type ImageStyle } from 'expo-image';
import type { StyleProp } from 'react-native';

import { Images } from '@/assets';
import type { PhotoSource } from '@/data/types';

export function photoSource(photo: PhotoSource) {
  return photo.kind === 'asset' ? Images[photo.key] : { uri: photo.uri };
}

/** Foto de planta u hoja: assets del diseño o capturas de la cámara. */
export function PlantPhoto({ photo, style }: { photo: PhotoSource; style?: StyleProp<ImageStyle> }) {
  return <Image source={photoSource(photo)} style={style} contentFit="cover" transition={150} />;
}
