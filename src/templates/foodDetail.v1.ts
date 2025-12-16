import { TemplateDefinition } from "./template.types";
export const FoodDetailV1: TemplateDefinition = {
  id: "food_detail_v1",
  version: 1,
  sections: [
    { id: "heroImage", required: true },
    { id: "description", required: true },
    { id: "ingredients", required: true },
    { id: "steps", required: true },
    { id: "pairings", required: false },
    { id: "chefNotes", required: false },
  ],
};
