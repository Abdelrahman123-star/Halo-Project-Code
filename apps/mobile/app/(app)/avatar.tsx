import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from '@/features/avatar/components/AvatarStudioStyles';
import { colors, fontSize, radius, spacing } from '@/shared/theme/tokens';
import { Banner } from '@/shared/ui/Banner';
import { Button } from '@/shared/ui/Button';
import { FloatingNavBar, type NavTab } from '@/shared/ui/FloatingNavBar';
import { HaloLogo } from '@/shared/ui/HaloLogo';
import { Screen } from '@/shared/ui/Screen';

const SKIN_TONES = ['#F5D6BD', '#E0B596', '#C68661', '#8D5524', '#4E311B'];
const HAIR_COLORS = ['#1C1B1A', '#4A3728', '#8A6240', '#D6C4A5', '#B8AED8'];
const HAIRSTYLES = ['Natural', 'Sleek Fade', 'Textured Waves', 'Braids', 'Minimal Bob'];

export default function AvatarStudioScreen() {
  const router = useRouter();
  const [selectedSkin, setSelectedSkin] = useState<string>(SKIN_TONES[0]);
  const [selectedHair, setSelectedHair] = useState<string>(HAIR_COLORS[0]);
  const [selectedStyle, setSelectedStyle] = useState<string>(HAIRSTYLES[0]);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  function handleSaveAvatar() {
    setSavedBanner('Avatar customizations saved to your profile.');
  }

  function handleSelectTab(tab: NavTab) {
    if (tab === 'home') router.push('/(app)');
    else if (tab === 'wardrobe') router.push('/(app)/wardrobe');
    else if (tab === 'profile') router.push('/(app)/profile');
  }

  return (
    <View style={styles.outer}>
      <Screen variant="midnight" contentStyle={styles.screenContent}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Avatar Studio</Text>
            <Text style={styles.subtitle}>Customize your digital twin</Text>
          </View>
          <HaloLogo size="small" />
        </View>

        {savedBanner ? <Banner tone="success" message={savedBanner} /> : null}

        {/* 3D Studio Viewport Stage */}
        <View style={styles.viewportStage}>
          {/* Ambient Lighting Studio Ring */}
          <View style={styles.studioLightingRing} />

          {/* Avatar Preview Figure */}
          <View style={styles.figureContainer}>
            <View
              style={[
                styles.figureHead,
                { backgroundColor: selectedSkin },
              ]}
            >
              <View
                style={[
                  styles.figureHair,
                  { backgroundColor: selectedHair },
                ]}
              />
            </View>
            <View
              style={[
                styles.figureTorso,
                { backgroundColor: '#282F40' },
              ]}
            />
          </View>

          {/* 3D Pipeline Integration Badge */}
          <View style={styles.pipelineBadge}>
            <Text style={styles.pipelineText}>3D Rigged GLB Viewport (Spike A / ADR-0002)</Text>
          </View>
        </View>

        {/* Customization Controls */}
        <View style={styles.controlsCard}>
          {/* Skin Tone */}
          <View style={styles.controlSection}>
            <Text style={styles.controlLabel}>Skin Tone</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paletteRow}>
              {SKIN_TONES.map((tone) => {
                const isSelected = selectedSkin === tone;
                return (
                  <Pressable
                    key={tone}
                    onPress={() => setSelectedSkin(tone)}
                    style={[
                      styles.swatch,
                      { backgroundColor: tone },
                      isSelected && styles.swatchActive,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select skin tone ${tone}`}
                  />
                );
              })}
            </ScrollView>
          </View>

          {/* Hair Color */}
          <View style={styles.controlSection}>
            <Text style={styles.controlLabel}>Hair Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paletteRow}>
              {HAIR_COLORS.map((color) => {
                const isSelected = selectedHair === color;
                return (
                  <Pressable
                    key={color}
                    onPress={() => setSelectedHair(color)}
                    style={[
                      styles.swatch,
                      { backgroundColor: color },
                      isSelected && styles.swatchActive,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select hair color ${color}`}
                  />
                );
              })}
            </ScrollView>
          </View>

          {/* Hairstyle */}
          <View style={styles.controlSection}>
            <Text style={styles.controlLabel}>Hairstyle</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paletteRow}>
              {HAIRSTYLES.map((style) => {
                const isSelected = selectedStyle === style;
                return (
                  <Pressable
                    key={style}
                    onPress={() => setSelectedStyle(style)}
                    style={[styles.styleChip, isSelected && styles.styleChipActive]}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[styles.styleChipText, isSelected && styles.styleChipTextActive]}
                    >
                      {style}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <Button
            label="Save customizations"
            variant="luminous"
            onPress={handleSaveAvatar}
            style={styles.saveBtn}
          />
        </View>
      </Screen>

      <FloatingNavBar currentTab="avatar" onSelectTab={handleSelectTab} />
    </View>
  );
}

