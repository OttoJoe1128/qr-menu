import { Recipe } from "./recipe.types";
import { TemplateDefinition } from "../templates/template.types";
import { getRequiredSectionIds } from "../templates/templateRequirements";
export function validateRecipeAgainstTemplate(
  recipe: Recipe,
  template: TemplateDefinition,
) {
  const requiredSections = getRequiredSectionIds(template);
  for (const section of requiredSections) {
    if (section === "chefNotes" && (recipe.chefNotes || recipe.notes)) {
      continue;
    }
    if (!(section in recipe)) {
      throw new Error(`Recipe missing required section: ${section}`);
    }
  }
}
