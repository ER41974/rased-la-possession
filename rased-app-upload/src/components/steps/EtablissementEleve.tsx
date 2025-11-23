import React from "react";
import { NIVEAUX, NIVEAUX_BY_TYPE, NIVEAUX_CLASSE_SUGGEST, ECOLES_POSSESSION } from "../../types";
import type { AnyData, EcoleType, SessionData } from "../../types";
import { Input, Select } from "../ui/Input";

interface EtablissementEleveProps {
  data: AnyData; // Student data
  update: (path: string, value: any) => void; // Update student
  teacher: SessionData['teacher']; // Session teacher data
  onUpdateTeacher: (field: string, value: string) => void; // Update session teacher
}

export function EtablissementEleve({ data, update, teacher, onUpdateTeacher }: EtablissementEleveProps) {
  const ECOLES_AFFICHAGE = ECOLES_POSSESSION
    .filter((e) => !teacher.type_ecole || e.type === teacher.type_ecole);

  const [typed, setTyped] = React.useState("");

  const useTypedAsSchool = () => {
    if (!typed.trim()) return;
    onUpdateTeacher("ecole", typed.trim());
  };

  return (
    <div className="space-y-8">

      {/* SECTION A: ÉTABLISSEMENT (Session Level) */}
      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">A</div>
          <h2 className="text-lg font-semibold text-gray-900">Établissement</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d’école <span className="text-red-600">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {(["Maternelle", "Élémentaire", "Primaire"] as const).map((type) => {
                const active = teacher.type_ecole === type;
                return (
                  <button
                    key={type}
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      active
                        ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      const newVal = (teacher.type_ecole === type) ? "" : type;
                      onUpdateTeacher("type_ecole", newVal);
                      // Clear school if type changes to avoid mismatch? Maybe optional.
                      // onUpdateTeacher("ecole", "");
                    }}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
             <Select
              label="École"
              required
              value={teacher.ecole}
              onChange={(e) => {
                const nom = e.target.value;
                onUpdateTeacher("ecole", nom);
                // Auto-set type if known school selected
                if (nom && nom !== "__AUTRE__") {
                  const sel = ECOLES_POSSESSION.find(s => s.nom === nom);
                  if (sel?.type) onUpdateTeacher("type_ecole", sel.type);
                }
              }}
            >
              <option value="">— Sélectionner —</option>
              {ECOLES_AFFICHAGE.map((e) => (
                <option key={e.nom + e.type} value={e.nom}>
                  {e.nom} — {e.type}{e.note ? ` (${e.note})` : ""}
                </option>
              ))}
              <option value="__AUTRE__">Autre… (saisie manuelle)</option>
            </Select>

            {/* Manual Entry Logic */}
            {teacher.ecole === "__AUTRE__" && (
               <div className="mt-3 flex gap-2">
                 <Input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="Saisir le nom de l’école..."
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={useTypedAsSchool}
                  className="px-4 py-2 rounded-lg border bg-white text-sm font-medium hover:bg-gray-50 text-gray-700 whitespace-nowrap"
                >
                  Valider
                </button>
              </div>
            )}
             {/* Display manually typed value if stored directly in ecole but not in list */}
             {teacher.ecole && !ECOLES_POSSESSION.find(e => e.nom === teacher.ecole) && teacher.ecole !== "__AUTRE__" && (
                <div className="mt-2 text-sm text-gray-600">
                  École sélectionnée : <b>{teacher.ecole}</b>
                  <button onClick={() => onUpdateTeacher("ecole", "__AUTRE__")} className="ml-2 text-xs text-blue-600 hover:underline">Modifier</button>
                </div>
             )}
          </div>
        </div>
      </section>

      {/* SECTION B: ENSEIGNANT (Session Level) */}
      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">B</div>
          <h2 className="text-lg font-semibold text-gray-900">Enseignant</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Nom / Prénom"
            required
            value={teacher.nom}
            onChange={(e) => onUpdateTeacher("nom", e.target.value)}
            placeholder="Mme / M. ..."
          />
          <Input
            label="Classe"
            required
            value={teacher.classe}
            onChange={(e) => onUpdateTeacher("classe", e.target.value)}
            placeholder="Ex. CE1, GS/CP..."
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Ces informations sont saisies une fois pour toute la session et s'appliquent à toutes les demandes.
        </div>
      </section>

      {/* SECTION C: ÉLÈVE (Student Level) */}
      <section className="bg-blue-50/30 p-6 rounded-xl border border-blue-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-blue-100 pb-4">
          <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">C</div>
          <h2 className="text-lg font-semibold text-blue-900">Élève concerné</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Input
            type="date"
            label="Date de la demande"
            required
            value={data.etablissement.date_demande}
            onChange={(e) => update("etablissement.date_demande", e.target.value)}
          />

          <div className="hidden md:block"></div> {/* Spacer */}

          <Input label="Nom" required value={data.eleve.nom} onChange={(e) => update("eleve.nom", e.target.value)} />
          <Input label="Prénom" required value={data.eleve.prenom} onChange={(e) => update("eleve.prenom", e.target.value)} />

          <Input type="date" label="Date de naissance" required value={data.eleve.date_naissance} onChange={(e) => update("eleve.date_naissance", e.target.value)} />

          <Select label="Sexe" required value={data.eleve.sexe} onChange={(e) => update("eleve.sexe", e.target.value)}>
            <option value="F">F</option>
            <option value="M">M</option>
          </Select>

          <Select label="Niveau" required value={data.eleve.niveau} onChange={(e) => update("eleve.niveau", e.target.value)}>
            <option value="">— Sélectionner —</option>
            {NIVEAUX.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </Select>

          <div>
             <Input
               label="Niveau de la classe (si différent)"
               list="niveau-classe-suggest"
               value={data.eleve.niveau_classe || ""}
               onChange={(e) => update("eleve.niveau_classe", e.target.value)}
               placeholder="Si double niveau ou maintien..."
             />
             <datalist id="niveau-classe-suggest">
               {NIVEAUX_CLASSE_SUGGEST.map((v) => (
                 <option key={v} value={v} />
               ))}
             </datalist>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-blue-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            L’élève a-t-il déjà été maintenu ? <span className="text-red-600">*</span>
          </label>
          <div className="flex gap-3">
            {([true, false] as const).map((v) => {
              const active = data.eleve?.deja_maintenu === v;
              return (
                <button
                  key={String(v)}
                  type="button"
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    update("eleve.deja_maintenu", v);
                    if (!v) update("eleve.niveau_maintien", "");
                  }}
                >
                  {v ? "Oui" : "Non"}
                </button>
              );
            })}
          </div>

          {data.eleve?.deja_maintenu && (
             <div className="mt-4 max-w-xs animate-fade-in">
               <Select
                label="Niveau du maintien précédent"
                required
                value={data.eleve?.niveau_maintien ?? ""}
                onChange={(e) => update("eleve.niveau_maintien", e.target.value || "")}
              >
                <option value="">Sélectionner…</option>
                {(() => {
                  const t = teacher.type_ecole as EcoleType | undefined;
                  const options = t ? NIVEAUX_BY_TYPE[t] : NIVEAUX_BY_TYPE.Primaire;
                  return options.map((niv) => (
                    <option key={niv} value={niv}>{niv}</option>
                  ));
                })()}
              </Select>
             </div>
          )}
        </div>
      </section>
    </div>
  );
}
