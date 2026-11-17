import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import { Icons } from '@/assets';
import { TabBarContainer, TabButton } from '@/components/TabBar';
import { useOpenAlertCount } from '@/store/selectors';
import { colors } from '@/theme';

/** Navegación inferior: Plantas · Alertas · Módulos. */
export default function TabsLayout() {
  const openAlerts = useOpenAlertCount();
  return (
    <Tabs style={styles.root}>
      <StatusBar style="dark" />
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <TabBarContainer>
          <TabTrigger name="plants" href="/plants" asChild>
            <TabButton label="Plantas" icon={Icons.leafInactive} activeIcon={Icons.leaf} />
          </TabTrigger>
          <TabTrigger name="alerts" href="/alerts" asChild>
            <TabButton label="Alertas" icon={Icons.bellInactive} activeIcon={Icons.bellActive} badge={openAlerts} />
          </TabTrigger>
          <TabTrigger name="modules" href="/modules" asChild>
            <TabButton label="Módulos" icon={Icons.chipInactive} activeIcon={Icons.chip} />
          </TabTrigger>
        </TabBarContainer>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  slot: { flex: 1 },
});
