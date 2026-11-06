import "@/shared/lib/polyfills";
import { Stack } from "expo-router";

export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
