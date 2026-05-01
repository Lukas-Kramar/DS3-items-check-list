export interface Weapon {
  id: string;
  name: string;
  weaponClass: string;
  damageTypes: string[];
  isDLC: boolean;
  dlcName: string | null;
}

export interface WeaponState {
  obtained: boolean;
  note: string;
}

export type ChecklistState = Record<string, WeaponState>;

export interface FilterState {
  search: string;
  weaponClass: string;
  damageType: string;
  dlcOnly: boolean;
  unobtainedOnly: boolean;
  sortBy: SortOption;
}

export type SortOption = "name-asc" | "name-desc" | "class" | "obtained-last";

export interface SimpleItem {
  id: string;
  name: string;
  category: string;
  order: number;
  isDLC?: boolean;
  dlcName?: string;
}

export type SpellItem = SimpleItem;
export type RingItem = SimpleItem;
export type ArmorItem = SimpleItem;

export type SimpleSortOption = "game-order" | "name-asc" | "name-desc" | "obtained-last";

export interface SimpleFilterState {
  search: string;
  category: string;
  unobtainedOnly: boolean;
  sortBy: SimpleSortOption;
  dlcOnly: boolean;
}
