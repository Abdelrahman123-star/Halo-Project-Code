/**
 * useAuthTransition — shared context that lets the welcome screen trigger
 * the hero logo transition, and lets the overlay report when it's done.
 *
 * Usage:
 *   const { triggerTransition } = useAuthTransition();
 *   triggerTransition('/(auth)/login');
 */
import { createContext, useContext } from 'react';

export type AuthDest = '/(auth)/login' | '/(auth)/register';

export type AuthTransitionCtxType = {
  /** Called by welcome screen buttons to kick off the transition. */
  triggerTransition: (dest: AuthDest) => void;
  /** True while the overlay is animating. */
  active: boolean;
  /** The destination route for the current transition. */
  destination: AuthDest | null;
  /** Called by the overlay after its fade-out completes. */
  clear: () => void;
};

export const AuthTransitionContext = createContext<AuthTransitionCtxType>({
  triggerTransition: () => undefined,
  active: false,
  destination: null,
  clear: () => undefined,
});

export function useAuthTransition(): AuthTransitionCtxType {
  return useContext(AuthTransitionContext);
}
