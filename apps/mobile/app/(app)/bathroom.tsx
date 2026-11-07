/**
 * BathroomScreen — The Vanity Suite.
 * Reached by entering the "BATHROOM" door in the hallway.
 * Redesigned with ui-ux-pro-max: frosted glass cards, tactile micro-interactions,
 * clear action affordance, and HALO's dreamy pastel aesthetic matching The Bedroom.
 */
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { PastelBlobBackground } from '@/features/auth/components/PastelBlobBackground';
import { FadeInView } from '@/features/home/components/FadeInView';
import { RoomPortalCard } from '@/features/home/components/BedroomPortalCard';
import { ChevronLeftIcon, MirrorIcon, SparkleBeautyIcon } from '@/features/home/components/HomeIcons';

export default function BathroomScreen(): React.JSX.Element {
  const router = useRouter();
  const [showMirrorModal, setShowMirrorModal] = useState(false);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <PastelBlobBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header with back navigation to hallway & logo */}
          <FadeInView fromTranslateY={-10}>
            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Return to Hallway"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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

              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.titleWrap}>
              <View style={styles.suiteBadge}>
                <View style={styles.suiteBadgeDot} />
                <Text style={styles.suiteBadgeText}>SUITE 02 · BEAUTY & RADIANCE</Text>
              </View>
              <Text style={styles.title}>The Vanity Suite</Text>
              <Text style={styles.subtitle}>
                Your private beauty sanctuary. Ambient smart mirror, skincare shelf, and daily radiance routines.
              </Text>
            </View>
          </FadeInView>

          {/* Interactive room feature cards */}
          <FadeInView delayMs={140} fromTranslateY={14}>
            <RoomPortalCard
              title="Smart Vanity Mirror"
              description="Adaptive studio lighting and virtual cosmetic shade previews. Test makeup hues and analyze skin radiance under studio illumination."
              badgeText="SMART MIRROR"
              badgeVariant="rose"
              tags={['Studio Lighting', 'Shade Match', 'Radiance']}
              icon={<MirrorIcon size={24} color="#B04278" />}
              gradientColors={['rgba(255, 255, 255, 0.94)', 'rgba(255, 243, 248, 0.85)']}
              iconGradientColors={['#FDEEF5', '#FADCEB']}
              arrowColor="#B04278"
              onPress={() => setShowMirrorModal(true)}
              accessibilityLabel="Open Smart Vanity Mirror"
            />
          </FadeInView>

          <FadeInView delayMs={240} fromTranslateY={14}>
            <RoomPortalCard
              title="Beauty Shelf"
              description="Curate your skincare shelf and daily beauty rituals. Track cosmetic formulas, monitor skin wellness trends, and plan routines."
              badgeText="SKINCARE & WELLNESS"
              badgeVariant="periwinkle"
              tags={['Skincare Shelf', 'Daily Ritual', 'Formulas']}
              icon={<SparkleBeautyIcon size={24} color="#4865B8" />}
              gradientColors={['rgba(255, 255, 255, 0.94)', 'rgba(242, 247, 255, 0.85)']}
              iconGradientColors={['#E9F0FE', '#D7E5FC']}
              arrowColor="#4865B8"
              onPress={() => router.push('/(app)/wellness')}
              accessibilityLabel="Open Beauty Shelf"
            />
          </FadeInView>
        </ScrollView>
      </SafeAreaView>

      {/* Honest Prototype Modal for Smart Vanity Mirror */}
      <Modal
        visible={showMirrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMirrorModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalDismissArea}
            onPress={() => setShowMirrorModal(false)}
            accessibilityLabel="Close Preview Modal"
          />
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.98)', 'rgba(255, 246, 251, 0.95)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalContent}
            >
              <View style={styles.modalTop}>
                <View style={styles.modalIconWrap}>
                  <MirrorIcon size={26} color="#B04278" />
                </View>
                <View style={styles.modalHeaderBadge}>
                  <Text style={styles.modalBadgeText}>PROTOTYPE PREVIEW</Text>
                </View>
              </View>

              <Text style={styles.modalTitle}>Smart Vanity Mirror</Text>
              <Text style={styles.modalBody}>
                Adaptive cosmetic shaders, personalized color analysis, and live mirror illumination are scheduled for an upcoming HALO release.
              </Text>

              <View style={styles.modalPills}>
                <View style={styles.modalPill}><Text style={styles.modalPillText}>Live Shaders</Text></View>
                <View style={styles.modalPill}><Text style={styles.modalPillText}>Daylight Simulation</Text></View>
                <View style={styles.modalPill}><Text style={styles.modalPillText}>Tone Match</Text></View>
              </View>

              <Pressable
                onPress={() => setShowMirrorModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Got it"
                style={({ pressed }) => [styles.modalActionBtn, pressed && styles.btnPressed]}
              >
                <Text style={styles.modalActionText}>Got it</Text>
              </Pressable>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2FB' },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#8C78B3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  backBtnText: { fontSize: 13, fontWeight: '600', color: '#6B5299' },
  btnPressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  logo: { width: 96, height: 40 },
  headerSpacer: { width: 80 },
  titleWrap: { alignItems: 'center', marginTop: 12, marginBottom: 6 },
  suiteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 14,
    backgroundColor: 'rgba(241, 150, 190, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  suiteBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E05E9A', marginRight: 6 },
  suiteBadgeText: { fontSize: 10, fontWeight: '700', color: '#B04278', letterSpacing: 0.7 },
  title: { fontSize: 27, fontWeight: '800', color: '#34264C', letterSpacing: -0.4 },
  subtitle: { marginTop: 6, maxWidth: 320, fontSize: 13.5, lineHeight: 19.5, color: '#76648E', textAlign: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(26, 17, 43, 0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalDismissArea: { ...StyleSheet.absoluteFill },
  modalContainer: { width: '100%', maxWidth: 340, borderRadius: 24, overflow: 'hidden', borderWidth: 1.2, borderColor: 'rgba(255, 255, 255, 0.95)', shadowColor: '#34264C', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.16, shadowRadius: 20, elevation: 8 },
  modalContent: { padding: 22, alignItems: 'center' },
  modalTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 12 },
  modalIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(224, 94, 154, 0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.9)' },
  modalHeaderBadge: { paddingHorizontal: 9, paddingVertical: 3.5, borderRadius: 10, backgroundColor: 'rgba(224, 94, 154, 0.14)', borderWidth: 1, borderColor: 'rgba(224, 94, 154, 0.24)' },
  modalBadgeText: { fontSize: 9.5, fontWeight: '700', color: '#B04278', letterSpacing: 0.6 },
  modalTitle: { fontSize: 19, fontWeight: '800', color: '#34264C', textAlign: 'center', letterSpacing: -0.2 },
  modalBody: { fontSize: 13, lineHeight: 19, color: '#76648E', textAlign: 'center', marginTop: 8, marginBottom: 16 },
  modalPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 20 },
  modalPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.88)', borderWidth: 1, borderColor: 'rgba(224, 94, 154, 0.20)' },
  modalPillText: { fontSize: 11, fontWeight: '600', color: '#8A5877' },
  modalActionBtn: { width: '100%', paddingVertical: 12, borderRadius: 16, backgroundColor: '#8B7BEF', alignItems: 'center', justifyContent: 'center', shadowColor: '#8B7BEF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 3 },
  modalActionText: { fontSize: 14.5, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },
});
