import React from "react";
import type { AnyData } from "../../types";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface ConformiteExportProps {
  data: AnyData;
  update: (path: string, value: any) => void;
  onExportJSON: () => void;
  onPrint: () => void;
}

export function ConformiteExport({
  data,
  update,
  onExportJSON,
  onPrint,
}: ConformiteExportProps) {
  const ok =
    data.conformites?.parents_informes && data.conformites?.ppre_joint;

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold mb-4 text-blue-900">
          Conformité
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${data.conformites?.parents_informes ? "border-green-200 bg-green-50" : "border-gray-200 hover:bg-gray-50"}`}>
            <input
              type="checkbox"
              className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
              checked={!!data.conformites?.parents_informes}
              onChange={(e) => update("conformites.parents_informes", e.target.checked)}
            />
            <span className="font-medium text-gray-900">Parents informés</span>
          </label>
          <label className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${data.conformites?.ppre_joint ? "border-green-200 bg-green-50" : "border-gray-200 hover:bg-gray-50"}`}>
            <input
              type="checkbox"
              className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
              checked={!!data.conformites?.ppre_joint}
              onChange={(e) => update("conformites.ppre_joint", e.target.checked)}
            />
            <span className="font-medium text-gray-900">PPRE joint</span>
          </label>
        </div>
        {!ok && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 text-orange-800 text-sm">
             <svg className="h-5 w-5 shrink-0 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
             <span>Merci de cocher les deux cases pour certifier la conformité de la demande avant l'impression.</span>
          </div>
        )}
      </section>

      <section className="bg-gray-50 rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Personnalisation (Impression)
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Logo (URL)"
            value={data.settings?.logoUrl || ""}
            onChange={(e) => update("settings.logoUrl", e.target.value)}
            placeholder="https://... ou data:image..."
            hint="Une URL ou un Data URI pour afficher le logo de l'école."
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Couleur d'accent</label>
            <div className="flex items-center gap-3">
               <input
                type="color"
                className="h-10 w-20 rounded cursor-pointer border border-gray-200"
                value={data.settings?.accentColor || "#000091"}
                onChange={(e) => update("settings.accentColor", e.target.value)}
              />
              <div className="text-sm text-gray-500">Utilisé pour les titres à l'impression.</div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-6">
           <Input
              type="date"
              label="Date d’édition"
              value={data.meta?.date_edition || ""}
              onChange={(e) => update("meta.date_edition", e.target.value)}
            />
        </div>
      </section>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        <Button
          variant="secondary"
          onClick={onExportJSON}
          className="w-full sm:w-auto"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Sauvegarder (JSON)
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={onPrint}
          className="w-full sm:w-auto"
        >
          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Générer le PDF / Imprimer
        </Button>
      </div>
    </div>
  );
}
