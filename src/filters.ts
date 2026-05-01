import type { Weapon, FilterState, ChecklistState, SortOption } from "./types.js";
import { getWeaponState } from "./storage.js";

export function filterWeapons(
  weapons: Weapon[],
  filters: FilterState,
  state: ChecklistState
): Weapon[] {
  const search = filters.search.toLowerCase().trim();

  let result = weapons.filter((w) => {
    if (search && !w.name.toLowerCase().includes(search)) return false;
    if (filters.weaponClass !== "all" && w.weaponClass !== filters.weaponClass) return false;
    if (filters.damageType !== "all" && !w.damageTypes.includes(filters.damageType)) return false;
    if (filters.dlcOnly && !w.isDLC) return false;
    if (filters.unobtainedOnly && getWeaponState(state, w.id).obtained) return false;
    return true;
  });

  result = sortWeapons(result, filters.sortBy, state);
  return result;
}

function sortWeapons(weapons: Weapon[], sortBy: SortOption, state: ChecklistState): Weapon[] {
  return [...weapons].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "class":
        return a.weaponClass.localeCompare(b.weaponClass) || a.name.localeCompare(b.name);
      case "obtained-last": {
        const aObt = getWeaponState(state, a.id).obtained ? 1 : 0;
        const bObt = getWeaponState(state, b.id).obtained ? 1 : 0;
        return aObt - bObt || a.name.localeCompare(b.name);
      }
    }
  });
}

export function getUniqueClasses(weapons: Weapon[]): string[] {
  return [...new Set(weapons.map((w) => w.weaponClass))].sort();
}

export function getUniqueDamageTypes(weapons: Weapon[]): string[] {
  return [...new Set(weapons.flatMap((w) => w.damageTypes))].sort();
}
