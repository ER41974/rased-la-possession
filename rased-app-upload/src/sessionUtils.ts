import type { SessionData, StudentData } from "./types";

const todayISO = () => new Date().toISOString().slice(0, 10);

// Default structure for a single student request
export const createEmptyStudent = (id: string = crypto.randomUUID()): StudentData => ({
  id,
  name: "Nouvel élève",
  meta: { date_edition: todayISO() },
  settings: { logoUrl: "", accentColor: "#000091" },
  etablissement: { ecole: "", ecole_libre: "", type_ecole: "", date_demande: "", enseignant: "" },
  eleve: { nom: "", prenom: "", date_naissance: "", sexe: "F", niveau: "", niveau_classe: "", deja_maintenu: undefined, niveau_maintien: "" },
  famille: { responsable1_nom: "", responsable1_tel: "", responsable1_email: "", responsable2_nom: "", responsable2_tel: "", responsable2_email: "" },
  difficultes: "",
  reponses_ecole: { apc: { actif: false, details: "" }, differenciation: { actif: false, details: "" }, autres: "" },
  sante: { trouble_auditif: "", trouble_auditif_details: "", trouble_visuel: "", trouble_visuel_details: "" },
  suivis_exterieurs: [],
  place_parents: "",
  comportement: [],
  apprentissages: [],
  apprentissages_detail: { lecture: { fluence_mcl: "", date: "" } },
  remarques_besoins: "",
  besoins_prioritaires: ["", ""],
  conformites: { parents_informes: false, ppre_joint: false },
});

export const createEmptySession = (): SessionData => {
  const student = createEmptyStudent();
  return {
    teacher: { nom: "", ecole: "", type_ecole: "", classe: "" },
    students: [student],
    currentStudentId: student.id,
    meta: { version: 1, lastSaved: new Date().toISOString() },
  };
};

export function migrateLegacyData(legacyData: any): SessionData {
  // If we detect old data structure (no 'students' array), migrate it to a single-student session
  const session = createEmptySession();
  // We replace the first student with the legacy data content
  // We ensure the legacy data is spread into the student structure
  const migratedStudent: StudentData = {
    ...session.students[0],
    ...legacyData,
    id: session.students[0].id, // Keep the ID we generated
    name: legacyData.eleve?.prenom ? `${legacyData.eleve.prenom} ${legacyData.eleve.nom}` : "Élève importé",
  };

  // Try to extract teacher info if possible, though legacy didn't have a specific teacher block outside of 'etablissement'
  if (legacyData.etablissement?.enseignant) {
    session.teacher.nom = legacyData.etablissement.enseignant;
  }
  if (legacyData.etablissement?.ecole) {
    session.teacher.ecole = legacyData.etablissement.ecole;
  }

  session.students = [migratedStudent];
  return session;
}
