/** Validation issues grouped by photo, with a Retake button for photos that must be redone. */
import { StyleSheet, Text, View } from 'react-native';
import { DashboardCard } from '@/features/home/dashboard/DashboardCard';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import { CAPTURE_STEPS, type CaptureStepId } from '../avatarSteps';
import type { ValidationIssue } from '../types/avatarProfile';
import { SoftButton } from './SoftButton';

type AvatarIssuesListProps = {
  issues: readonly ValidationIssue[];
  onRetake?: (view: CaptureStepId) => void;
};

export function AvatarIssuesList({ issues, onRetake }: AvatarIssuesListProps) {
  const groups = CAPTURE_STEPS.map((step) => ({
    step,
    issues: issues.filter((issue) => issue.view === step.id),
  })).filter((group) => group.issues.length > 0);

  if (groups.length === 0) return null;

  return (
    <View style={styles.list}>
      {groups.map(({ step, issues: viewIssues }) => {
        const blocking = viewIssues.some((issue) => issue.severity === 'error');
        return (
          <DashboardCard key={step.id} style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.view}>{step.title}</Text>
              <View style={[styles.badge, blocking ? styles.badgeError : styles.badgeWarning]}>
                <Text style={[styles.badgeText, blocking ? styles.badgeTextError : styles.badgeTextWarning]}>
                  {blocking ? 'Retake needed' : 'Tip'}
                </Text>
              </View>
            </View>
            {viewIssues.map((issue) => (
              <Text key={issue.code} style={styles.message}>
                {issue.message}
              </Text>
            ))}
            {blocking && onRetake ? (
              <SoftButton label={`Retake ${step.shortTitle.toLowerCase()} photo`} onPress={() => onRetake(step.id)} compact />
            ) : null}
          </DashboardCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: { gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  view: { fontSize: 15, fontWeight: '700', color: dashboardTheme.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeError: { backgroundColor: 'rgba(232, 120, 150, 0.16)' },
  badgeWarning: { backgroundColor: 'rgba(150, 130, 230, 0.14)' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextError: { color: '#B0476A' },
  badgeTextWarning: { color: dashboardTheme.accent },
  message: { fontSize: 13, lineHeight: 19, color: dashboardTheme.muted },
});
