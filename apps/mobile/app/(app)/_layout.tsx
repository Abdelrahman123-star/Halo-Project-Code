import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* No slide: the house-entrance video already ends on this exact frame. */}
      <Stack.Screen name="hallway" options={{ animation: 'none' }} />
    </Stack>
  );
}
