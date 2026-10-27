import { cleanSupabaseUrl } from '../supabase';

describe('cleanSupabaseUrl', () => {
  it('handles undefined and empty string', () => {
    expect(cleanSupabaseUrl(undefined)).toBeUndefined();
    expect(cleanSupabaseUrl('')).toBeUndefined();
  });

  it('preserves clean URLs without trailing slashes', () => {
    expect(cleanSupabaseUrl('https://xyz.supabase.co')).toBe('https://xyz.supabase.co');
  });

  it('removes trailing slash', () => {
    expect(cleanSupabaseUrl('https://xyz.supabase.co/')).toBe('https://xyz.supabase.co');
    expect(cleanSupabaseUrl('https://xyz.supabase.co///')).toBe('https://xyz.supabase.co');
  });

  it('strips accidental /rest/v1 or /rest/v1/ suffix', () => {
    expect(cleanSupabaseUrl('https://xyz.supabase.co/rest/v1')).toBe('https://xyz.supabase.co');
    expect(cleanSupabaseUrl('https://xyz.supabase.co/rest/v1/')).toBe('https://xyz.supabase.co');
  });

  it('trims leading and trailing whitespace', () => {
    expect(cleanSupabaseUrl('  https://xyz.supabase.co/rest/v1/  ')).toBe(
      'https://xyz.supabase.co',
    );
  });
});
