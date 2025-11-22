import React from "react";
import { RADIO_EVAL, CODE_STAGES } from "../../types";
import { Input, TextArea } from "../ui/Input";
import type { AnyData } from "../../types";

interface ApprentissagesProps {
  data: AnyData;
  update: (path: string, value: any) => void;
}

const SECTION_LECTURE = ["Connaissance des lettres", "Connaissance du code", "Écriture", "Compréhension écrite"];
const SECTION_ORAL = ["Ose prendre la parole, demander de l’aide…", "Qualité du langage (syntaxe, vocabulaire…)", "Cohérence des propos", "Compréhension orale"];
const SECTION_MATH = ["Structuration spatio-temporelle", "Numération", "Techniques opératoires"];
const SECTION_TRANS = ["Compréhension des consignes", "Mémorisation"];

function RadioScale({ name, value, onChange, options }: { name: string; value: string; onChange: (v: string) => void; options: string[]; }) {
    return (
    <div className="flex gap-2 flex-wrap mt-2">
      {options.map((opt) => {
        let colorClass = "";
        if (value === opt) {
            if (opt === "Très satisfaisant") colorClass = "bg-green-50 border-green-200 text-green-700 ring-1 ring-green-200";
            else if (opt === "Satisfaisant") colorClass = "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200";
            else if (opt === "Problématique") colorClass = "bg-red-50 border-red-200 text-red-700 ring-1 ring-red-200";
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
      )})}
    </div>
  );
}

export function Apprentissages({ data, update }: ApprentissagesProps) {
  // Helper to access/update item in flat list (or grouped)
  // We use the same 'apprentissages' array but maybe we should segment by type if we want to be clean.
  // For now, let's keep a flat list with item names as keys.

  const get = (itemName: string) => {
    return (data.apprentissages || []).find((x: any) => x.item === itemName) || { item: itemName, evaluation: "", observation: "" };
  };

  const set = (itemName: string, key: string, val: string) => {
    let list = [...(data.apprentissages || [])];
    const idx = list.findIndex((x: any) => x.item === itemName);
    if (idx >= 0) {
      list[idx] = { ...list[idx], [key]: val };
    } else {
      list.push({ item: itemName, [key]: val });
    }
    update("apprentissages", list);
  };

  // Specific helpers for deep nested fields (code mastery, fluence)
  const codeDetails = data.apprentissages_detail?.code || { stade: "", observation: "" };
  const lectDetails = data.apprentissages_detail?.lecture || { fluence_mcl: "", date: "" };

  const updateCode = (key: string, val: any) => update(`apprentissages_detail.code.${key}`, val);
  const updateFluence = (key: string, val: any) => update(`apprentissages_detail.lecture.${key}`, val);

  const renderSection = (title: string, items: string[], isLecture = false) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-blue-900 border-b pb-2">{title}</h3>
      <div className="space-y-6">
        {items.map((item) => {
           const entry = get(item);
           return (
             <div key={item} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
               <div className="font-medium text-gray-900 mb-2">{item}</div>
               <RadioScale
                  name={`appr-${item}`}
                  value={entry.evaluation}
                  onChange={(v) => set(item, "evaluation", v)}
                  options={RADIO_EVAL}
                />

               {/* Specific Code Section */}
               {isLecture && item === "Connaissance du code" && (
                 <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                   <div className="text-sm font-semibold text-gray-700 mb-2">Stade de maîtrise du code</div>
                   <div className="space-y-2 mb-3">
                     {CODE_STAGES.map((stage) => (
                       <label key={stage} className="flex items-center gap-2 cursor-pointer">
                         <input
                           type="radio"
                           name="code-stage"
                           value={stage}
                           checked={codeDetails.stade === stage}
                           onChange={(e) => updateCode("stade", e.target.value)}
                           className="text-blue-600 focus:ring-blue-500"
                         />
                         <span className="text-sm text-gray-700">{stage}</span>
                       </label>
                     ))}
                   </div>
                   <Input
                      value={codeDetails.observation}
                      onChange={(e) => updateCode("observation", e.target.value)}
                      placeholder="Observations / précisions sur le code..."
                      className="bg-white"
                   />
                 </div>
               )}

               <div className="mt-3">
                  <Input
                    value={entry.observation}
                    onChange={(e) => set(item, "observation", e.target.value)}
                    placeholder={`Observations sur ${item.toLowerCase()}...`}
                    className="text-sm bg-gray-50"
                  />
               </div>
             </div>
           );
        })}

        {/* Fluence (Only in Lecture) */}
        {isLecture && (
           <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
              <h4 className="font-medium text-blue-900 mb-3">Fluence de lecture</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="MCL (Mots Corrects / Minute)"
                  value={lectDetails.fluence_mcl}
                  onChange={(e) => updateFluence("fluence_mcl", e.target.value)}
                  placeholder="Ex. 85"
                />
                <Input
                  type="date"
                  label="Date de mesure"
                  value={lectDetails.date}
                  onChange={(e) => updateFluence("date", e.target.value)}
                />
              </div>
           </div>
        )}
      </div>
    </div>
  );

  return (
    <section>
       <h2 className="text-xl font-semibold mb-6 text-gray-800">Apprentissages scolaires</h2>

       {renderSection("Acquisition de la lecture", SECTION_LECTURE, true)}
       {renderSection("Langage oral", SECTION_ORAL)}
       {renderSection("Mathématiques", SECTION_MATH)}
       {renderSection("Compétences méthodologiques et transversales", SECTION_TRANS)}
    </section>
  );
}
