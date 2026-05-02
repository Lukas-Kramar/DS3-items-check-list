import { STORAGE_KEY_SPELLS } from "./constants.js";
import spellsData from "./data/spells.json";
import { createSimpleChecklist } from "./simple-checklist.js";
import type { SimpleItem } from "./types.js";

const page = createSimpleChecklist(spellsData as SimpleItem[], STORAGE_KEY_SPELLS);
page.init();
page.bindFilters();
page.bindResetControls();
page.bindKeyboardShortcuts();
page.bindStatsToggle();
