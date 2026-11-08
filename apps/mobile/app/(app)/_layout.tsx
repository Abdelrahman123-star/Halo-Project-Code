import "@/shared/lib/polyfills";
import { StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import { AppBottomNav } from "@/features/home/components/HomeBottomNav";

export default function AppLayout() {
  return (
    <View style={styles.container}>
      {/* Screens fill only the space above the nav bar, so the bar never covers their content. */}
      <View style={styles.screens}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
          }}
        >
          {/* No slide: the house-entrance video already ends on this exact frame. */}
          <Stack.Screen name="hallway" options={{ animation: "none" }} />
        </Stack>
      </View>
      <AppBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2FB",
  },
  screens: {
    flex: 1,
  },
});
