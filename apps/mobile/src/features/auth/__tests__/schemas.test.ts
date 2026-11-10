import { fieldErrors, loginSchema, registerSchema } from '../schemas';

const validRegistration = {
  displayName: 'Sara',
  gender: 'female' as const,
  email: 'sara@example.com',
  password: 'Passw0rdOK',
  confirmPassword: 'Passw0rdOK',
};

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });

  it('rejects an empty email and empty password', () => {
    const result = loginSchema.safeParse({ email: '', password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(errors.email).toBe('Email is required.');
      expect(errors.password).toBe('Password is required.');
    }
  });

  it('rejects a malformed email', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('accepts a valid registration', () => {
    expect(registerSchema.safeParse(validRegistration).success).toBe(true);
  });

  it('rejects short passwords', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: 'a1',
      confirmPassword: 'a1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects passwords without a number or letter', () => {
    expect(
      registerSchema.safeParse({ ...validRegistration, password: 'abcdefgh', confirmPassword: 'abcdefgh' })
        .success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ ...validRegistration, password: '12345678', confirmPassword: '12345678' })
        .success,
    ).toBe(false);
  });

  it('reports a mismatch on confirmPassword', () => {
    const result = registerSchema.safeParse({ ...validRegistration, confirmPassword: 'different1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error).confirmPassword).toBe('Passwords do not match.');
    }
  });

  it('requires a name', () => {
    expect(registerSchema.safeParse({ ...validRegistration, displayName: '  ' }).success).toBe(false);
  });

  it('accepts male as a valid gender', () => {
    expect(registerSchema.safeParse({ ...validRegistration, gender: 'male' }).success).toBe(true);
  });

  it('accepts female as a valid gender', () => {
    expect(registerSchema.safeParse({ ...validRegistration, gender: 'female' }).success).toBe(true);
  });

  it('rejects missing or empty gender', () => {
    const withoutGender = { ...validRegistration };
    delete (withoutGender as { gender?: unknown }).gender;
    const missingResult = registerSchema.safeParse(withoutGender);
    expect(missingResult.success).toBe(false);
    if (!missingResult.success) {
      expect(fieldErrors(missingResult.error).gender).toBe('Please select Female or Male.');
    }

    const emptyResult = registerSchema.safeParse({ ...validRegistration, gender: '' });
    expect(emptyResult.success).toBe(false);
    if (!emptyResult.success) {
      expect(fieldErrors(emptyResult.error).gender).toBe('Please select Female or Male.');
    }
  });

  it('rejects any gender options other than female or male', () => {
    const invalidResult = registerSchema.safeParse({
      ...validRegistration,
      gender: 'other',
    });
    expect(invalidResult.success).toBe(false);
    if (!invalidResult.success) {
      expect(fieldErrors(invalidResult.error).gender).toBe('Please select Female or Male.');
    }
  });
});
