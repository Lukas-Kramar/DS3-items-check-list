import type { Weapon, ChecklistState, FilterState } from "./types.js";
import { loadState, saveState, patchWeapon } from "./storage.js";
import { MAX_NOTE_LENGTH } from "./constants.js";

export interface AppState {
  weapons: Weapon[];
  checklist: ChecklistState;
  filters: FilterState;
}

export const appState: AppState = {
  weapons: [],
  checklist: {},
  filters: {
    search: "",
    weaponClass: "all",
    damageType: "all",
    dlcOnly: false,
    unobtainedOnly: false,
    sortBy: "name-asc",
  },
};

export function initChecklist(): void {
  appState.checklist = loadState();
}

export function setObtained(id: string, obtained: boolean): void {
  appState.checklist = patchWeapon(appState.checklist, id, { obtained });
  saveState(appState.checklist);
}

export function setNote(id: string, note: string): void {
  const trimmed = note.slice(0, MAX_NOTE_LENGTH);
  appState.checklist = patchWeapon(appState.checklist, id, { note: trimmed });
  saveState(appState.checklist);
}

export function resetChecklist(): void {
  const updated: ChecklistState = {};
  for (const id of Object.keys(appState.checklist)) {
    updated[id] = { ...appState.checklist[id], obtained: false };
  }
  for (const w of appState.weapons) {
    if (!updated[w.id]) updated[w.id] = { obtained: false, note: "" };
    else updated[w.id] = { ...updated[w.id], obtained: false };
  }
  appState.checklist = updated;
  saveState(appState.checklist);
}

export function resetNotes(): void {
  const updated: ChecklistState = {};
  for (const w of appState.weapons) {
    const current = appState.checklist[w.id] ?? { obtained: false, note: "" };
    updated[w.id] = { ...current, note: "" };
  }
  appState.checklist = updated;
  saveState(appState.checklist);
}

export function exportState(): string {
  return JSON.stringify(appState.checklist, null, 2);
}

export function importState(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as ChecklistState;
    appState.checklist = parsed;
    saveState(appState.checklist);
    return true;
  } catch {
    return false;
  }
}
