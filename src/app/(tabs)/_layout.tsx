import AppTabs from '@/components/app-tabs';

export const unstable_settings = {
  // Open on Dashboard after sign-in, even though it's the middle tab.
  anchor: 'dashboard',
};

export default function TabsLayout() {
  return <AppTabs />;
}
