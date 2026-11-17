import { useSyncExternalStore } from "react";

// Presentation state only. Never use this to authorize data or server operations.
let entered = false;
const listeners = new Set<() => void>();
export function setPresentationEntered(value: boolean) {
  entered = value;
  listeners.forEach(listener => listener());
}
export function usePresentationEntered() {
  return useSyncExternalStore(
    listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    () => entered,
    () => false,
  );
}