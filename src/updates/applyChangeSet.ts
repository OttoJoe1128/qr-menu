import { db, ChangeSet, MenuItem } from "../db";
import { resolveTemplate } from "../templates/resolveTemplate";
import { validateRecipeAgainstTemplate } from "../recipes/validateRecipe";
export async function applyChangeSet(cs: ChangeSet) {
  if (cs.status !== "approved" && cs.status !== "published") {
    throw new Error(`ChangeSet ${cs.id} is not approved`);
  }
  for (const patch of cs.patches) {
    switch (patch.type) {
      case "ADD_MENU_ITEM": {
        const item: MenuItem = patch.payload;
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
