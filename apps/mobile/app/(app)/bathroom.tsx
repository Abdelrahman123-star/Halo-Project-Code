/**
 * BathroomScreen — the user's bathroom, reached through the hallway's BATHROOM door.
 * The room image fills the screen: the skincare shelf opens Skin recommendations,
 * the vanity mirror opens Skin analysis (the existing Wellness & skin page), and
 * the makeup shelf opens Makeup. Recommendations and Makeup are sample-data previews.
 */
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BathroomRoomView } from '@/features/home/bathroom/BathroomRoomView';

export default function BathroomScreen() {
  const router = useRouter();

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/hallway');
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <BathroomRoomView
        onOpenSkincare={() => router.push('/(app)/skincare')}
        onOpenSkinAnalysis={() => router.push('/(app)/wellness')}
        onOpenMakeup={() => router.push('/(app)/makeup')}
        onBack={goBack}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EDE4F6' },
});
