/**
 * BedroomScreen — Full-screen Bedroom & Dressing Suite.
 * Reached by entering the "BEDROOM" door in the hallway.
 */
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PastelBlobBackground } from '@/features/auth/components/PastelBlobBackground';
import { AuthCard, authTheme } from '@/features/auth/components/AuthComponents';
import { FadeInView } from '@/features/home/components/FadeInView';
import { ChevronLeftIcon, ChevronRightIcon, HangerIcon, ProfileIcon } from '@/features/home/components/HomeIcons';

export default function BedroomScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <PastelBlobBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header with back navigation to hallway */}
          <FadeInView fromTranslateY={-10}>
            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Return to Hallway"
                style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
              >
                <ChevronLeftIcon size={18} color="#6B5299" />
                <Text style={styles.backBtnText}>Hallway</Text>
              </Pressable>

              <Image
                source={require('../../assets/halo-logo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="HALO Logo"
              />

              <View style={styles.headerSlot} />
            </View>

            <View style={styles.titleWrap}>
              <Text style={styles.title}>The Bedroom</Text>
              <Text style={styles.subtitle}>
                Your private dressing suite. Curate garments for your digital closet and style your 3D avatar.
              </Text>
            </View>
          </FadeInView>

          {/* Interactive room feature cards */}
          <FadeInView delayMs={150} fromTranslateY={14}>
            <AuthCard style={styles.card}>
              <Pressable
                onPress={() => router.push('/(app)/garment')}
                accessibilityRole="button"
                accessibilityLabel="Open Digital Wardrobe"
                style={({ pressed }) => [styles.roomRow, pressed && styles.btnPressed]}
              >
                <View style={styles.iconCircle}>
                  <HangerIcon size={24} color="#6B5299" />
                </View>
                <View style={styles.roomText}>
                  <Text style={styles.roomTitle}>Digital Wardrobe</Text>
                  <Text style={styles.roomSubtitle}>Scan and categorize real clothing items with CV analysis.</Text>
                </View>
                <ChevronRightIcon color="#7E5FA8" />
              </Pressable>
            </AuthCard>
          </FadeInView>

          <FadeInView delayMs={250} fromTranslateY={14}>
            <AuthCard style={styles.card}>
              <Pressable
                onPress={() => router.push('/(app)/create-avatar')}
                accessibilityRole="button"
                accessibilityLabel="Open 3D Avatar Dressing Suite"
                style={({ pressed }) => [styles.roomRow, pressed && styles.btnPressed]}
              >
                <View style={styles.iconCircle}>
                  <ProfileIcon size={24} color="#6B5299" />
                </View>
                <View style={styles.roomText}>
                  <View style={styles.titleBadgeRow}>
                    <Text style={styles.roomTitle}>3D Dressing Suite</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Preview</Text>
                    </View>
                  </View>
                  <Text style={styles.roomSubtitle}>Full-body stylized avatar fitting and virtual garment try-on.</Text>
                </View>
                <ChevronRightIcon color="#7E5FA8" />
              </Pressable>
            </AuthCard>
          </FadeInView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2FB' },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: authTheme.socialBtnBg,
    borderWidth: 1,
    borderColor: authTheme.socialBtnBorder,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B5299',
    marginLeft: 2,
  },
  btnPressed: { opacity: 0.7 },
  logo: { width: 100, height: 44 },
  headerSlot: { width: 80 },
  titleWrap: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#6B5299',
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 6,
    maxWidth: 310,
    fontSize: 14,
    lineHeight: 20,
    color: '#8A76A6',
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 0,
    padding: 16,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: authTheme.socialBtnBg,
    borderWidth: 1.2,
    borderColor: authTheme.socialBtnBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomText: { flex: 1 },
  titleBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomTitle: { fontSize: 16, fontWeight: '700', color: '#3D3055' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(217, 207, 241, 0.55)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B5299',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  roomSubtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: '#8A76A6',
  },
});
