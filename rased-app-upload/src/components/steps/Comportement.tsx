import React from "react";
import { RADIO_BEHAV } from "../../types";
import type { AnyData } from "../../types";
import { Input } from "../ui/Input";

interface ComportementProps {
  data: AnyData;
  update: (path: string, value: any) => void;
}

const COMPORTEMENTS = [
  "Respect des règles",
  "Attention en classe",
  "Gestion des émotions",
  "Relation aux pairs",
  "Autonomie",
];

function RadioScale({ name, value, onChange, options }: { name: string; value: string; onChange: (v: string) => void; options: string[]; }) {
  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {options.map((opt) => (
        <label key={opt} className={`
          flex-1 min-w-[80px] text-center cursor-pointer rounded-lg border px-3 py-2 text-sm transition-all
          ${value === opt
            ? "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200 font-medium"
            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}
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
      ))}
    </div>
  );
}

export function Comportement({ data, update }: ComportementProps) {
  const items = (data.comportement as Array<any>)?.length
    ? data.comportement
    : COMPORTEMENTS.map((c) => ({ item: c, niveau: "", note: "" }));

  const set = (idx: number, key: string, val: string) => {
    const next = items.map((r: any, i: number) => (i === idx ? { ...r, [key]: val } : r));
    update("comportement", next);
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-6 text-blue-900">
        Comportement de l'élève
      </h2>
      <div className="grid lg:grid-cols-2 gap-6">
        {items.map((r: any, i: number) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="font-medium text-gray-900 mb-1">{r.item}</div>
            <RadioScale name={`comp-${i}`} value={r.niveau} onChange={(v) => set(i, "niveau", v)} options={RADIO_BEHAV} />
            <div className="mt-4">
              <Input
                value={r.note || ""}
                onChange={(e) => set(i, "note", e.target.value)}
                placeholder="Complément (facultatif)..."
                className="text-sm bg-gray-50"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
