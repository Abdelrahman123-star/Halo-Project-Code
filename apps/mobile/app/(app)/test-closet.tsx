/**
 * 3D Closet Local Clone Viewer (`/test-closet`).
 *
 * Runs exclusively from the locally served cloned assets (Metro middleware),
 * injecting the user's saved wardrobe items onto the 3D rail as hangable garments.
 */

import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  NativeModules,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { convertWardrobeItemToRack3D } from "@/features/closet/logic/garmentModelConverter";
import { useWardrobe } from "@/features/wardrobe/hooks/useWardrobe";

export default function TestClosetScreen(): React.JSX.Element {
  const router = useRouter();
  const webViewRef = useRef<WebView<object>>(null);
  const { items: wardrobeItems, isLoading: loadingWardrobe } = useWardrobe();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Robust Metro host discovery across Android physical devices, emulators, and iOS
  const localUrl = useMemo(() => {
    // 1. Check Constants.expoConfig?.hostUri
    const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];
    if (expoHost && expoHost !== "localhost" && expoHost !== "127.0.0.1") {
      return `http://${expoHost}:8081/`;
    }

    // 2. Check NativeModules SourceCode (bundle URL assigned by Metro)
    const scriptURL = NativeModules.SourceCode?.scriptURL as string | undefined;
    if (scriptURL) {
      const match = scriptURL.match(/https?:\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== "localhost" && match[1] !== "127.0.0.1") {
        return `http://${match[1]}:8081/`;
      }
    }

    // 3. Fallback for Android emulator vs local host
    if (Platform.OS === "android") {
      return "http://10.0.2.2:8081/";
    }
    return "http://localhost:8081/";
  }, []);

  // Pre-inject converted wardrobe items onto window.__HALO_WARDROBE__
  const injectedScript = useMemo(() => {
    if (!wardrobeItems || wardrobeItems.length === 0) return "true;";
    const rackItems = wardrobeItems.map(convertWardrobeItemToRack3D);
    return `
      (function() {
        try {
          window.__HALO_WARDROBE__ = ${JSON.stringify(rackItems)};
        } catch(e) {
          console.error('[HALO Bridge] Injection error:', e);
        }
      })();
      true;
    `;
  }, [wardrobeItems]);

  const handleReload = () => {
    setLoadError(null);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.barBtn} accessibilityLabel="Go back">
          <Text style={styles.barBtnText}>‹ Back</Text>
        </Pressable>

        <View style={styles.titleWrap}>
          <Text style={styles.title}>3D Digital Closet</Text>
          <Text style={styles.subtitle}>
            {wardrobeItems.length > 0
              ? `✨ ${wardrobeItems.length} wardrobe clothes loaded`
              : "Local 3D rail · Standalone offline"}
          </Text>
        </View>

        <Pressable onPress={handleReload} style={styles.barBtn} accessibilityLabel="Reload">
          <Text style={styles.barBtnText}>↻</Text>
        </Pressable>
      </View>

      <View style={styles.webContainer}>
        {loadError ? (
          <View style={styles.centerBox}>
            <Text style={styles.errorTitle}>Could not connect to local 3D Closet</Text>
            <Text style={styles.errorText}>{loadError}</Text>
            <Text style={styles.targetUrlText}>Target: {localUrl}</Text>
            <Text style={styles.errorHelp}>
              Make sure Expo is running (`npx expo start -c`) on your computer.
            </Text>
            <Pressable onPress={handleReload} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry Connection</Text>
            </Pressable>
          </View>
        ) : (
          <WebView<object>
            key={localUrl + wardrobeItems.length}
            ref={webViewRef}
            source={{ uri: localUrl }}
            style={styles.webView}
            injectedJavaScriptBeforeContentLoaded={injectedScript}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            androidLayerType="hardware"
            originWhitelist={["*"]}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={(event) => {
              const description = event.nativeEvent.description || "Connection error to Metro";
              console.error("[HALO Closet] ❌ Local WebView error:", description);
              setLoadError(description);
              setIsLoading(false);
            }}
          />
        )}

        {(isLoading || loadingWardrobe) && !loadError ? (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Opening your 3D digital closet…</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0f0f12" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
  barBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.1)" },
  barBtnText: { color: "#ffffff", fontSize: 13, fontWeight: "600" },
  titleWrap: { alignItems: "center" },
  title: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  subtitle: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 1 },
  webContainer: { flex: 1, position: "relative" },
  webView: { flex: 1, backgroundColor: "#0f0f12" },
  loadingOverlay: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "rgba(15,15,18,0.85)" },
  loadingText: { color: "rgba(255,255,255,0.75)", fontSize: 12, textAlign: "center", paddingHorizontal: 32 },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 10 },
  errorTitle: { color: "#fca5a5", fontSize: 16, fontWeight: "700" },
  errorText: { color: "rgba(255,255,255,0.7)", fontSize: 13, textAlign: "center" },
  targetUrlText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "monospace" },
  errorHelp: { color: "rgba(255,255,255,0.45)", fontSize: 11, textAlign: "center", maxWidth: 280 },
  retryBtn: { marginTop: 6, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999, backgroundColor: "#2563eb" },
  retryText: { color: "#ffffff", fontWeight: "700", fontSize: 13 },
});
