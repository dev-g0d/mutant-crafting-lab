export interface Element {
  id: string;
  name: string;
  description: string;
}

export type Gender = 'male' | 'female';
export type ExperimentType = 'mutant' | 'hero' | 'god' | 'monster' | 'demon' | 'demi-human';

export interface CraftingResult {
  name: string;
  description: string; // This is now a more detailed origin/lore summary
  image: string; // base64 encoded image
  abilities: string[];
  weaknesses: string[];
  habitat: string;
  dangerLevel: number;
  simulatedHP: number;
  attackPattern: string;
  onHitEffect: string; // Effect of the creature's attack on its target (e.g., the player)
}

export interface GameState {
  // A dictionary of all discovered elements, keyed by their ID.
  elements: Record<string, Element>;
  // An array of element IDs, preserving the order of discovery.
  discoveryOrder: string[];
}