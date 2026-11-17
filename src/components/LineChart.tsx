import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { Series } from '@/lib/history';
import { colors, radius } from '@/theme';
import { AppText } from './AppText';

const HEIGHT = 174;
const PLOT_LEFT = 44;
const PLOT_RIGHT_PAD = 20;
const Y_TOP = 84;
const Y_MID = 111.5;
const Y_BOTTOM = 139;

interface LineChartCardProps {
  title: string;
  value: string;
  unit: string;
  series: Series;
}

/** Tarjeta de gráfica de "Historial y evolución" (línea + punto final). */
export function LineChartCard({ title, value, unit, series }: LineChartCardProps) {
  const [width, setWidth] = useState(0);
  const plotRight = width - PLOT_RIGHT_PAD;
  const n = series.values.length;
  const pts = series.values.map((v, i) => {
    const x = PLOT_LEFT + ((plotRight - PLOT_LEFT) * i) / Math.max(1, n - 1);
    const y = Y_BOTTOM - (Math.min(v, series.top) / series.top) * (Y_BOTTOM - Y_TOP);
    return { x, y };
  });
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];

  return (
    <View
      style={styles.card}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityLabel={`${title}: ${value} ${unit}`}
    >
      {width > 0 ? (
        <Svg width={width} height={HEIGHT} style={StyleSheet.absoluteFill}>
          {[Y_TOP, Y_MID, Y_BOTTOM].map((y) => (
            <Line key={y} x1={PLOT_LEFT} x2={plotRight} y1={y} y2={y} stroke={colors.border} strokeWidth={1} />
          ))}
          <Path d={d} stroke={colors.forest} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {last ? <Circle cx={last.x} cy={last.y} r={3.5} fill={colors.forest} /> : null}
        </Svg>
      ) : null}

      <AppText size={13} lineHeight={18} weight="medium" style={styles.title}>
        {title}
      </AppText>
      <View style={styles.valueRow}>
        <AppText size={26} lineHeight={35} weight="semibold" color={colors.forest}>
          {value}
        </AppText>
        <AppText size={11} lineHeight={15} color={colors.muted} style={styles.unit}>
          {unit} · actual
        </AppText>
      </View>

      <AppText size={9} lineHeight={12} color={colors.muted} style={[styles.axis, { top: Y_TOP - 6 }]}>
        {series.topLabel}
      </AppText>
      <AppText size={9} lineHeight={12} color={colors.muted} style={[styles.axis, { top: Y_BOTTOM - 8 }]}>
        {series.bottomLabel}
      </AppText>

      <View style={[styles.xAxis, { left: PLOT_LEFT, right: PLOT_RIGHT_PAD + 10 }]}>
        {series.xLabels.map((l) => (
          <AppText key={l} size={9} lineHeight={12} color={colors.muted}>
            {l}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { height: HEIGHT, borderRadius: radius.card, backgroundColor: colors.surface, overflow: 'hidden' },
  title: { position: 'absolute', left: 16, top: 14 },
  valueRow: { position: 'absolute', left: 16, top: 36, flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  unit: { marginLeft: 4 },
  axis: { position: 'absolute', left: 13 },
  xAxis: { position: 'absolute', top: 151, flexDirection: 'row', justifyContent: 'space-between' },
});
