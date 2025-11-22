import React from "react";
import { NIVEAUX, NIVEAUX_BY_TYPE, NIVEAUX_CLASSE_SUGGEST, ECOLES_POSSESSION } from "../../types";
import type { AnyData, EcoleType } from "../../types";
import { Input, Select } from "../ui/Input";

interface EtablissementEleveProps {
  data: AnyData;
  update: (path: string, value: any) => void;
}

export function EtablissementEleve({ data, update }: EtablissementEleveProps) {
  const ECOLES_AFFICHAGE = ECOLES_POSSESSION
    .filter((e) => !data.etablissement.type_ecole || e.type === data.etablissement.type_ecole);

  const [typed, setTyped] = React.useState("");

  const useTypedAsSchool = () => {
    if (!typed.trim()) return;
    update("etablissement.ecole", "__AUTRE__");
    update("etablissement.ecole_libre", typed.trim());
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Établissement</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type d’école <span className="text-red-600">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {(["Maternelle", "Élémentaire", "Primaire"] as const).map((type) => {
              const active = data.etablissement?.type_ecole === type;
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
                    if (data.etablissement?.type_ecole === type) {
                      update("etablissement.type_ecole", "");
                    } else {
                      update("etablissement.type_ecole", type);
                    }
                    update("etablissement.ecole", "");
                    update("etablissement.ecole_libre", "");
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
           <Select
            label="École"
            required
            value={data.etablissement.ecole}
            onChange={(e) => {
              const nom = e.target.value;
              update("etablissement.ecole", nom);
              if (nom !== "__AUTRE__") {
                const sel = ECOLES_POSSESSION.find(s => s.nom === nom);
                if (sel?.type) update("etablissement.type_ecole", sel.type);
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

          {data.etablissement?.ecole && data.etablissement.ecole !== "__AUTRE__" && !data.etablissement.type_ecole && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => {
                  const sel = ECOLES_POSSESSION.find(s => s.nom === data.etablissement?.ecole);
                  if (sel?.type) update("etablissement.type_ecole", sel.type);
                }}
                className="text-xs px-3 py-1.5 rounded-full border bg-white text-gray-600 hover:bg-gray-50"
              >
                Renseigner le type d’après l’école sélectionnée
              </button>
            </div>
          )}

          {data.etablissement.ecole === "__AUTRE__" && (
            <div className="mt-3">
              <Input
                value={data.etablissement.ecole_libre || ""}
                onChange={(e) => update("etablissement.ecole_libre", e.target.value)}
                placeholder="Nom de l’école…"
              />
            </div>
          )}

          {data.etablissement.ecole !== "__AUTRE__" && (
            <div className="mt-3 flex gap-2">
               <Input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="Ou saisir manuellement..."
                className="flex-1"
              />
              <button
                type="button"
                onClick={useTypedAsSchool}
                className="px-4 py-2 rounded-lg border bg-white text-sm font-medium hover:bg-gray-50 text-gray-700 whitespace-nowrap"
              >
                Utiliser
              </button>
            </div>
          )}
        </div>

        <div className="mb-6">
          <Input
            label="Date de la demande"
            required
            type="date"
            value={data.etablissement.date_demande}
            onChange={(e) => update("etablissement.date_demande", e.target.value)}
          />
        </div>

        <div className="mb-6">
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
                      ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600"
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
        </div>

        {data.eleve?.deja_maintenu && (
           <div className="mb-6 animate-fade-in">
             <Select
              label="Niveau du maintien précédent"
              required
              value={data.eleve?.niveau_maintien ?? ""}
              onChange={(e) => update("eleve.niveau_maintien", e.target.value || "")}
            >
              <option value="">Sélectionner…</option>
              {(() => {
                const t = data.etablissement?.type_ecole as EcoleType | undefined;
                const options = t ? NIVEAUX_BY_TYPE[t] : NIVEAUX_BY_TYPE.Primaire;
                return options.map((niv) => (
                  <option key={niv} value={niv}>{niv}</option>
                ));
              })()}
            </Select>
           </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-blue-900">Élève</h2>
        <div className="space-y-4">
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
               label="Niveau de la classe (si double niveau)"
               list="niveau-classe-suggest"
               value={data.eleve.niveau_classe || ""}
               onChange={(e) => update("eleve.niveau_classe", e.target.value)}
               placeholder="Ex. CE1-CE2"
             />
             <datalist id="niveau-classe-suggest">
               {NIVEAUX_CLASSE_SUGGEST.map((v) => (
                 <option key={v} value={v} />
               ))}
             </datalist>
          </div>

          <Input label="Enseignant(e)" required value={data.etablissement.enseignant} onChange={(e) => update("etablissement.enseignant", e.target.value)} placeholder="Mme / M. ..." />
        </div>
      </div>
    </div>
  );
}
