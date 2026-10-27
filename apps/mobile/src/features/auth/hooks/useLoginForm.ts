import { useState } from 'react';
import { fieldErrors, loginSchema } from '../schemas';
import { signIn } from '../api/authApi';

/** Orchestrates login: validate → call API → expose errors. Navigation happens via the session gate. */
export function useLoginForm() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setField = (name: 'email' | 'password') => (text: string) =>
    setValues((previous) => ({ ...previous, [name]: text }));

  async function submit() {
    setFormError(null);
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setLoading(true);
    const result = await signIn(parsed.data);
    setLoading(false);
    if (!result.ok) setFormError(result.message);
  }

  return { values, errors, formError, loading, setField, submit };
}
