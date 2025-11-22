import React, { useMemo, useState } from "react";
import { Layout } from "./components/Layout";
import { Card } from "./components/ui/Card";
import { Button } from "./components/ui/Button";
import { Modal } from "./components/ui/Modal";
import { SaveStatusIndicator } from "./components/ui/SaveStatus";
import { useAutoSave } from "./hooks/useAutoSave";
import type { AnyData } from "./types";
import { setByPath, exportJSON, isDateISO, isEmail, isPhoneFRRE } from "./utils";

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

const LS_KEY = "rased-form-v2";
const todayISO = new Date().toISOString().slice(0, 10);
const DEFAULT_DATA: AnyData = {
  meta: { date_edition: todayISO },
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
  conformites: { parents_informes: false, ppre_joint: false },
};

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

function canProceed(stepIndex: number, d: AnyData) {
  switch (stepIndex) {
    case 0: {
      const E = d.etablissement || {};
      const El = d.eleve || {};
      const hasSchool = !!(E.ecole && E.ecole !== "__AUTRE__") || !!E.ecole_libre;
      return (
        hasSchool &&
        !!E.type_ecole &&
        !!E.date_demande &&
        !!E.enseignant &&
        !!El.nom &&
        !!El.prenom &&
        !!El.date_naissance &&
        isDateISO(El.date_naissance) &&
        !!El.sexe &&
        !!El.niveau
      );
    }
    case 1: {
      const F = d.famille || {};
      const okTel = !F.responsable1_tel || isPhoneFRRE(F.responsable1_tel || "");
      const okEmail = !F.responsable1_email || isEmail(F.responsable1_email || "");
      return okTel && okEmail;
    }
    default:
      return true;
  }
}

export default function App() {
  const [data, setData, saveStatus] = useAutoSave<AnyData>(LS_KEY, DEFAULT_DATA);
  const [step, setStep] = useState(0);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const update = (path: string, value: any) => {
    setData((d: AnyData) => {
      const copy = JSON.parse(JSON.stringify(d));
      setByPath(copy, path, value);
      return copy;
    });
  };

  const handleReset = () => {
    setData(DEFAULT_DATA);
    localStorage.removeItem(LS_KEY);
    setStep(0);
    setIsResetModalOpen(false);
  };

  const canNext = useMemo(() => canProceed(step, data), [step, data]);

  return (
    <Layout accentColor={data.settings?.accentColor}>
      <SaveStatusIndicator status={saveStatus} />

      <Modal
        isOpen={isResetModalOpen}
        title="Nouvelle demande / Effacer"
        description="Êtes-vous sûr de vouloir effacer toutes les données et recommencer ? Cette action est irréversible."
        confirmLabel="Tout effacer"
        isDanger
        onConfirm={handleReset}
        onCancel={() => setIsResetModalOpen(false)}
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
                  <div className="flex items-center">
                    <div className={`
                      relative flex h-8 w-8 items-center justify-center rounded-full
                      transition-colors duration-200
                      ${active ? 'bg-blue-600 ring-2 ring-blue-600 ring-offset-2' : ''}
                      ${completed ? 'bg-blue-600' : ''}
                      ${!active && !completed ? 'bg-gray-200' : ''}
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
                  </div>
                  <div className="mt-2">
                    <span className={`text-xs font-medium ${active ? 'text-blue-600' : 'text-gray-500'}`}>{s.title}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Stepper Mobile */}
      <div className="md:hidden mb-6 flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
         <span className="text-sm font-medium text-gray-500">Étape {step + 1} sur {STEPS.length}</span>
         <span className="text-sm font-semibold text-gray-900 truncate ml-2">{STEPS[step].title}</span>
         <div className="w-20 h-1.5 bg-gray-100 rounded-full ml-4 overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}></div>
         </div>
      </div>

      <Card title={STEPS[step].title} className="mb-8 animate-fade-in">
        {step === 0 && <EtablissementEleve data={data} update={update} />}
        {step === 1 && <Famille data={data} update={update} />}
        {step === 2 && <DifficultesSuivis data={data} update={update} />}
        {step === 3 && <PlaceParents data={data} update={update} />}
        {step === 4 && <Comportement data={data} update={update} />}
        {step === 5 && <Apprentissages data={data} update={update} />}
        {step === 6 && <RemarquesBesoins data={data} update={update} />}
        {step === 7 && (
          <ConformiteExport
            data={data}
            update={update}
            onExportJSON={() => exportJSON(data)}
            onPrint={() => doPrint(data, data.settings?.logoUrl || "", data.settings?.accentColor)}
          />
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4">
         <Button
           variant="danger"
           onClick={() => setIsResetModalOpen(true)}
           className="hidden sm:inline-flex"
         >
           Nouvelle demande
         </Button>

         <div className="flex items-center gap-3 ml-auto w-full sm:w-auto justify-between sm:justify-end">
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
                disabled={!canNext}
              >
                Suivant
              </Button>
            ) : null}

            {/* Mobile Reset Button */}
            <Button
               variant="ghost"
               onClick={() => setIsResetModalOpen(true)}
               className="sm:hidden text-red-600 hover:text-red-700 hover:bg-red-50"
             >
               Reset
             </Button>
         </div>
      </div>
    </Layout>
  );
}
