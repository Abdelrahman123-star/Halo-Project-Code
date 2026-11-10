/**
 * BedroomScreen — the user's bedroom, reached through the hallway's BEDROOM door.
 * The room image fills the screen; the wardrobe opens the Digital Wardrobe
 * (`/(app)/garment`) and the mirror opens the avatar experience — the existing
 * "3D Dressing Suite" destination (a dedicated 3D try-on screen does not exist yet).
 */
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { usePreviewAvatar } from '@/features/avatar/hooks/usePreviewAvatar';
import { BedroomRoomView } from '@/features/home/bedroom/BedroomRoomView';
import { bedroomSceneFor } from '@/features/home/rooms/roomScenes';
import { useUserGender } from '@/features/profile/hooks/useUserGender';

export default function BedroomScreen() {
  const router = useRouter();
  // Only the room picture differs by gender; everything else is shared.
  const scene = bedroomSceneFor(useUserGender());
  const { state: avatarState } = usePreviewAvatar();
  const hasAvatar = avatarState.status === 'ready' && avatarState.hasAvatar;

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/hallway');
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <BedroomRoomView
        scene={scene}
        onOpenWardrobe={() => router.push('/(app)/garment')}
        // Try-on needs an avatar: open it if there is one, otherwise start creating it.
        onOpenTryOn={() => router.push(hasAvatar ? '/(app)/avatar' : '/(app)/create-avatar')}
        onBack={goBack}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EDE4F6' },
});
