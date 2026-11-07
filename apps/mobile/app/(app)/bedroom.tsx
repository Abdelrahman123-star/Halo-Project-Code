/**
 * BedroomScreen — Bedroom & Dressing Suite.
 * Reached by entering the "BEDROOM" door in the hallway.
 * Redesigned with ui-ux-pro-max: frosted glass cards, tactile micro-interactions,
 * clear action affordance, and HALO's dreamy pastel aesthetic.
 */
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PastelBlobBackground } from '@/features/auth/components/PastelBlobBackground';
import { FadeInView } from '@/features/home/components/FadeInView';
import { BedroomPortalCard } from '@/features/home/components/BedroomPortalCard';
import { ChevronLeftIcon, HangerIcon, ProfileIcon } from '@/features/home/components/HomeIcons';

export default function BedroomScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <PastelBlobBackground animated={false} />

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
                <Text style={styles.suiteBadgeText}>SUITE 01 · DRESSING ROOM</Text>
              </View>
              <Text style={styles.title}>The Bedroom</Text>
              <Text style={styles.subtitle}>
                Your private styling sanctuary. Organize real clothing with CV curation or step into the 3D dressing suite.
              </Text>
            </View>
          </FadeInView>

          {/* Interactive room feature cards */}
          <FadeInView delayMs={30} fromTranslateY={8}>
            <BedroomPortalCard
              title="Digital Wardrobe"
              description="Scan and catalogue your real clothes with automated CV tagging, color palette matching, and smart categorization."
              badgeText="AI CURATION"
              badgeVariant="lilac"
              tags={['CV Scan', 'Catalogue', 'Hangers']}
              icon={<HangerIcon size={24} color="#644498" />}
              gradientColors={['rgba(255, 255, 255, 0.94)', 'rgba(247, 243, 255, 0.85)']}
              iconGradientColors={['#EFE9FD', '#E2D7FC']}
              arrowColor="#6B5299"
              onPress={() => router.push('/(app)/garment')}
              accessibilityLabel="Open Digital Wardrobe"
            />
          </FadeInView>

          <FadeInView delayMs={70} fromTranslateY={8}>
            <BedroomPortalCard
              title="3D Dressing Suite"
              description="Personalized 3D avatar fitting room. Try on digital garments, test outfit drape, and view from any 360° angle."
              badgeText="3D VIRTUAL FIT"
              badgeVariant="periwinkle"
              tags={['Stylized Avatar', 'Virtual Try-On']}
              icon={<ProfileIcon size={24} color="#4865B8" />}
              gradientColors={['rgba(255, 255, 255, 0.94)', 'rgba(242, 247, 255, 0.85)']}
              iconGradientColors={['#E9F0FE', '#D7E5FC']}
              arrowColor="#4865B8"
              onPress={() => router.push('/(app)/create-avatar')}
              accessibilityLabel="Open 3D Dressing Suite"
            />
          </FadeInView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EEF2FB',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 110,
    gap: 16,
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
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B5299',
  },
  btnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  logo: {
    width: 96,
    height: 40,
  },
  headerSpacer: {
    width: 80,
  },
  titleWrap: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  suiteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 14,
    backgroundColor: 'rgba(217, 207, 241, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  suiteBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B7BEF',
    marginRight: 6,
  },
  suiteBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B5299',
    letterSpacing: 0.7,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#34264C',
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 6,
    maxWidth: 320,
    fontSize: 13.5,
    lineHeight: 19.5,
    color: '#76648E',
    textAlign: 'center',
  },
});
