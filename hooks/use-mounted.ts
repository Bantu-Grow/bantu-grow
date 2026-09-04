'use client'

import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * Returns false during SSR and the first client render, then true once mounted.
 *
 * Uses useSyncExternalStore instead of the setState-in-effect pattern, which
 * triggers cascading renders (and the react-hooks/set-state-in-effect rule).
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}
