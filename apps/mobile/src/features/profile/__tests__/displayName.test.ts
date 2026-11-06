import { firstName, resolveDisplayName } from '../displayName';

describe('resolveDisplayName', () => {
  it('prefers the profile row name', () => {
    expect(
      resolveDisplayName({ profileName: 'Farah Khaled', metadata: { display_name: 'Old Name' } }),
    ).toBe('Farah Khaled');
  });

  it('falls back to sign-up metadata display_name, then full_name', () => {
    expect(resolveDisplayName({ profileName: null, metadata: { display_name: ' Mona ' } })).toBe('Mona');
    expect(resolveDisplayName({ metadata: { full_name: 'Sara Ali' } })).toBe('Sara Ali');
  });

  it('ignores blank or non-string values', () => {
    expect(resolveDisplayName({ profileName: '   ', metadata: { display_name: 42, full_name: '' } })).toBeNull();
  });

  it('returns null when nothing is known', () => {
    expect(resolveDisplayName({})).toBeNull();
    expect(resolveDisplayName({ profileName: undefined, metadata: null })).toBeNull();
  });
});

describe('firstName', () => {
  it('returns the first word of a full name', () => {
    expect(firstName('Farah Khaled')).toBe('Farah');
    expect(firstName('  Nour  ')).toBe('Nour');
  });
});
