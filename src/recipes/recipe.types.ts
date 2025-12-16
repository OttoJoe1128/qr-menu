export interface Recipe {
  id: string;
  ingredients: string[];
  steps: string[];
  pairings?: string[];
  notes?: string;
}
