import { useLocalSearchParams } from 'expo-router';

import { ComingSoon } from '@/components/ComingSoon';

const TITLES: Record<string, string> = {
  'facility-users': 'Facility Users',
  'pharmacy-users': 'Pharmacy Users',
  pharmacies: 'Pharmacies',
};

export default function AdminSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  return <ComingSoon title={TITLES[section] ?? 'Admin'} showBack />;
}
