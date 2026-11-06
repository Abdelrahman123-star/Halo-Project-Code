/**
 * BathroomScreen — Full-screen Bathroom & Beauty Suite.
 * Reached by entering the "BATHROOM" door in the hallway.
 */
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Path } from 'react-native-svg';
import { PastelBlobBackground } from '@/features/auth/components/PastelBlobBackground';
import { AuthCard, authTheme } from '@/features/auth/components/AuthComponents';
import { FadeInView } from '@/features/home/components/FadeInView';
import { ChevronLeftIcon, ChevronRightIcon } from '@/features/home/components/HomeIcons';

function MirrorIcon({ size = 24, color = '#6B5299' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={10} r={7} stroke={color} strokeWidth={1.8} />
      <Path d="M12 17v5M9 22h6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function SparkleBeautyIcon({ size = 24, color = '#6B5299' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3c0 4.5-3.5 8-8 8 4.5 0 8 3.5 8 8 0-4.5 3.5-8 8-8-4.5 0-8-3.5-8-8z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function BathroomScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <PastelBlobBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
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
              <Text style={styles.title}>The Vanity Suite</Text>
              <Text style={styles.subtitle}>
                Your beauty sanctuary. Ambient smart mirror, skincare shelf, and daily radiance routines.
              </Text>
            </View>
          </FadeInView>

          {/* Vanity feature cards */}
          <FadeInView delayMs={150} fromTranslateY={14}>
            <AuthCard style={styles.card}>
              <View style={styles.roomRow}>
                <View style={styles.iconCircle}>
                  <MirrorIcon size={24} color="#6B5299" />
                </View>
                <View style={styles.roomText}>
                  <View style={styles.titleBadgeRow}>
                    <Text style={styles.roomTitle}>Smart Vanity Mirror</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Preview</Text>
                    </View>
                  </View>
                  <Text style={styles.roomSubtitle}>Adaptive lighting and virtual cosmetic shade previews.</Text>
                </View>
                <ChevronRightIcon color="#7E5FA8" />
              </View>
            </AuthCard>
          </FadeInView>

          <FadeInView delayMs={250} fromTranslateY={14}>
            <AuthCard style={styles.card}>
              <View style={styles.roomRow}>
                <View style={styles.iconCircle}>
                  <SparkleBeautyIcon size={24} color="#6B5299" />
                </View>
                <View style={styles.roomText}>
                  <View style={styles.titleBadgeRow}>
                    <Text style={styles.roomTitle}>Beauty Shelf</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Preview</Text>
                    </View>
                  </View>
                  <Text style={styles.roomSubtitle}>Curate your skincare shelf and daily beauty rituals.</Text>
                </View>
                <ChevronRightIcon color="#7E5FA8" />
              </View>
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
