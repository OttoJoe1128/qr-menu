import { TemplateRegistry, TemplateKey } from "./index";
import { TemplateDefinition } from "./template.types";
export function resolveTemplate(templateId: TemplateKey): TemplateDefinition {
  const template = TemplateRegistry[templateId];
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }
  return template;
}
