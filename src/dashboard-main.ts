import { loadState } from "./storage.js";
import { STORAGE_KEY, STORAGE_KEY_SPELLS, STORAGE_KEY_RINGS, STORAGE_KEY_ARMOR } from "./constants.js";
import weaponsData from "./data/weapons.json";
import spellsData from "./data/spells.json";
import ringsData from "./data/rings.json";
import armorData from "./data/armor.json";

interface DataSet {
  cardId: string;
  storageKey: string;
  total: number;
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

init();
