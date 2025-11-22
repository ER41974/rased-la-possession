import React from "react";
import type { AnyData } from "../../types";
import { TextArea } from "../ui/Input";

interface PlaceParentsProps {
  data: AnyData;
  update: (path: string, value: any) => void;
}

export function PlaceParents({ data, update }: PlaceParentsProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 text-blue-900">
        Place des parents
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Décrivez les échanges avec la famille, leur adhésion aux mesures proposées, et leurs attentes.
      </p>
      <TextArea
        value={data.place_parents}
        onChange={(e) => update("place_parents", e.target.value)}
        rows={12}
        placeholder="Échanges avec les responsables, adhésion aux mesures proposées, attentes exprimées, etc."
        className="min-h-[300px]"
      />
    </section>
  );
}
