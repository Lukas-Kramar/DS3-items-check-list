import { STORAGE_KEY } from "./constants.js";
import type { ChecklistState, WeaponState } from "./types.js";

export function loadState(key: string = STORAGE_KEY): ChecklistState {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    return JSON.parse(raw) as ChecklistState;
  } catch {
    return {};
  }
}

export function saveState(state: ChecklistState, key: string = STORAGE_KEY): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable (private browsing quota exceeded)
  }
}

export function getWeaponState(state: ChecklistState, id: string): WeaponState {
  return state[id] ?? { obtained: false, note: "" };
}

export function patchWeapon(
  state: ChecklistState,
  id: string,
  patch: Partial<WeaponState>
): ChecklistState {
  const current = getWeaponState(state, id);
  return { ...state, [id]: { ...current, ...patch } };
}
