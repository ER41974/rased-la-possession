import React from "react";
import { RADIO_FREQ, RADIO_QUALITY, RADIO_EVAL } from "../../types";
import { Input } from "../ui/Input";
import type { AnyData } from "../../types";

interface ComportementProps {
  data: AnyData;
  update: (path: string, value: any) => void;
}

const ITEMS_CLASS = [
  "Autonomie",
  "Intérêt scolaire",
  "Attention / concentration",
  "Confiance en soi",
  "Rythme de travail",
  "Attitude face à la difficulté / à l’erreur",
  "Respect des règles",
];

function RadioScale({ name, value, onChange, options }: { name: string; value: string; onChange: (v: string) => void; options: string[]; }) {
  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {options.map((opt) => {
         let colorClass = "";
         if (value === opt) {
             if (opt === "Très satisfaisant" || opt === "Excellente" || opt === "Toujours") colorClass = "bg-green-50 border-green-200 text-green-700 ring-1 ring-green-200";
             else if (opt === "Satisfaisant" || opt === "Bonne" || opt === "Souvent") colorClass = "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200";
             else if (opt === "Fragile" || opt === "Rarement") colorClass = "bg-orange-50 border-orange-200 text-orange-700 ring-1 ring-orange-200";
             else if (opt === "Problématique" || opt === "Jamais") colorClass = "bg-red-50 border-red-200 text-red-700 ring-1 ring-red-200";
         } else {
             colorClass = "bg-white border-gray-200 text-gray-600 hover:bg-gray-50";
         }
        return (
          <label key={opt} className={`
            flex-1 min-w-[80px] text-center cursor-pointer rounded-lg border px-2 py-2 text-xs md:text-sm transition-all font-medium
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
        );
      })}
    </div>
  );
}

export function Comportement({ data, update }: ComportementProps) {
  // We use a flat structure for simplicity in storage, mapped by item name
  // But we need to make sure we don't lose data if we change the item list.
  // The 'comportement' field in data is currently an array of { item, niveau, note }.
  // We will migrate to a new structure or adapt the existing one.
  // Let's assume 'comportement' is an array. We find the item by name.

  const get = (itemName: string) => {
    return (data.comportement || []).find((x: any) => x.item === itemName) || { item: itemName, evaluation: "", observation: "" };
  };

  const set = (itemName: string, key: string, val: string) => {
    let list = [...(data.comportement || [])];
    const idx = list.findIndex((x: any) => x.item === itemName);
    if (idx >= 0) {
      list[idx] = { ...list[idx], [key]: val };
    } else {
      list.push({ item: itemName, [key]: val });
    }
    update("comportement", list);
  };

  // Special handling for Relations (stored as separate items or special fields?)
  // Let's store them as items but with extra fields if needed, or just separate items in the array.
  // Item: "Relation aux pairs" -> evaluation (frequency), quality (quality), observation
  // Item: "Relation aux adultes" -> evaluation (frequency), quality (quality), observation

  const getRel = (itemName: string) => {
     return (data.comportement || []).find((x: any) => x.item === itemName) || { item: itemName, frequence: "", qualite: "", observation: "" };
  };

  const setRel = (itemName: string, key: string, val: string) => {
    let list = [...(data.comportement || [])];
    const idx = list.findIndex((x: any) => x.item === itemName);
    if (idx >= 0) {
      list[idx] = { ...list[idx], [key]: val };
    } else {
      list.push({ item: itemName, [key]: val });
    }
    update("comportement", list);
  };

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-6 text-blue-900 border-b pb-2">
          Comportement dans la classe
        </h2>

        <div className="space-y-6">
          {ITEMS_CLASS.map((item) => {
            const entry = get(item);
            return (
              <div key={item} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="font-medium text-gray-900 mb-2">{item}</div>
                <RadioScale
                  name={`comp-${item}`}
                  value={entry.evaluation}
                  onChange={(v) => set(item, "evaluation", v)}
                  options={RADIO_EVAL}
                />
                <div className="mt-3">
                  <Input
                    value={entry.observation}
                    onChange={(e) => set(item, "observation", e.target.value)}
                    placeholder="Observations..."
                    className="text-sm bg-gray-50"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-blue-800">
          Relations
        </h3>
        <div className="grid md:grid-cols-1 gap-6">
           {["Relation aux pairs", "Relation aux adultes"].map((item) => {
             const entry = getRel(item);
             return (
               <div key={item} className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                 <div className="font-medium text-blue-900 mb-3">{item}</div>

                 <div className="mb-4">
                   <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fréquence</span>
                   <RadioScale
                      name={`freq-${item}`}
                      value={entry.frequence}
                      onChange={(v) => setRel(item, "frequence", v)}
                      options={RADIO_FREQ}
                   />
                 </div>

                 <div className="mb-4">
                   <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Qualité</span>
                   <RadioScale
                      name={`qual-${item}`}
                      value={entry.qualite}
                      onChange={(v) => setRel(item, "qualite", v)}
                      options={RADIO_QUALITY}
                   />
                 </div>

                 <Input
                    value={entry.observation}
                    onChange={(e) => setRel(item, "observation", e.target.value)}
                    placeholder="Observations..."
                    className="bg-white"
                  />
               </div>
             );
           })}
        </div>
      </div>
    </section>
  );
}
