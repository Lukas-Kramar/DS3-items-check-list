import type { SimpleItem } from "./types.js";
import { createSimpleChecklist } from "./simple-checklist.js";
import { STORAGE_KEY_ARMOR } from "./constants.js";
import armorData from "./data/armor.json";

const page = createSimpleChecklist(armorData as SimpleItem[], STORAGE_KEY_ARMOR);
page.init();
page.bindFilters();
page.bindResetControls();
page.bindKeyboardShortcuts();
page.bindStatsToggle();
