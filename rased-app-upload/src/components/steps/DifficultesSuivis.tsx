import React from "react";
import { SUIVIS_TYPES, ORTHOPHONISTES_OUEST } from "../../types";
import type { AnyData, SuiviType } from "../../types";
import { Input, TextArea, Select } from "../ui/Input";
import { Button } from "../ui/Button";

interface DifficultesSuivisProps {
  data: AnyData;
  update: (path: string, value: any) => void;
}

function RadioScale({ name, value, onChange, options }: { name: string; value: string; onChange: (v: string) => void; options: string[]; }) {
  return (
    <div className="flex gap-3 flex-wrap">
      {options.map((opt) => (
        <label key={opt} className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={(e) => onChange(e.target.value)}
            className="text-blue-600 focus:ring-blue-500 h-4 w-4"
          />
          <span className="text-sm text-gray-700">{opt}</span>
        </label>
      ))}
    </div>
  );
}

export function DifficultesSuivis({ data, update }: DifficultesSuivisProps) {
  const items = data.suivis_exterieurs as Array<any>;

  const add = () => {
    const next = [...items, { dispositif: "" as SuiviType | "", professionnel: "", professionnel_libre: "", frequence: "", contact: "" }];
    update("suivis_exterieurs", next);
  };
  const del = (idx: number) => {
    const next = items.filter((_: any, i: number) => i !== idx);
    update("suivis_exterieurs", next);
  };
  const set = (idx: number, key: string, val: string) => {
    const next = items.map((r: any, i: number) =>
      i === idx ? { ...r, [key]: val } : r
    );
    update("suivis_exterieurs", next);
  };

  const rE = data.reponses_ecole || { apc: { actif: false, details: "" }, differenciation: { actif: false, details: "" }, autres: "" };
  const S = data.sante || {};

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold mb-4 text-blue-900">
          Difficultés observées
        </h2>
        <TextArea
          value={data.difficultes}
          onChange={(e) => update("difficultes", e.target.value)}
          rows={6}
          placeholder="Décrire brièvement les difficultés constatées (comportement, apprentissages, contextes, etc.)"
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-blue-900">
          Réponses mises en place à l’école
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <label className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${rE.apc?.actif ? "border-blue-200 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
            <input
              type="checkbox"
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              checked={!!rE.apc?.actif}
              onChange={(e) => update("reponses_ecole.apc.actif", e.target.checked)}
            />
            <span className="font-medium text-gray-900">APC</span>
          </label>
          <label className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${rE.differenciation?.actif ? "border-blue-200 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
            <input
              type="checkbox"
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              checked={!!rE.differenciation?.actif}
              onChange={(e) => update("reponses_ecole.differenciation.actif", e.target.checked)}
            />
            <span className="font-medium text-gray-900">Différenciation</span>
          </label>
        </div>

        <div className="space-y-4">
          {rE.apc?.actif && (
            <TextArea
              label="Précisions APC (objectif, période, durée)"
              value={rE.apc?.details || ""}
              onChange={(e) => update("reponses_ecole.apc.details", e.target.value)}
              rows={3}
              placeholder="Ex. Remédiation compréhension orale, 6 semaines, 2 × 30 min / semaine"
            />
          )}

          {rE.differenciation?.actif && (
            <TextArea
              label="Précisions Différenciation (aménagements, supports, regroupements)"
              value={rE.differenciation?.details || ""}
              onChange={(e) => update("reponses_ecole.differenciation.details", e.target.value)}
              rows={3}
              placeholder="Ex. Textes adaptés, binômes hétérogènes, consignes segmentées, temps majoré"
            />
          )}

          <TextArea
            label="Autres aménagements / dispositifs (facultatif)"
            value={rE.autres || ""}
            onChange={(e) => update("reponses_ecole.autres", e.target.value)}
            rows={3}
            placeholder="Ex. PAP en cours, aménagements d’évaluation, tutorat, coin calme, etc."
          />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4 text-blue-900">Santé — dépistage</h3>
        <div className="grid md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Problème auditif</label>
            <RadioScale name="sante-aud" value={S.trouble_auditif || ""} onChange={(v) => update("sante.trouble_auditif", v)} options={["Non","À vérifier","Oui"]} />
             {S.trouble_auditif === "Oui" && (
              <Input
                className="mt-2"
                placeholder="Appareillage, bilan ORL du…, résultats dépistage…"
                value={S.trouble_auditif_details || ""}
                onChange={(e) => update("sante.trouble_auditif_details", e.target.value)}
              />
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Problème visuel</label>
            <RadioScale name="sante-vis" value={S.trouble_visuel || ""} onChange={(v) => update("sante.trouble_visuel", v)} options={["Non","À vérifier","Oui"]} />
            {S.trouble_visuel === "Oui" && (
              <Input
                className="mt-2"
                placeholder="Lunettes, RDV OPH du…, dépistage infirmier…"
                value={S.trouble_visuel_details || ""}
                onChange={(e) => update("sante.trouble_visuel_details", e.target.value)}
              />
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-blue-900">
            Suivis extérieurs
          </h2>
          <Button variant="secondary" size="sm" onClick={add}>
            + Ajouter un suivi
          </Button>
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm">
            Aucun suivi déclaré pour le moment.
          </div>
        )}

        <div className="space-y-4">
          {items.map((r: any, i: number) => {
            const isOrtho = r.dispositif === "Orthophonie";
            return (
              <div
                key={i}
                className="relative grid md:grid-cols-1 gap-4 border rounded-xl p-6 bg-white shadow-sm animate-fade-in"
              >
                 <button
                    type="button"
                    onClick={() => del(i)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Supprimer le suivi"
                    title="Supprimer"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                <div className="grid md:grid-cols-2 gap-4 pr-8">
                  <Select
                    label="Type de suivi"
                    value={r.dispositif || ""}
                    onChange={(e) => set(i, "dispositif", e.target.value)}
                  >
                    <option value="">— Sélectionner —</option>
                    {SUIVIS_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Select>
                  <Input label="Fréquence" value={r.frequence} onChange={(e) => set(i, "frequence", e.target.value)} />
                </div>

                {isOrtho ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <Select
                      label="Nom de l’orthophoniste"
                      value={r.professionnel || ""}
                      onChange={(e) => set(i, "professionnel", e.target.value)}
                    >
                      <option value="">— Sélectionner —</option>
                      {ORTHOPHONISTES_OUEST.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                      <option value="__AUTRE__">Autre…</option>
                    </Select>
                    {r.professionnel === "__AUTRE__" && (
                      <Input label="Saisir le nom" value={r.professionnel_libre || ""} onChange={(e) => set(i, "professionnel_libre", e.target.value)} />
                    )}
                  </div>
                ) : (
                  ["Orthoptie","Psychomotricité","Ergothérapie","Psychologue libéral"].includes(r.dispositif) && (
                    <Input label="Nom du professionnel" value={r.professionnel || ""} onChange={(e) => set(i, "professionnel", e.target.value)} />
                  )
                )}

                <Input label="Contact" value={r.contact} onChange={(e) => set(i, "contact", e.target.value)} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
