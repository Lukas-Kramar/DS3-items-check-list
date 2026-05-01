import type { SimpleItem, SimpleFilterState, SimpleSortOption, ChecklistState } from "./types.js";
import { loadState, saveState, getWeaponState, patchWeapon } from "./storage.js";
import { MAX_NOTE_LENGTH, NOTE_DEBOUNCE_MS, SEARCH_DEBOUNCE_MS } from "./constants.js";

interface SimplePageState {
  items: SimpleItem[];
  checklist: ChecklistState;
  filters: SimpleFilterState;
  storageKey: string;
}

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function getUniqueCategories(items: SimpleItem[]): string[] {
  return [...new Set(items.map((i) => i.category))].sort();
}

function filterItems(items: SimpleItem[], filters: SimpleFilterState, checklist: ChecklistState): SimpleItem[] {
  const search = filters.search.toLowerCase().trim();
  let result = items.filter((item) => {
    if (search && !item.name.toLowerCase().includes(search)) return false;
    if (filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.unobtainedOnly && getWeaponState(checklist, item.id).obtained) return false;
    return true;
  });
  return sortItems(result, filters.sortBy, checklist);
}

function sortItems(items: SimpleItem[], sortBy: SimpleSortOption, checklist: ChecklistState): SimpleItem[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case "game-order":
        return a.category.localeCompare(b.category) || a.order - b.order;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "obtained-last": {
        const aObt = getWeaponState(checklist, a.id).obtained ? 1 : 0;
        const bObt = getWeaponState(checklist, b.id).obtained ? 1 : 0;
        return aObt - bObt || a.name.localeCompare(b.name);
      }
    }
  });
}

function renderCounter(state: SimplePageState): void {
  const el = document.getElementById("progress-counter");
  if (!el) return;
  const total = state.items.length;
  const obtained = state.items.filter((i) => getWeaponState(state.checklist, i.id).obtained).length;
  el.textContent = `${obtained} / ${total} obtained`;
  const pct = total > 0 ? Math.round((obtained / total) * 100) : 0;
  const bar = document.getElementById("progress-bar-fill");
  if (bar) bar.style.width = `${pct}%`;
}

function renderStats(state: SimplePageState): void {
  const panel = document.getElementById("stats-panel");
  if (!panel) return;
  const categories = getUniqueCategories(state.items);
  const rows = categories.map((cat) => {
    const inCat = state.items.filter((i) => i.category === cat);
    const done = inCat.filter((i) => getWeaponState(state.checklist, i.id).obtained).length;
    const pct = Math.round((done / inCat.length) * 100);
    return `<div class="stat-row">
      <span class="stat-label">${escHtml(cat)}</span>
      <div class="stat-bar-wrap"><div class="stat-bar-fill" style="width:${pct}%"></div></div>
      <span class="stat-count">${done}/${inCat.length}</span>
    </div>`;
  });
  panel.innerHTML = rows.join("");
}

