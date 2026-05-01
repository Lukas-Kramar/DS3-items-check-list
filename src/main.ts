import type { Weapon } from "./types.js";
import { appState, initChecklist, resetChecklist, resetNotes } from "./state.js";
import { renderCards, renderCounter, renderFilterOptions, renderStatsPanel } from "./render.js";
import { SEARCH_DEBOUNCE_MS } from "./constants.js";
import weaponsData from "./data/weapons.json";

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}


function bindFilters(): void {
  const searchInput = document.getElementById("search-input") as HTMLInputElement | null;
  const classSelect = document.getElementById("filter-class") as HTMLSelectElement | null;
  const dmgSelect = document.getElementById("filter-damage") as HTMLSelectElement | null;
  const dlcToggle = document.getElementById("toggle-dlc") as HTMLInputElement | null;
  const unobtainedToggle = document.getElementById("toggle-unobtained") as HTMLInputElement | null;
  const sortSelect = document.getElementById("sort-select") as HTMLSelectElement | null;

  const rerender = () => {
    renderCards();
    renderCounter();
    renderStatsPanel();
  };

  const debouncedSearch = debounce(() => rerender(), SEARCH_DEBOUNCE_MS);

  searchInput?.addEventListener("input", () => {
    appState.filters.search = searchInput.value;
    debouncedSearch();
  });

  classSelect?.addEventListener("change", () => {
    appState.filters.weaponClass = classSelect.value;
    rerender();
  });

  dmgSelect?.addEventListener("change", () => {
    appState.filters.damageType = dmgSelect.value;
    rerender();
  });

  dlcToggle?.addEventListener("change", () => {
    appState.filters.dlcOnly = dlcToggle.checked;
    rerender();
  });

  unobtainedToggle?.addEventListener("change", () => {
    appState.filters.unobtainedOnly = unobtainedToggle.checked;
    rerender();
  });

  sortSelect?.addEventListener("change", () => {
    appState.filters.sortBy = sortSelect.value as typeof appState.filters.sortBy;
    rerender();
  });
}

function bindResetControls(): void {
  const resetChecklistBtn = document.getElementById("btn-reset-checklist");
  const resetNotesBtn = document.getElementById("btn-reset-notes");

  resetChecklistBtn?.addEventListener("click", () => {
    if (!window.confirm("Reset all obtained marks? Notes will be kept.")) return;
    resetChecklist();
    renderCards();
    renderCounter();
    renderStatsPanel();
  });

  resetNotesBtn?.addEventListener("click", () => {
    if (!window.confirm("Clear all notes? Obtained marks will be kept.")) return;
    resetNotes();
    renderCards();
    renderCounter();
    renderStatsPanel();
  });
}

// BONUS: keyboard shortcuts
function bindKeyboardShortcuts(): void {
  document.addEventListener("keydown", (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (e.key === "/" ) {
      e.preventDefault();
      const s = document.getElementById("search-input") as HTMLInputElement | null;
      s?.focus();
    }

    if (e.key === "s" && !e.ctrlKey && !e.metaKey) {
      const panel = document.getElementById("stats-container");
      if (!panel) return;
      panel.classList.toggle("collapsed");
    }
  });
}

function bindStatsToggle(): void {
  const toggle = document.getElementById("stats-toggle");
  const container = document.getElementById("stats-container");
  toggle?.addEventListener("click", () => container?.classList.toggle("collapsed"));
}

function init(): void {
  appState.weapons = weaponsData as Weapon[];
  initChecklist();
  renderFilterOptions();
  renderCards();
  renderCounter();
  renderStatsPanel();
  bindFilters();
  bindResetControls();
  bindKeyboardShortcuts();
  bindStatsToggle();
}

init();
