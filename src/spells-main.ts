import type { SimpleItem } from "./types.js";
import { createSimpleChecklist } from "./simple-checklist.js";
import { STORAGE_KEY_SPELLS } from "./constants.js";
import spellsData from "./data/spells.json";

const page = createSimpleChecklist(spellsData as SimpleItem[], STORAGE_KEY_SPELLS);
page.init();
page.bindFilters();
page.bindResetControls();
page.bindExportImport("ds3-spells.json");
page.bindKeyboardShortcuts();
page.bindStatsToggle();
