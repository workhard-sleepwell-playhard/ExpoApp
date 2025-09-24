import { Redirect } from 'expo-router';

export default function Index() {
  // AuthWrapper will handle the initial routing based on auth state
  return <Redirect href="/(tabs)/home" />;
}
