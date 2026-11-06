/**
 * Display-name resolution for the signed-in user.
 *
 * Order: the `profiles.display_name` row (source of truth once loaded), then
 * the name captured at sign-up in auth metadata. Returns null when nothing
 * usable exists, so the UI can show a neutral greeting instead of guessing.
 */
type NameSources = {
  profileName?: string | null;
  metadata?: Record<string, unknown> | null;
};

function cleanName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function resolveDisplayName({ profileName, metadata }: NameSources): string | null {
  return (
    cleanName(profileName) ??
    cleanName(metadata?.display_name) ??
    cleanName(metadata?.full_name) ??
    null
  );
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}
