import { StyleSheet } from 'react-native';
import { colors, fontSize, radius, spacing } from '@/shared/theme/tokens';

export const styles = StyleSheet.create({
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
  viewportStage: {
    height: 240,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  studioLightingRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: 'rgba(184, 174, 216, 0.18)',
    backgroundColor: 'rgba(184, 174, 216, 0.04)',
  },
  figureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  figureHead: {
    width: 50,
    height: 60,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 205, 212, 0.3)',
    alignItems: 'center',
  },
  figureHair: {
    width: 48,
    height: 22,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  figureTorso: {
    width: 76,
    height: 70,
    marginTop: 4,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(201, 205, 212, 0.15)',
  },
  pipelineBadge: {
    position: 'absolute',
    bottom: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(23, 27, 39, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(201, 205, 212, 0.15)',
  },
  pipelineText: {
    color: colors.lavender,
    fontSize: fontSize.micro,
    fontWeight: '500',
  },
  controlsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  controlSection: {
    gap: spacing.xs,
  },
  controlLabel: {
    color: colors.silver,
    fontSize: fontSize.small,
    fontWeight: '500',
  },
  paletteRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchActive: {
    borderColor: colors.luminousWhite,
    transform: [{ scale: 1.1 }],
  },
  styleChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  styleChipActive: {
    borderColor: colors.lavender,
    backgroundColor: 'rgba(184, 174, 216, 0.2)',
  },
  styleChipText: {
    color: colors.textMuted,
    fontSize: fontSize.small,
  },
  styleChipTextActive: {
    color: colors.luminousWhite,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: spacing.xs,
  },
});
