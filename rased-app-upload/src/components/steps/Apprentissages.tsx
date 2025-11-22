import React from "react";
import { RADIO_LEVEL } from "../../types";
import type { AnyData } from "../../types";
import { Input } from "../ui/Input";

interface ApprentissagesProps {
  data: AnyData;
  update: (path: string, value: any) => void;
}

const DOMAINES = ["Lecture", "Écriture", "Mathématiques", "Langage oral", "Motricité"];

function RadioScale({ name, value, onChange, options }: { name: string; value: string; onChange: (v: string) => void; options: string[]; }) {
    return (
    <div className="flex gap-2 flex-wrap mt-2">
      {options.map((opt) => {
        let colorClass = "";
        if (value === opt) {
            if (opt === "Solide") colorClass = "bg-green-50 border-green-200 text-green-700 ring-1 ring-green-200";
            else if (opt === "Satisfaisant") colorClass = "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200";
            else if (opt === "Fragile") colorClass = "bg-orange-50 border-orange-200 text-orange-700 ring-1 ring-orange-200";
            else if (opt === "En difficulté") colorClass = "bg-red-50 border-red-200 text-red-700 ring-1 ring-red-200";
        } else {
            colorClass = "bg-white border-gray-200 text-gray-600 hover:bg-gray-50";
        }

        return (
        <label key={opt} className={`
          flex-1 min-w-[80px] text-center cursor-pointer rounded-lg border px-2 py-2 text-sm transition-all font-medium
          ${colorClass}
        `}>
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <span>{opt}</span>
        </label>
      )})}
    </div>
  );
}

export function Apprentissages({ data, update }: ApprentissagesProps) {
  const items = (data.apprentissages as Array<any>)?.length
    ? data.apprentissages
    : DOMAINES.map((d) => ({ domaine: d, niveau: "", note: "" }));

  const set = (idx: number, key: string, val: string) => {
    const next = items.map((r: any, i: number) => (i === idx ? { ...r, [key]: val } : r));
    update("apprentissages", next);
  };

  const lect = data.apprentissages_detail?.lecture || { fluence_mcl: "", date: "" };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-6 text-blue-900">
        Apprentissages scolaires
      </h2>
      <div className="grid lg:grid-cols-2 gap-6">
        {items.map((r: any, i: number) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="font-medium text-gray-900 mb-1">{r.domaine}</div>
            <RadioScale name={`appr-${i}`} value={r.niveau} onChange={(v) => set(i, "niveau", v)} options={RADIO_LEVEL} />
            <div className="mt-4">
              <Input
                value={r.note || ""}
                onChange={(e) => set(i, "note", e.target.value)}
                placeholder="Complément (facultatif)..."
                className="text-sm bg-gray-50"
              />
            </div>

            {r.domaine === "Lecture" && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Fluence (MCL)"
                  value={lect.fluence_mcl || ""}
                  onChange={(e) => update("apprentissages_detail.lecture.fluence_mcl", e.target.value)}
                  placeholder="Ex. 85"
                  hint="Mots corrects / minute"
                />
                <Input
                  type="date"
                  label="Date de mesure"
                  value={lect.date || ""}
                  onChange={(e) => update("apprentissages_detail.lecture.date", e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
