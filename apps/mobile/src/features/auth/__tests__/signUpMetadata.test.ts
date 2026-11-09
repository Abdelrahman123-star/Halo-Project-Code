const mockSignUp = jest.fn();

jest.mock('@/shared/lib/supabase', () => ({
  supabase: { auth: { signUp: (...args: unknown[]) => mockSignUp(...args) } },
}));

import { signUp } from '../api/authApi';

describe('signUp', () => {
  beforeEach(() => {
    mockSignUp.mockReset();
    mockSignUp.mockResolvedValue({ data: { user: { identities: [{}] }, session: null }, error: null });
  });

  it('stores the chosen gender in the sign-up metadata with the name', async () => {
    await signUp({
      displayName: '  Sara ',
      gender: 'female',
      email: ' sara@example.com ',
      password: 'Passw0rdOK',
      confirmPassword: 'Passw0rdOK',
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'sara@example.com',
      password: 'Passw0rdOK',
      options: { data: { display_name: 'Sara', gender: 'female' } },
    });
  });
});
