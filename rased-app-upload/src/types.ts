export type EcoleType = "Maternelle" | "Élémentaire" | "Primaire";
export type EcoleItem = { nom: string; type: EcoleType; note?: string };

export type SuiviType =
  | "Orthophonie"
  | "Orthoptie"
  | "Psychomotricité"
  | "Ergothérapie"
  | "Psychologue libéral"
  | "CMP"
  | "CMPP"
  | "CAMSP (0-6 ans)"
  | "SESSAD"
  | "Autre";

export type AnyData = Record<string, any>;

export const SUIVIS_TYPES: SuiviType[] = [
  "Orthophonie",
  "Orthoptie",
  "Psychomotricité",
  "Ergothérapie",
  "Psychologue libéral",
  "CMP",
  "CMPP",
  "CAMSP (0-6 ans)",
  "SESSAD",
  "Autre",
];

export const ORTHOPHONISTES_OUEST = [
  // La Possession
  "Florence Wibratte",
  "Amélie Fau",
  "Anaëlle Patin",
  "Florence Grimault",
  // Le Port
  "Véronique Blanc",
  "Charline Gautrand",
  "Héloïse Marsili",
  "Amélie Bouvot",
];

export const ECOLES_POSSESSION: EcoleItem[] = [
  // Élémentaires
  { nom: "Arthur ALMERY", type: "Élémentaire" as EcoleType },
  { nom: "André BÈGUE (Mafate)", type: "Élémentaire" as EcoleType, note: "La Nouvelle" },
  { nom: "Paul ÉLUARD", type: "Élémentaire" as EcoleType, note: "Sainte-Thérèse" },
  { nom: "Évariste DE PARNY", type: "Élémentaire" as EcoleType, note: "Centre-Ville" },
  { nom: "Îlet à AURÈRE (Mafate)", type: "Élémentaire" as EcoleType },
  { nom: "Auguste LACAUSSADE", type: "Élémentaire" as EcoleType, note: "Rivière des Galets" },
  { nom: "Henri LAPIERRE", type: "Élémentaire" as EcoleType, note: "Centre-Ville" },
  { nom: "Léonard THOMAS (Mafate)", type: "Élémentaire" as EcoleType, note: "Grand-Place" },
  { nom: "Îlet à MALHEUR (Mafate)", type: "Élémentaire" as EcoleType },
  { nom: "André MALRAUX", type: "Élémentaire" as EcoleType, note: "Saint-Laurent" },
  { nom: "Simone VEIL", type: "Élémentaire" as EcoleType, note: "Cœur de Ville" },

  // Primaires
  { nom: "Alain LORRAINE", type: "Primaire" as EcoleType, note: "Bœuf-Mort" },
  { nom: "Éloi JULENON", type: "Primaire" as EcoleType },
  { nom: "Jean JAURÈS", type: "Primaire" as EcoleType, note: "Saint-Laurent" },
  { nom: "Joliot CURIE", type: "Primaire" as EcoleType, note: "Ravine à Malheur" },
  { nom: "Jules JORON", type: "Primaire" as EcoleType, note: "Moulin Joli" },
  { nom: "Îlet à BOURSE (Mafate)", type: "Primaire" as EcoleType },

  // Maternelles
  { nom: "Isnelle AMELIN", type: "Maternelle" as EcoleType, note: "Saint-Laurent" },
  { nom: "CÉLIMÈNE", type: "Maternelle" as EcoleType, note: "Saint-Laurent" },
  { nom: "Jacques DUCLOS", type: "Maternelle" as EcoleType, note: "Sainte-Thérèse" },
  { nom: "Auguste LACAUSSADE (Mat.)", type: "Maternelle" as EcoleType, note: "Rivière des Galets" },
  { nom: "Henri LAPIERRE (Mat.)", type: "Maternelle" as EcoleType, note: "Centre-Ville" },
  { nom: "Raymond MONDON", type: "Maternelle" as EcoleType, note: "Camp Magloire" },
  { nom: "Laurent VERGÈS", type: "Maternelle" as EcoleType },
].sort((a, b) => a.nom.localeCompare(b.nom));

export const NIVEAUX = ["TPS","PS","MS","GS","CP","CE1","CE2","CM1","CM2"] as const;
export const NIVEAUX_CLASSE_SUGGEST = [
  "PS-MS","MS-GS","GS-CP","CP-CE1","CE1-CE2","CE2-CM1","CM1-CM2",
];
export const NIVEAUX_BY_TYPE: Record<EcoleType, readonly string[]> = {
  Maternelle: ["TPS","PS","MS","GS"],
  "Élémentaire": ["CP","CE1","CE2","CM1","CM2"],
  Primaire: ["TPS","PS","MS","GS","CP","CE1","CE2","CM1","CM2"],
};

// --- New Scales ---
export const RADIO_FREQ = ["Jamais", "Rarement", "Souvent", "Toujours"];
export const RADIO_QUALITY = ["Excellente", "Bonne", "Fragile", "Problématique"];
export const RADIO_EVAL = ["Très satisfaisant", "Satisfaisant", "Problématique"];

export const CODE_STAGES = [
  "Identification des lettres uniquement",
  "Combinaison de syllabes simples (CV, VC, CVC)",
  "Identification et combinaison des sons complexes"
];
