import React from "react";
import type { AnyData } from "../../types";
import { TextArea } from "../ui/Input";

interface RemarquesBesoinsProps {
  data: AnyData;
  update: (path: string, value: any) => void;
}

export function RemarquesBesoins({ data, update }: RemarquesBesoinsProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 text-blue-900">
        Remarques & besoins
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Synthèse des besoins identifiés, objectifs visés par la demande d'aide, et aménagements souhaités.
      </p>
      <TextArea
        value={data.remarques_besoins}
        onChange={(e) => update("remarques_besoins", e.target.value)}
        rows={12}
        placeholder="Besoins identifiés, objectifs visés, aménagements souhaités, etc."
        className="min-h-[300px]"
      />
    </section>
  );
}
