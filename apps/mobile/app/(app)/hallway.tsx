/**
 * HallwayScreen — The room selection area displaying the two doors (Bedroom and Bathroom).
 * When a door is tapped, camera smoothly zooms in toward that door, displays an opening
 * glow, and transitions into the selected room.
 */
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { DoorSelectionView } from '@/features/home/components/DoorSelectionView';

export default function HallwayScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <DoorSelectionView
        onSelectBedroom={() => router.push('/(app)/bedroom')}
        onSelectBathroom={() => router.push('/(app)/bathroom')}
        onBackOutside={() => router.replace('/(app)')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#16100D',
  },
});
