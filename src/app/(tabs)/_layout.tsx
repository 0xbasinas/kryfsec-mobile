import { Tabs } from 'expo-router/js-tabs'
import { TabBar } from '@/components/tab-bar'
import { useTheme } from '@/theme'

export default function TabsLayout() {
  const t = useTheme()
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: t.bg } }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="journal" options={{ title: 'Journal' }} />
      <Tabs.Screen name="roadmap" options={{ title: 'Roadmap' }} />
      <Tabs.Screen name="labs" options={{ title: 'Labs' }} />
      <Tabs.Screen name="more" options={{ title: 'More' }} />
    </Tabs>
  )
}
