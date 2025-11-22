import React from "react";
import type { AnyData } from "../../types";
import { TextArea, Input } from "../ui/Input";

interface RemarquesBesoinsProps {
  data: AnyData;
  update: (path: string, value: any) => void;
}

export function RemarquesBesoins({ data, update }: RemarquesBesoinsProps) {
  const besoins = data.besoins_prioritaires || ["", ""];

  const setBesoin = (idx: number, val: string) => {
    const next = [...besoins];
    next[idx] = val;
    update("besoins_prioritaires", next);
  };

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4 text-blue-900">
          Besoins prioritaires
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Quels sont, selon vous, les 2 besoins prioritaires de l’élève ?
        </p>
        <div className="space-y-4">
           <Input
             label="Besoin 1"
             value={besoins[0]}
             onChange={(e) => setBesoin(0, e.target.value)}
             placeholder="Premier besoin prioritaire..."
           />
           <Input
             label="Besoin 2"
             value={besoins[1]}
             onChange={(e) => setBesoin(1, e.target.value)}
             placeholder="Second besoin prioritaire..."
           />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 text-blue-900">
          Remarques complémentaires
        </h2>
        <TextArea
          value={data.remarques_besoins}
          onChange={(e) => update("remarques_besoins", e.target.value)}
          rows={8}
          placeholder="Autres observations, contexte particulier, éléments importants non mentionnés ailleurs..."
          className="min-h-[200px]"
        />
      </div>
    </section>
  );
}
