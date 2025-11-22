import React from "react";
import type { AnyData } from "../../types";
import { isEmail, isPhoneFRRE } from "../../utils";
import { Input } from "../ui/Input";

interface FamilleProps {
  data: AnyData;
  update: (path: string, value: any) => void;
}

export function Famille({ data, update }: FamilleProps) {
  const F = data.famille || {};
  const telOk = !F.responsable1_tel || isPhoneFRRE(F.responsable1_tel);
  const mailOk = !F.responsable1_email || isEmail(F.responsable1_email);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
        <h2 className="text-lg font-semibold mb-4 text-blue-900">
          Responsable légal 1
        </h2>
        <div className="space-y-4">
          <Input
            label="Nom"
            value={F.responsable1_nom}
            onChange={(e) => update("famille.responsable1_nom", e.target.value)}
          />
          <Input
            label="Téléphone"
            value={F.responsable1_tel}
            onChange={(e) => update("famille.responsable1_tel", e.target.value)}
            error={!telOk ? "Format incorrect" : undefined}
          />
          <Input
            label="Email"
            value={F.responsable1_email}
            onChange={(e) => update("famille.responsable1_email", e.target.value)}
            error={!mailOk ? "Email invalide" : undefined}
          />
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Responsable légal 2
          </h2>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Facultatif</span>
        </div>

        <div className="space-y-4">
          <Input
            label="Nom"
            value={F.responsable2_nom}
            onChange={(e) => update("famille.responsable2_nom", e.target.value)}
          />
          <Input
            label="Téléphone"
            value={F.responsable2_tel}
            onChange={(e) => update("famille.responsable2_tel", e.target.value)}
          />
          <Input
            label="Email"
            value={F.responsable2_email}
            onChange={(e) => update("famille.responsable2_email", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
