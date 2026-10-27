import { useCallback, useState } from 'react';
import { fieldErrors, registerSchema } from '../schemas';
import { signUp } from '../api/authApi';

type Field = 'displayName' | 'email' | 'password' | 'confirmPassword';

/** Orchestrates sign-up. `confirmationSent` is true when Supabase requires email verification. */
export function useRegisterForm() {
  const [values, setValues] = useState<Record<Field, string>>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const setField = useCallback(
    (name: Field) => (text: string) =>
      setValues((previous) => ({ ...previous, [name]: text })),
    [],
  );

  async function submit() {
    setFormError(null);
    const payload = {
      ...values,
      confirmPassword: values.confirmPassword || values.password,
    };
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setLoading(true);
    const result = await signUp(parsed.data);
    setLoading(false);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    // Without confirmation a session already exists and the gate redirects to Home.
    if (result.needsEmailConfirmation) setConfirmationSent(true);
  }

  return { values, errors, formError, confirmationSent, loading, setField, submit };
}