function renderCategoryOptions(state: SimplePageState): void {
  const select = document.getElementById("filter-category") as HTMLSelectElement | null;
  if (!select) return;
  const categories = getUniqueCategories(state.items);
  select.innerHTML =
    `<option value="all">All Categories</option>` +
    categories.map((c) => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join("");
}

function buildCard(item: SimpleItem, state: SimplePageState): HTMLElement {
  const ws = getWeaponState(state.checklist, item.id);
  const card = document.createElement("article");
  card.className = `weapon-card${ws.obtained ? " obtained" : ""}${ws.note ? " has-note" : ""}`;
  card.dataset["id"] = item.id;

  const charCount = ws.note.length;
  const noteAtMax = charCount >= MAX_NOTE_LENGTH ? " at-max" : "";

  card.innerHTML = `
    <div class="card-header">
      <label class="checkbox-wrap">
        <input type="checkbox" class="weapon-checkbox" data-id="${item.id}" ${ws.obtained ? "checked" : ""}>
        <span class="checkmark"></span>
      </label>
      <div class="card-title-group">
        <h3 class="weapon-name">${escHtml(item.name)}</h3>
        <div class="badge-row">
          <span class="badge badge-class">${escHtml(item.category)}</span>
        </div>
      </div>
      <button class="note-toggle" data-id="${item.id}" aria-label="Toggle note">
        <span class="note-icon">${ws.note ? "✎" : "+"}</span>
      </button>
    </div>
    <div class="note-section" id="note-${item.id}" hidden>
      <textarea
        class="note-textarea"
        data-id="${item.id}"
        maxlength="${MAX_NOTE_LENGTH}"
        placeholder="Add a note…"
        rows="3"
      >${escHtml(ws.note)}</textarea>
      <span class="char-counter${noteAtMax}">${charCount} / ${MAX_NOTE_LENGTH}</span>
    </div>
  `;
  return card;
}

function renderCards(state: SimplePageState, debouncedNote: (id: string, val: string) => void): void {
  const container = document.getElementById("item-list");
  if (!container) return;

  const visible = filterItems(state.items, state.filters, state.checklist);

  if (visible.length === 0) {
    container.innerHTML = `<p class="no-results">No items match your filters.</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const item of visible) {
    fragment.appendChild(buildCard(item, state));
  }
  container.innerHTML = "";
  container.appendChild(fragment);

  container.querySelectorAll<HTMLInputElement>(".weapon-checkbox").forEach((cb) => {
    cb.addEventListener("change", () => {
      const id = cb.dataset["id"] ?? "";
      state.checklist = patchWeapon(state.checklist, id, { obtained: cb.checked });
      saveState(state.checklist, state.storageKey);
      cb.closest(".weapon-card")?.classList.toggle("obtained", cb.checked);
      renderCounter(state);
      renderStats(state);
    });
  });

  container.querySelectorAll<HTMLButtonElement>(".note-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset["id"] ?? "";
      const section = document.getElementById(`note-${id}`);
      if (!section) return;
      if (section.hasAttribute("hidden")) section.removeAttribute("hidden");
      else section.setAttribute("hidden", "");
    });
  });

  container.querySelectorAll<HTMLTextAreaElement>(".note-textarea").forEach((ta) => {
    ta.addEventListener("input", () => {
      const id = ta.dataset["id"] ?? "";
      const val = ta.value;
      const counter = ta.nextElementSibling as HTMLElement | null;
      if (counter) {
        counter.textContent = `${val.length} / ${MAX_NOTE_LENGTH}`;
        counter.classList.toggle("at-max", val.length >= MAX_NOTE_LENGTH);
      }
      const card = ta.closest(".weapon-card") as HTMLElement | null;
      if (card) card.classList.toggle("has-note", val.length > 0);
      const toggleBtn = card?.querySelector<HTMLButtonElement>(".note-toggle .note-icon");
      if (toggleBtn) toggleBtn.textContent = val.length > 0 ? "✎" : "+";
      debouncedNote(id, val);
    });
  });
}

export function createSimpleChecklist(items: SimpleItem[], storageKey: string) {
  const state: SimplePageState = {
    items,
    checklist: loadState(storageKey),
    filters: {
      search: "",
      category: "all",
      unobtainedOnly: false,
      sortBy: "game-order",
    },
    storageKey,
  };

  const debouncedNote = debounce((id: string, value: string) => {
    const trimmed = value.slice(0, MAX_NOTE_LENGTH);
    state.checklist = patchWeapon(state.checklist, id, { note: trimmed });
    saveState(state.checklist, state.storageKey);
    renderCounter(state);
    renderStats(state);
  }, NOTE_DEBOUNCE_MS);

  function rerender(): void {
    renderCards(state, debouncedNote);
    renderCounter(state);
    renderStats(state);
  }

  return {
    init(): void {
      renderCategoryOptions(state);
      rerender();
    },

    bindFilters(): void {
      const searchInput = document.getElementById("search-input") as HTMLInputElement | null;
      const categorySelect = document.getElementById("filter-category") as HTMLSelectElement | null;
      const sortSelect = document.getElementById("sort-select") as HTMLSelectElement | null;
      const unobtainedToggle = document.getElementById("toggle-unobtained") as HTMLInputElement | null;

      const debouncedSearch = debounce(() => rerender(), SEARCH_DEBOUNCE_MS);

      searchInput?.addEventListener("input", () => {
        state.filters.search = searchInput.value;
        debouncedSearch();
      });

      categorySelect?.addEventListener("change", () => {
        state.filters.category = categorySelect.value;
        rerender();
      });

      sortSelect?.addEventListener("change", () => {
        state.filters.sortBy = sortSelect.value as SimpleSortOption;
        rerender();
      });

      unobtainedToggle?.addEventListener("change", () => {
        state.filters.unobtainedOnly = unobtainedToggle.checked;
        rerender();
      });
    },

    bindResetControls(): void {
      document.getElementById("btn-reset-checklist")?.addEventListener("click", () => {
        if (!window.confirm("Reset all obtained marks? Notes will be kept.")) return;
        const updated: ChecklistState = {};
        for (const item of state.items) {
          const current = state.checklist[item.id] ?? { obtained: false, note: "" };
          updated[item.id] = { ...current, obtained: false };
        }
        state.checklist = updated;
        saveState(state.checklist, state.storageKey);
        rerender();
      });

      document.getElementById("btn-reset-notes")?.addEventListener("click", () => {
        if (!window.confirm("Clear all notes? Obtained marks will be kept.")) return;
        const updated: ChecklistState = {};
        for (const item of state.items) {
          const current = state.checklist[item.id] ?? { obtained: false, note: "" };
          updated[item.id] = { ...current, note: "" };
        }
        state.checklist = updated;
        saveState(state.checklist, state.storageKey);
        rerender();
      });
    },

    bindExportImport(filename: string): void {
      const exportBtn = document.getElementById("btn-export");
      const importBtn = document.getElementById("btn-import");
      const importInput = document.getElementById("import-file") as HTMLInputElement | null;

      exportBtn?.addEventListener("click", () => {
        const json = JSON.stringify(state.checklist, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
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
            state.checklist = JSON.parse(reader.result as string) as ChecklistState;
            saveState(state.checklist, state.storageKey);
            rerender();
          } catch {
            alert("Invalid save file.");
          }
        };
        reader.readAsText(file);
        if (importInput) importInput.value = "";
      });
    },

    bindKeyboardShortcuts(): void {
      document.addEventListener("keydown", (e) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (e.key === "/") {
          e.preventDefault();
          (document.getElementById("search-input") as HTMLInputElement | null)?.focus();
        }
        if (e.key === "s" && !e.ctrlKey && !e.metaKey) {
          document.getElementById("stats-container")?.classList.toggle("collapsed");
        }
      });
    },

    bindStatsToggle(): void {
      const toggle = document.getElementById("stats-toggle");
      const container = document.getElementById("stats-container");
      toggle?.addEventListener("click", () => container?.classList.toggle("collapsed"));
    },
  };
}
