import React, { useMemo, useState } from "react";
import { Layout } from "./components/Layout";
import { Sidebar } from "./components/Sidebar";
import { Card } from "./components/ui/Card";
import { Button } from "./components/ui/Button";
import { Modal } from "./components/ui/Modal";
import { SaveStatusIndicator } from "./components/ui/SaveStatus";
import { useAutoSave } from "./hooks/useAutoSave";
import type { AnyData, SessionData, StudentData } from "./types";
import { setByPath, exportJSON, isDateISO, isEmail, isPhoneFRRE } from "./utils";
import { createEmptySession, createEmptyStudent, migrateLegacyData } from "./sessionUtils";

// Import Steps
import { EtablissementEleve } from "./components/steps/EtablissementEleve";
import { Famille } from "./components/steps/Famille";
import { DifficultesSuivis } from "./components/steps/DifficultesSuivis";
import { PlaceParents } from "./components/steps/PlaceParents";
import { Comportement } from "./components/steps/Comportement";
import { Apprentissages } from "./components/steps/Apprentissages";
import { RemarquesBesoins } from "./components/steps/RemarquesBesoins";
import { ConformiteExport } from "./components/steps/ConformiteExport";
import { doPrint } from "./print";

const LS_KEY = "rased-session-v1";

const STEPS = [
  { title: "Établissement & élève" },
  { title: "Famille" },
  { title: "Difficultés & suivis" },
  { title: "Place des parents" },
  { title: "Comportement" },
  { title: "Apprentissages" },
  { title: "Remarques & besoins" },
  { title: "Conformité & export" },
];

