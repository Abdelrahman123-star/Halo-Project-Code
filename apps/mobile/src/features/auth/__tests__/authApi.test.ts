import { friendlyMessage } from '../api/authApi';

describe('friendlyMessage', () => {
  it('maps invalid login credentials', () => {
    expect(friendlyMessage('Invalid login credentials')).toBe('Incorrect email or password.');
  });

  it('maps user already registered', () => {
    expect(friendlyMessage('User already registered')).toBe(
      'An account with this email already exists.',
    );
  });

  it('maps email not confirmed', () => {
    expect(friendlyMessage('Email not confirmed')).toBe(
      'Please confirm your email first, then log in.',
    );
  });

  it('maps rate limit errors', () => {
    expect(friendlyMessage('over_email_send_rate_limit')).toBe(
      'Too many attempts. Please wait a minute and retry.',
    );
  });

  it('maps network failures', () => {
    expect(friendlyMessage('Failed to fetch')).toBe(
      'Network problem. Check your connection and try again.',
    );
  });
});
