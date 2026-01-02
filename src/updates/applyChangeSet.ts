import { db, ChangeSet, MenuItem, Recipe } from "../db";
import { resolveTemplate } from "../templates/resolveTemplate";
import { validateRecipeAgainstTemplate } from "../recipes/validateRecipe";
export async function applyChangeSet(cs: ChangeSet) {
  if (cs.status !== "approved" && cs.status !== "published") {
    throw new Error(`ChangeSet ${cs.id} is not approved`);
  }
  for (const patch of cs.patches) {
    switch (patch.type) {
      case "ADD_RECIPE": {
        const recipe: Recipe = patch.payload;
        const mevcut: Recipe | undefined = await db.recipes.get(recipe.id);
        if (mevcut) {
          throw new Error(`Recipe already exists (id): ${recipe.id}`);
        }
        await db.recipes.put({
          ...recipe,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        break;
      }
      case "ADD_MENU_ITEM": {
        const item: MenuItem = patch.payload;
        const mevcutId: MenuItem | undefined = await db.menuItems.get(item.id);
        if (mevcutId) {
          throw new Error(`MenuItem already exists (id): ${item.id}`);
        }
        const ayniIsimliAdaylar: MenuItem[] = await db.menuItems
          .where("templateId")
          .equals(item.templateId)
          .toArray();
        const normalizeName: (input: string) => string = (input: string): string =>
          input.trim().toLocaleLowerCase("tr-TR");
        const hedefAd: string = normalizeName(item.nameTR);
        const mevcutIsim: MenuItem | undefined = ayniIsimliAdaylar.find(
          (m) => normalizeName(m.nameTR) === hedefAd,
        );
        if (mevcutIsim) {
          throw new Error(
            `MenuItem already exists (nameTR+templateId): ${item.nameTR} / ${item.templateId}`,
          );
        }
        if (item.recipeId) {
          const recipe = await db.recipes.get(item.recipeId);
          if (!recipe) {
            throw new Error(`Recipe not found: ${item.recipeId}`);
          }
          const template = resolveTemplate(item.templateId);
          validateRecipeAgainstTemplate(recipe, template);
        }
        await db.menuItems.put({
          ...item,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        break;
      }
      default:
        throw new Error(`Unknown patch type: ${patch.type}`);
    }
  }
}
