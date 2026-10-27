import { useEffect, useState } from 'react';
import { fetchMyProfile, type Profile } from '../api/profileApi';

type State =
  | { status: 'loading' }
  | { status: 'ready'; profile: Profile | null }
  | { status: 'error'; message: string };

export function useMyProfile(userId: string) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    fetchMyProfile(userId)
      .then((profile) => active && setState({ status: 'ready', profile }))
      .catch((error: Error) => active && setState({ status: 'error', message: error.message }));
    return () => {
      active = false;
    };
  }, [userId]);

  return state;
}
