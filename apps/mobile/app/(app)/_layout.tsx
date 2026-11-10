import "@/shared/lib/polyfills";
import { StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import { AppBottomNav } from "@/features/home/components/HomeBottomNav";

export default function AppLayout() {
  return (
    <View style={styles.container}>
      {/* Screens fill the whole screen; the nav floats over the bottom with a clear surround.
          Screens leave BOTTOM_NAV_CLEARANCE free at the bottom so nothing is hidden under it. */}
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
      <View style={styles.navLayer} pointerEvents="box-none">
        <AppBottomNav />
      </View>
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
  navLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
