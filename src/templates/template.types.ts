export interface TemplateSection {
  id: string;
  required: boolean;
}
export interface TemplateDefinition {
  id: string;
  version: number;
  sections: TemplateSection[];
}
