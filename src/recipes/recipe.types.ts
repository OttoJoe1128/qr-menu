export interface Recipe {
  id: string;
  heroImage: string;
  description: string;
  ingredients: string[];
  steps: string[];
  pairings?: string[];
  chefNotes?: string;
  notes?: string;
}
