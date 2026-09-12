import { TemplateDefinition } from "./template.types";
export function getRequiredSectionIds(template: TemplateDefinition): string[] {
  return template.sections
    .filter((section) => section.required)
    .map((section) => section.id);
}