export default function App() {
  // Initialize with legacy migration support
  const [session, setSession, saveStatus] = useAutoSave<SessionData>(LS_KEY, createEmptySession());

  // Check for legacy data on mount (one-off check, effectively)
  // Actually useAutoSave initializes state once.
  // If we wanted to migrate, we'd check localStorage for "rased-form-v2" if "rased-session-v1" is missing.
  // But simpler: if the user has no session, we start fresh.
  // We can add an "Import Legacy" button later if needed, but let's stick to the new key.

  const [step, setStep] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  // -- Computed --
  const currentStudent = useMemo(() => {
    return session.students.find(s => s.id === session.currentStudentId) || session.students[0];
  }, [session.students, session.currentStudentId]);

  // -- Handlers --

  const handleUpdateTeacher = (field: string, value: string) => {
    setSession(prev => ({
      ...prev,
      teacher: { ...prev.teacher, [field]: value }
    }));
  };

  const handleAddStudent = () => {
    const newStudent = createEmptyStudent();
    // Pre-fill with session teacher info
    if (session.teacher.nom) newStudent.etablissement.enseignant = session.teacher.nom;
    if (session.teacher.ecole) newStudent.etablissement.ecole = session.teacher.ecole;

    setSession(prev => ({
      ...prev,
      students: [...prev.students, newStudent],
      currentStudentId: newStudent.id
    }));
    setStep(0); // Reset wizard step for new student
  };

  const handleDeleteStudent = () => {
    if (!deleteId) return;
    setSession(prev => {
      const nextStudents = prev.students.filter(s => s.id !== deleteId);
      // If we deleted the current one, switch to the first available or create one
      let nextId = prev.currentStudentId;
      if (deleteId === prev.currentStudentId) {
        nextId = nextStudents.length > 0 ? nextStudents[0].id : "";
      }

      if (nextStudents.length === 0) {
        const fresh = createEmptyStudent();
        return {
          ...prev,
          students: [fresh],
          currentStudentId: fresh.id
        };
      }

      return {
        ...prev,
        students: nextStudents,
        currentStudentId: nextId
      };
    });
    setDeleteId(null);
  };

  const handleSelectStudent = (id: string) => {
    setSession(prev => ({ ...prev, currentStudentId: id }));
    // Optional: Reset step or remember per student?
    // Prompt says "Le wizard interne par élève".
    // Ideally step should be stored in StudentData if we want to persist "where we left off".
    // For now, we keep a global step or reset it. Global step is confusing when switching.
    // Let's keep global step for simplicity, or reset to 0.
    // Let's reset to 0 to avoid confusion (e.g. Step 5 on Student A, switch to Student B who is empty).
    setStep(0);
  };

  // Update the current student's data
  const updateCurrentStudent = (path: string, value: any) => {
    setSession(prev => {
      const nextStudents = prev.students.map(s => {
        if (s.id === prev.currentStudentId) {
          const copy = JSON.parse(JSON.stringify(s));
          setByPath(copy, path, value);
          return copy;
        }
        return s;
      });
      return { ...prev, students: nextStudents };
    });
  };

  // Export Session
  const handleExportSession = () => {
    const filename = `rased-session-${new Date().toISOString().slice(0,10)}.json`;
    exportJSON(session, filename);
  };

  // Import Session
  const handleImportSession = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setShowImportConfirm(true);
    // Reset input
    e.target.value = "";
  };

  const confirmImport = async () => {
    if (!importFile) return;
    try {
      const text = await importFile.text();
      const json = JSON.parse(text);
      // Basic validation: check if it has students array or teacher object
      if (!Array.isArray(json.students)) {
        alert("Format invalide : le fichier ne contient pas de liste d'élèves.");
        return;
      }
      setSession(json);
      setShowImportConfirm(false);
      setImportFile(null);
      setStep(0);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la lecture du fichier.");
    }
  };

  return (
    <Layout
      accentColor={currentStudent.settings?.accentColor}
      sidebar={
        <Sidebar
          session={session}
          onUpdateTeacher={handleUpdateTeacher}
          onSelectStudent={handleSelectStudent}
          onAddStudent={handleAddStudent}
          onDeleteStudent={(id) => setDeleteId(id)}
        />
      }
      headerContent={
        <div className="flex items-center gap-2">
          <label className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Importer</span>
            <input type="file" accept=".json" className="hidden" onChange={handleImportSession} />
          </label>
          <Button variant="secondary" size="sm" onClick={handleExportSession}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter la session
          </Button>
        </div>
      }
    >
      <SaveStatusIndicator status={saveStatus} />

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteId}
        title="Supprimer l'élève ?"
        description="Cette action supprimera définitivement la demande pour cet élève."
        confirmLabel="Supprimer"
        isDanger
        onConfirm={handleDeleteStudent}
        onCancel={() => setDeleteId(null)}
      />

      {/* Import Confirmation */}
      <Modal
        isOpen={showImportConfirm}
        title="Importer une session ?"
        description="Attention : l'importation remplacera toutes les données actuelles (enseignant et élèves). Cette action est irréversible."
        confirmLabel="Remplacer la session actuelle"
        isDanger
        onConfirm={confirmImport}
        onCancel={() => { setShowImportConfirm(false); setImportFile(null); }}
      />

      {/* Stepper Desktop */}
      <div className="hidden md:block mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center w-full">
            {STEPS.map((s, i) => {
              const active = step === i;
              const completed = step > i;
              return (
                <li key={i} className={`relative ${i !== STEPS.length - 1 ? 'w-full pr-4' : ''}`}>
                  <button
                    onClick={() => setStep(i)}
                    className="flex items-center w-full focus:outline-none group"
                  >
                    <div className={`
                      relative flex h-8 w-8 items-center justify-center rounded-full
                      transition-colors duration-200
                      ${active ? 'bg-blue-600 ring-2 ring-blue-600 ring-offset-2' : ''}
                      ${completed ? 'bg-blue-600' : ''}
                      ${!active && !completed ? 'bg-gray-200 group-hover:bg-gray-300' : ''}
                    `}>
                      {completed ? (
                         <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                         </svg>
                      ) : (
                        <span className={`text-xs font-semibold ${active ? 'text-white' : 'text-gray-500'}`}>{i + 1}</span>
                      )}
                    </div>
                    {i !== STEPS.length - 1 && (
                      <div className={`h-0.5 w-full ml-4 ${completed ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    )}
                  </button>
                  <div className="mt-2 text-left">
                    <button
                       onClick={() => setStep(i)}
                       className={`text-xs font-medium focus:outline-none ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}
                    >
                      {s.title}
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Stepper Mobile */}
      <div className="md:hidden mb-6 flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
         <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Étape {step + 1} sur {STEPS.length}</span>
            <span className="text-sm font-semibold text-gray-900 truncate">{STEPS[step].title}</span>
         </div>
         <div className="w-20 h-1.5 bg-gray-100 rounded-full ml-4 overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}></div>
         </div>
      </div>

      <Card title={STEPS[step].title} className="mb-8 animate-fade-in">
        {step === 0 && <EtablissementEleve data={currentStudent} update={updateCurrentStudent} />}
        {step === 1 && <Famille data={currentStudent} update={updateCurrentStudent} />}
        {step === 2 && <DifficultesSuivis data={currentStudent} update={updateCurrentStudent} />}
        {step === 3 && <PlaceParents data={currentStudent} update={updateCurrentStudent} />}
        {step === 4 && <Comportement data={currentStudent} update={updateCurrentStudent} />}
        {step === 5 && <Apprentissages data={currentStudent} update={updateCurrentStudent} />}
        {step === 6 && <RemarquesBesoins data={currentStudent} update={updateCurrentStudent} />}
        {step === 7 && (
          <ConformiteExport
            data={currentStudent}
            update={updateCurrentStudent}
            onExportJSON={() => exportJSON(currentStudent, `rased-${currentStudent.name || "eleve"}.json`)}
            onPrint={() => doPrint(currentStudent, currentStudent.settings?.logoUrl || "", currentStudent.settings?.accentColor)}
          />
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Précédent
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              variant="primary"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            >
              Suivant
            </Button>
          ) : null}
      </div>
    </Layout>
  );
}
