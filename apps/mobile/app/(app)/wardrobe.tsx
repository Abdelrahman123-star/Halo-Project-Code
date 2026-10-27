import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, radius, spacing } from '@/shared/theme/tokens';
import { Banner } from '@/shared/ui/Banner';
import { Button } from '@/shared/ui/Button';
import { FloatingNavBar, type NavTab } from '@/shared/ui/FloatingNavBar';
import { HaloLogo } from '@/shared/ui/HaloLogo';
import { Screen } from '@/shared/ui/Screen';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Footwear'] as const;

export default function WardrobeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [notice, setNotice] = useState<string | null>(null);

  function handleAddGarment() {
    setNotice(
      'Garment pipeline: Camera capture & CV garment analysis (category, pattern, color) will be connected in Phase 3.',
    );
  }

  function handleSelectTab(tab: NavTab) {
    if (tab === 'home') router.push('/(app)');
    else if (tab === 'avatar') router.push('/(app)/avatar');
    else if (tab === 'profile') router.push('/(app)/profile');
  }

  return (
    <View style={styles.outer}>
      <Screen variant="midnight" contentStyle={styles.screenContent}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Digital Closet</Text>
            <Text style={styles.subtitle}>Your scanned wardrobe & 3D garments</Text>
          </View>
          <HaloLogo size="small" />
        </View>

        {notice ? <Banner tone="success" message={notice} /> : null}

        {/* Category Horizontal Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[styles.categoryText, isSelected && styles.categoryTextActive]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Empty State / Garment Grid */}
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <View style={styles.emptyIconHanger} />
          </View>
          <Text style={styles.emptyTitle}>No garments in this category</Text>
          <Text style={styles.emptySubtitle}>
            Photograph real clothes to analyze their silhouette, color, and fabric.
          </Text>
          <Button
            label="+ Add garment"
            variant="luminous"
            onPress={handleAddGarment}
            style={styles.addButton}
          />
        </View>
      </Screen>

      {/* Floating Bottom Nav */}
      <FloatingNavBar currentTab="wardrobe" onSelectTab={handleSelectTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  screenContent: {
    paddingBottom: 110,
    justifyContent: 'flex-start',
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: '300',
    color: colors.luminousWhite,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: fontSize.small,
    color: colors.silver,
    marginTop: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(184, 174, 216, 0.22)',
    borderColor: colors.lavender,
  },
  categoryText: {
    color: colors.textMuted,
    fontSize: fontSize.small,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: colors.luminousWhite,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(184, 174, 216, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(184, 174, 216, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyIconHanger: {
    width: 28,
    height: 18,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.lavender,
    borderRadius: 4,
  },
  emptyTitle: {
    color: colors.luminousWhite,
    fontSize: fontSize.heading - 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.small,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  addButton: {
    marginTop: spacing.md,
    width: 180,
  },
});
