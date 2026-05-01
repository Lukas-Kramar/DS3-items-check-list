import { loadState, saveState } from "./storage.js";
import { STORAGE_KEY, STORAGE_KEY_SPELLS, STORAGE_KEY_RINGS, STORAGE_KEY_ARMOR } from "./constants.js";
import type { ChecklistState } from "./types.js";
import weaponsData from "./data/weapons.json";
import spellsData from "./data/spells.json";
import ringsData from "./data/rings.json";
import armorData from "./data/armor.json";

interface DataSet {
  cardId: string;
  storageKey: string;
  total: number;
}

interface BundledSave {
  weapons?: ChecklistState;
  spells?: ChecklistState;
  rings?: ChecklistState;
  armor?: ChecklistState;
}

const datasets: DataSet[] = [
  { cardId: "card-weapons", storageKey: STORAGE_KEY,        total: (weaponsData as unknown[]).length },
  { cardId: "card-spells",  storageKey: STORAGE_KEY_SPELLS, total: (spellsData  as unknown[]).length },
  { cardId: "card-rings",   storageKey: STORAGE_KEY_RINGS,  total: (ringsData   as unknown[]).length },
  { cardId: "card-armor",   storageKey: STORAGE_KEY_ARMOR,  total: (armorData   as unknown[]).length },
];

function updateCard(ds: DataSet): void {
  const card = document.getElementById(ds.cardId);
  if (!card) return;

  const checklist = loadState(ds.storageKey);
  const obtained = Object.values(checklist).filter((s) => s.obtained).length;
  const total = ds.total;
  const pct = total > 0 ? Math.round((obtained / total) * 100) : 0;

  const bar = card.querySelector<HTMLElement>(".progress-bar-fill");
  if (bar) bar.style.width = `${pct}%`;

  const count = card.querySelector<HTMLElement>(".dash-count");
  if (count) count.textContent = `${obtained} / ${total}`;

  const pctEl = card.querySelector<HTMLElement>(".dash-pct");
  if (pctEl) pctEl.textContent = `${pct}%`;
}

function init(): void {
  for (const ds of datasets) {
    updateCard(ds);
  }
}

function bindExportImport(): void {
  const exportBtn = document.getElementById("btn-export-all");
  const importBtn = document.getElementById("btn-import-all");
  const importInput = document.getElementById("import-file-all") as HTMLInputElement | null;

  exportBtn?.addEventListener("click", () => {
    const bundle: BundledSave = {
      weapons: loadState(STORAGE_KEY),
      spells:  loadState(STORAGE_KEY_SPELLS),
      rings:   loadState(STORAGE_KEY_RINGS),
      armor:   loadState(STORAGE_KEY_ARMOR),
    };
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ds3-checklist-all.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  importBtn?.addEventListener("click", () => importInput?.click());

  importInput?.addEventListener("change", () => {
    const file = importInput?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as BundledSave;
        if (!parsed.weapons && !parsed.spells && !parsed.rings && !parsed.armor) {
          alert("Invalid save file.");
          return;
        }
        if (parsed.weapons) saveState(parsed.weapons, STORAGE_KEY);
        if (parsed.spells)  saveState(parsed.spells,  STORAGE_KEY_SPELLS);
        if (parsed.rings)   saveState(parsed.rings,   STORAGE_KEY_RINGS);
        if (parsed.armor)   saveState(parsed.armor,   STORAGE_KEY_ARMOR);
        init();
      } catch {
        alert("Invalid save file.");
      }
    };
    reader.readAsText(file);
    if (importInput) importInput.value = "";
  });
}

init();
bindExportImport();
