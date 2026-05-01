import type { SimpleItem } from "./types.js";
import { createSimpleChecklist } from "./simple-checklist.js";
import { STORAGE_KEY_RINGS } from "./constants.js";
import ringsData from "./data/rings.json";

const page = createSimpleChecklist(ringsData as SimpleItem[], STORAGE_KEY_RINGS);
page.init();
page.bindFilters();
page.bindResetControls();
page.bindExportImport("ds3-rings.json");
page.bindKeyboardShortcuts();
page.bindStatsToggle();
