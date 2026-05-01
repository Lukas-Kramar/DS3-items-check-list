import type { Weapon } from "./types.js";
import { appState, setObtained, setNote } from "./state.js";
import { filterWeapons, getUniqueClasses, getUniqueDamageTypes } from "./filters.js";
import { getWeaponState } from "./storage.js";
import { MAX_NOTE_LENGTH, NOTE_DEBOUNCE_MS } from "./constants.js";

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function renderCounter(): void {
  const el = document.getElementById("progress-counter");
  if (!el) return;
  const total = appState.weapons.length;
  const obtained = appState.weapons.filter((w) => getWeaponState(appState.checklist, w.id).obtained).length;
  el.textContent = `${obtained} / ${total} weapons obtained`;

  const pct = total > 0 ? Math.round((obtained / total) * 100) : 0;
  const bar = document.getElementById("progress-bar-fill");
  if (bar) bar.style.width = `${pct}%`;
}

export function renderStatsPanel(): void {
  // BONUS: stats panel — completion by weapon class
  const panel = document.getElementById("stats-panel");
  if (!panel) return;
  const classes = getUniqueClasses(appState.weapons);
  const rows = classes.map((cls) => {
    const inClass = appState.weapons.filter((w) => w.weaponClass === cls);
    const done = inClass.filter((w) => getWeaponState(appState.checklist, w.id).obtained).length;
    const pct = Math.round((done / inClass.length) * 100);
    return `<div class="stat-row">
      <span class="stat-label">${cls}</span>
      <div class="stat-bar-wrap"><div class="stat-bar-fill" style="width:${pct}%"></div></div>
      <span class="stat-count">${done}/${inClass.length}</span>
    </div>`;
  });
  panel.innerHTML = rows.join("");
}

export function renderFilterOptions(): void {
  const classSelect = document.getElementById("filter-class") as HTMLSelectElement | null;
  const dmgSelect = document.getElementById("filter-damage") as HTMLSelectElement | null;
  if (!classSelect || !dmgSelect) return;

  const classes = getUniqueClasses(appState.weapons);
  classSelect.innerHTML = `<option value="all">All Classes</option>` +
    classes.map((c) => `<option value="${c}">${c}</option>`).join("");

  const dmgTypes = getUniqueDamageTypes(appState.weapons);
  dmgSelect.innerHTML = `<option value="all">All Damage Types</option>` +
    dmgTypes.map((d) => `<option value="${d}">${d}</option>`).join("");
}

function buildCard(w: Weapon): HTMLElement {
  const ws = getWeaponState(appState.checklist, w.id);
  const card = document.createElement("article");
  card.className = `weapon-card${ws.obtained ? " obtained" : ""}${ws.note ? " has-note" : ""}`;
  card.dataset["id"] = w.id;

  const dlcTag = w.isDLC
    ? `<span class="badge badge-dlc">${w.dlcName ?? "DLC"}</span>`
    : "";

  const dmgBadges = w.damageTypes
    .map((d) => `<span class="badge badge-dmg">${d}</span>`)
    .join("");

  const charCount = ws.note.length;
  const noteAtMax = charCount >= MAX_NOTE_LENGTH ? " at-max" : "";

  card.innerHTML = `
    <div class="card-header">
      <label class="checkbox-wrap">
        <input type="checkbox" class="weapon-checkbox" data-id="${w.id}" ${ws.obtained ? "checked" : ""}>
        <span class="checkmark"></span>
      </label>
      <div class="card-title-group">
        <h3 class="weapon-name">${escHtml(w.name)}</h3>
        <div class="badge-row">
          <span class="badge badge-class">${escHtml(w.weaponClass)}</span>
          ${dmgBadges}
          ${dlcTag}
        </div>
      </div>
      <button class="note-toggle" data-id="${w.id}" aria-label="Toggle note">
        <span class="note-icon">${ws.note ? "✎" : "+"}</span>
      </button>
    </div>
    <div class="note-section" id="note-${w.id}" hidden>
      <textarea
        class="note-textarea"
        data-id="${w.id}"
        maxlength="${MAX_NOTE_LENGTH}"
        placeholder="Add a note…"
        rows="3"
      >${escHtml(ws.note)}</textarea>
      <span class="char-counter${noteAtMax}">${charCount} / ${MAX_NOTE_LENGTH}</span>
    </div>
  `;
  return card;
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const debouncedSetNote = debounce((id: string, value: string) => {
  setNote(id, value);
  renderCounter();
  renderStatsPanel();
}, NOTE_DEBOUNCE_MS);

export function renderCards(): void {
  const container = document.getElementById("weapon-list");
  if (!container) return;

  const visible = filterWeapons(appState.weapons, appState.filters, appState.checklist);

  if (visible.length === 0) {
    container.innerHTML = `<p class="no-results">No weapons match your filters.</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const w of visible) {
    fragment.appendChild(buildCard(w));
  }
  container.innerHTML = "";
  container.appendChild(fragment);

  container.querySelectorAll<HTMLInputElement>(".weapon-checkbox").forEach((cb) => {
    cb.addEventListener("change", () => {
      const id = cb.dataset["id"] ?? "";
      setObtained(id, cb.checked);
      const card = cb.closest(".weapon-card");
      if (card) {
        card.classList.toggle("obtained", cb.checked);
      }
      renderCounter();
      renderStatsPanel();
    });
  });

  container.querySelectorAll<HTMLElement>(".card-header").forEach((header) => {
    header.addEventListener("click", (e) => {
      const t = e.target as Element;
      if (t.closest(".note-toggle")) return;
      if (t.closest(".checkbox-wrap")) return;
      const cb = header.querySelector<HTMLInputElement>(".weapon-checkbox");
      if (!cb) return;
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });

  container.querySelectorAll<HTMLButtonElement>(".note-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset["id"] ?? "";
      const section = document.getElementById(`note-${id}`);
      if (!section) return;
      const hidden = section.hasAttribute("hidden");
      if (hidden) section.removeAttribute("hidden");
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
      debouncedSetNote(id, val);
    });
  });
}
