import { useEffect, useMemo, useState } from "react";

/** =========================================================
 *  Thème DSFR-like (Option A)
 *  ========================================================= */
const PRIMARY = "#000091"; // bleu république
const DSFR_BORDER = "#E5E7EB"; // gray-200
const DSFR_ACCENT = PRIMARY;
const DSFR_SURFACE = "#F6F6F6"; // surface background color (DSFR-like)

/** =========================================================
 *  Utilitaires
 *  ========================================================= */
const LS_KEY = "rased-form-v2";

const norm = (s: any) => (s ?? "").toString().trim();
const isDateISO = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(norm(s)) && !Number.isNaN(new Date(s).getTime());
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm(s));
// France (métropole) + Réunion (0262/0692 et +262 262 / +262 692)
const isPhoneFRRE = (s: string) => {
  const x = norm(s).replace(/[ .-]/g, "");
  const fr = /^(?:\+33|0)[1-9]\d{8}$/.test(x);
  const re = /^(?:0(?:262|692)\d{6}|\+262(?:262|692)\d{6})$/.test(x);
  return fr || re;
};
const esc = (s: any) =>
  (s ?? "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

function setByPath(obj: any, path: string, value: any) {
  const parts = path.split(".");
  const last = parts.pop()!;
  let cur = obj;
  for (const p of parts) {
    if (!(p in cur) || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[last] = value;
}

// Hook localStorage compact (charge + sauvegarde auto)
function useLocalStorageState<T>(key: string, initial: T) {
  const [val, setVal] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? { ...(initial as any), ...JSON.parse(raw) } : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal] as const;
}

/** =========================================================
 *  Types & données de référence
 *  ========================================================= */
type EcoleType = "Maternelle" | "Élémentaire" | "Primaire";
type EcoleItem = { nom: string; type: EcoleType; note?: string };

type SuiviType =
  | "Orthophonie"
  | "Orthoptie"
  | "Psychomotricité"
  | "Ergothérapie"
  | "Psychologue libéral"
  | "CMP"
  | "CMPP"
  | "CAMSP (0-6 ans)"
  | "SESSAD"
  | "Autre";

const SUIVIS_TYPES: SuiviType[] = [
  "Orthophonie",
  "Orthoptie",
  "Psychomotricité",
  "Ergothérapie",
  "Psychologue libéral",
  "CMP",
  "CMPP",
  "CAMSP (0-6 ans)",
  "SESSAD",
  "Autre",
];

// Base initiale : orthophonistes La Possession & Le Port (liste extensible)
const ORTHOPHONISTES_OUEST = [
  // La Possession
  "Florence Wibratte",
  "Amélie Fau",
  "Anaëlle Patin",
  "Florence Grimault",
  // Le Port
  "Véronique Blanc",
  "Charline Gautrand",
  "Héloïse Marsili",
  "Amélie Bouvot",
];

const ECOLES_POSSESSION: EcoleItem[] = [
  // Élémentaires
  { nom: "Arthur ALMERY", type: "Élémentaire" as EcoleType },
  { nom: "André BÈGUE (Mafate)", type: "Élémentaire" as EcoleType, note: "La Nouvelle" },
  { nom: "Paul ÉLUARD", type: "Élémentaire" as EcoleType, note: "Sainte-Thérèse" },
  { nom: "Évariste DE PARNY", type: "Élémentaire" as EcoleType, note: "Centre-Ville" },
  { nom: "Îlet à AURÈRE (Mafate)", type: "Élémentaire" as EcoleType },
  { nom: "Auguste LACAUSSADE", type: "Élémentaire" as EcoleType, note: "Rivière des Galets" },
  { nom: "Henri LAPIERRE", type: "Élémentaire" as EcoleType, note: "Centre-Ville" },
  { nom: "Léonard THOMAS (Mafate)", type: "Élémentaire" as EcoleType, note: "Grand-Place" },
  { nom: "Îlet à MALHEUR (Mafate)", type: "Élémentaire" as EcoleType },
  { nom: "André MALRAUX", type: "Élémentaire" as EcoleType, note: "Saint-Laurent" },
  { nom: "Simone VEIL", type: "Élémentaire" as EcoleType, note: "Cœur de Ville" },

  // Primaires
  { nom: "Alain LORRAINE", type: "Primaire" as EcoleType, note: "Bœuf-Mort" },
  { nom: "Éloi JULENON", type: "Primaire" as EcoleType },
  { nom: "Jean JAURÈS", type: "Primaire" as EcoleType, note: "Saint-Laurent" },
  { nom: "Joliot CURIE", type: "Primaire" as EcoleType, note: "Ravine à Malheur" },
  { nom: "Jules JORON", type: "Primaire" as EcoleType, note: "Moulin Joli" },
  { nom: "Îlet à BOURSE (Mafate)", type: "Primaire" as EcoleType },

  // Maternelles
  { nom: "Isnelle AMELIN", type: "Maternelle" as EcoleType, note: "Saint-Laurent" },
  { nom: "CÉLIMÈNE", type: "Maternelle" as EcoleType, note: "Saint-Laurent" },
  { nom: "Jacques DUCLOS", type: "Maternelle" as EcoleType, note: "Sainte-Thérèse" },
  { nom: "Auguste LACAUSSADE (Mat.)", type: "Maternelle" as EcoleType, note: "Rivière des Galets" },
  { nom: "Henri LAPIERRE (Mat.)", type: "Maternelle" as EcoleType, note: "Centre-Ville" },
  { nom: "Raymond MONDON", type: "Maternelle" as EcoleType, note: "Camp Magloire" },
  { nom: "Laurent VERGÈS", type: "Maternelle" as EcoleType },
].sort((a, b) => a.nom.localeCompare(b.nom));

const NIVEAUX = ["TPS","PS","MS","GS","CP","CE1","CE2","CM1","CM2"] as const;
const NIVEAUX_CLASSE_SUGGEST = [
  "PS-MS","MS-GS","GS-CP","CP-CE1","CE1-CE2","CE2-CM1","CM1-CM2",
];
const NIVEAUX_BY_TYPE: Record<EcoleType, readonly string[]> = {
  Maternelle: ["TPS","PS","MS","GS"],
  "Élémentaire": ["CP","CE1","CE2","CM1","CM2"],
  Primaire: ["TPS","PS","MS","GS","CP","CE1","CE2","CM1","CM2"],
};

/** =========================================================
 *  Impression — gabarit A4
 *  ========================================================= */
const PRINT_CSS = `
@page { size: A4 portrait; margin: 12mm; }
@media print {
  html, body { height: auto; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print { display: none !important; }
  .section { break-inside: avoid; margin-bottom: 12px; }
  .pb { break-before: page; }
  h1, h2, h3 { break-after: avoid; }
}
:root { --accent: ${DSFR_ACCENT}; }
body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, "Apple Color Emoji","Segoe UI Emoji"; }
.header {
  display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px;
  border-bottom: 2px solid var(--accent); padding-bottom: 8px;
}
.logo { width: 64px; height: 64px; object-fit: contain; }
.hint { font-size: 12px; opacity: .75; }
.table { width:100%; border-collapse: collapse; margin-top: 6px; }
.table th, .table td { border:1px solid #ddd; padding:6px; font-size:12px; vertical-align: top; }
.section-title { color: var(--accent); margin: 8px 0; }
.badge { display:inline-block; padding:2px 6px; border-radius:6px; font-size:12px; border:1px solid var(--accent); }
.grid { display:grid; gap:8px; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.small { font-size: 12px; }
`;

async function toDataURL(url: string): Promise<string> {
  if (!url) return "";
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

type AnyData = Record<string, any>;
type PrintOptions = { title?: string; logoDataUrl?: string; accent?: string };

function buildPrintableHTML(d: AnyData, opts: PrintOptions) {
  const { title = "Éducation nationale – RASED", logoDataUrl = "", accent = DSFR_ACCENT } = opts;

  const schoolName =
    d.etablissement?.ecole && d.etablissement?.ecole !== "__AUTRE__"
      ? d.etablissement?.ecole
      : d.etablissement?.ecole_libre || "";

  const suivis = Array.isArray(d.suivis_exterieurs) ? d.suivis_exterieurs : [];
  const compRaw = Array.isArray(d.comportement) ? d.comportement : [];
  const apprRaw = Array.isArray(d.apprentissages) ? d.apprentissages : [];

  // Notes intégrées à l'affichage
  const comp = compRaw.map((c: any) => ({
    item: c?.item,
    niveau: [c?.niveau, c?.note ? `(${c.note})` : ""].filter(Boolean).join(" "),
  }));
  const appr = apprRaw.map((a: any) => ({
    domaine: a?.domaine,
    niveau: [a?.niveau, a?.note ? `(${a.note})` : ""].filter(Boolean).join(" "),
  }));

  // Réponses de l'école
  const rE = d.reponses_ecole || {};
  const apc = rE.apc || {};
  const diff = rE.differenciation || {};
  const autres = rE.autres || "";

  // Santé
  const S = d.sante || {};
  const showSante = [S.trouble_auditif, S.trouble_visuel, S.trouble_auditif_details, S.trouble_visuel_details]
    .some((v) => !!v && v !== "Non");

  // Détails suivis : concat fréquence + professionnel
  const suivisForPrint = suivis.map((r: any) => ({
    dispositif: r?.dispositif || "",
    details: [r?.frequence, r?.professionnel === "__AUTRE__" ? r?.professionnel_libre : r?.professionnel].filter(Boolean).join(" – "),
    contact: r?.contact || "",
  }));

  const rows = (arr: any[], cols: string[]) =>
    arr.map((r) => `<tr>${cols.map((c) => `<td>${esc(r?.[c] ?? "")}</td>`).join("")}</tr>`).join("");

  const flu = d.apprentissages_detail?.lecture?.fluence_mcl;
  const fluDate = d.apprentissages_detail?.lecture?.date;

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(title)}</title>
<style>${PRINT_CSS.replace(":root { --accent: " + DSFR_ACCENT + "; }", `:root { --accent: ${accent}; }`)}</style>
</head>
<body>
<header class="header">
  <div style="display:flex;align-items:center;gap:12px;">
    ${logoDataUrl ? `<img class="logo" src="${logoDataUrl}" alt="Logo Éducation nationale" />` : ""}
    <div>
      <h1 style="margin:0;">${esc(title)}</h1>
      <div class="hint">${esc(schoolName || "")}</div>
    </div>
  </div>
  <div class="badge">Édité le ${esc(d.meta?.date_edition || "")}</div>
</header>

<section class="section">
  <h2 class="section-title">Établissement & élève</h2>
  <div class="grid grid-2">
    <div><b>École</b><br/>${esc(schoolName || "—")}</div>
    <div><b>Type d’école</b><br/>${esc(d.etablissement?.type_ecole || "—")}</div>
    <div><b>Date de la demande</b><br/>${esc(d.etablissement?.date_demande || "—")}</div>
    <div><b>Enseignant</b><br/>${esc(d.etablissement?.enseignant || "—")}</div>
  </div>
  <div class="grid grid-2" style="margin-top:8px;">
    <div><b>Nom élève</b><br/>${esc(d.eleve?.nom || "—")}</div>
    <div><b>Prénom élève</b><br/>${esc(d.eleve?.prenom || "—")}</div>
    <div><b>Date de naissance</b><br/>${esc(d.eleve?.date_naissance || "—")}</div>
    <div><b>Sexe</b><br/>${esc(d.eleve?.sexe || "—")}</div>
    <div><b>Niveau</b><br/>${esc(d.eleve?.niveau || "—")}</div>
    <div><b>Niveau de la classe</b><br/>${esc(d.eleve?.niveau_classe || "—")}</div>
  </div>
</section>

<section class="section">
  <h2 class="section-title">Réponses mises en place à l’école</h2>
  ${apc.actif || diff.actif || autres
    ? `<ul class="small" style="margin:4px 0 0 18px;">
         ${apc.actif ? `<li><b>APC</b>${apc.details ? ` — ${esc(apc.details)}` : ""}</li>` : ""}
         ${diff.actif ? `<li><b>Différenciation</b>${diff.details ? ` — ${esc(diff.details)}` : ""}</li>` : ""}
         ${autres ? `<li><b>Autres</b> — ${esc(autres)}</li>` : ""}
       </ul>`
    : `<div class="hint">Aucune réponse renseignée.</div>`}
</section>

${showSante ? `
<section class="section">
  <h2 class="section-title">Santé — dépistage</h2>
  <div class="grid grid-2">
    <div><b>Auditif</b><br/>${esc(S.trouble_auditif || "—")}${S.trouble_auditif_details ? ` — ${esc(S.trouble_auditif_details)}` : ""}</div>
    <div><b>Visuel</b><br/>${esc(S.trouble_visuel || "—")}${S.trouble_visuel_details ? ` — ${esc(S.trouble_visuel_details)}` : ""}</div>
  </div>
</section>` : ""}

<section class="section">
  <h2 class="section-title">Suivis extérieurs</h2>
  ${suivisForPrint.length
    ? `<table class="table"><thead><tr><th>Dispositif</th><th>Détails</th><th>Contact</th></tr></thead><tbody>${rows(
        suivisForPrint, ["dispositif","details","contact"]
      )}</tbody></table>`
    : `<div class="hint">Aucun suivi déclaré.</div>`}
</section>

<section class="section">
  <h2 class="section-title">Comportement</h2>
  ${comp.length
    ? `<table class="table"><thead><tr><th>Critère</th><th>Niveau</th></tr></thead><tbody>${rows(comp,["item","niveau"])}</tbody></table>`
    : `<div class="hint">Non renseigné.</div>`}
</section>

<section class="section">
  <h2 class="section-title">Apprentissages</h2>
  ${appr.length
    ? `<table class="table"><thead><tr><th>Domaine</th><th>Niveau</th></tr></thead><tbody>${rows(appr,["domaine","niveau"])}</tbody></table>`
    : `<div class="hint">Non renseigné.</div>`}
  ${flu ? `<div class="small" style="margin-top:6px;"><b>Fluence lecture</b> : ${esc(String(flu))} mcl/min${fluDate ? ` (mesure du ${esc(new Date(fluDate).toLocaleDateString("fr-FR"))})` : ""}</div>` : ""}
</section>

<section class="section pb">
  <h2 class="section-title">Remarques & besoins</h2>
  <div>${esc(d.remarques_besoins || "")}</div>
</section>

<section class="section">
  <h2 class="section-title">Conformité</h2>
  <div class="grid grid-2">
    <div><b>Parents informés</b><br/>${d.conformites?.parents_informes ? "Oui" : "Non"}</div>
    <div><b>PPRE joint</b><br/>${d.conformites?.ppre_joint ? "Oui" : "Non"}</div>
  </div>
</section>

<footer class="hint">
  Généré localement — ${new Date().toLocaleDateString("fr-FR")}
</footer>
</body>
</html>`;
}

async function doPrint(data: AnyData, logoUrl: string, accent = DSFR_ACCENT) {
  const logoDataUrl = await toDataURL(logoUrl);
  const html = buildPrintableHTML(data, { logoDataUrl, accent });

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = url;

  document.body.appendChild(iframe);
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(iframe);
      }, 150);
    }
  };
}

/** =========================================================
 *  Export JSON (robuste + fallback)
 *  ========================================================= */
function asJSONBlob(obj: unknown) {
  const json = JSON.stringify(obj, null, 2);
  return { json, blob: new Blob([json], { type: "application/json" }) };
}

async function exportJSON(
  data: AnyData,
  filename = "rased-formulaire.json",
  setJsonFallback?: (s: string) => void
) {
  const { json, blob } = asJSONBlob(data);
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    try {
      await navigator.clipboard.writeText(json);
      alert("Le JSON a été copié dans le presse-papiers (fallback).");
    } catch {
      setJsonFallback?.(json);
    }
  }
}

/** =========================================================
 *  Petits composants UI (Tailwind)
 *  ========================================================= */
function Field({
  label,
  children,
  required,
  hint,
}: {
  label: string;
  children: any;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block mb-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium">{label}</span>
        {required && <span className="text-red-600">*</span>}
      </div>
      {children}
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  className = "",
}: {
  value: any;
  onChange: (v: any) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={
        "w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 " +
        "focus:ring-[color:var(--accent)] " +
        className
      }
      style={{ borderColor: DSFR_BORDER }}
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: any;
  onChange: (v: any) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
      style={{ borderColor: DSFR_BORDER }}
    />
  );
}

function Card({ children }: { children: any }) {
  return (
    <div
      className="rounded-2xl border shadow-sm"
      style={{ background: DSFR_SURFACE, borderColor: DSFR_BORDER }}
    >
      <div className="p-6 md:p-8">
        <div className="form-container">{children}</div>
      </div>
    </div>
  );
}


function Stepper({
  steps,
  step,
  setStep,
}: {
  steps: { title: string }[];
  step: number;
  setStep: (i: number) => void;
}) {
  return (
    <div className="stepper">
      <div className="max-w-4xl mx-auto px-4">
        <ol className="flex flex-wrap justify-center gap-2 py-2">
          {steps.map((s, i) => {
            const active = step === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={[
                    "px-3 py-2 rounded-full border text-sm transition",
                    active ? "text-white" : "bg-white hover:bg-gray-50",
                  ].join(" ")}
                  style={{
                    background: active ? DSFR_ACCENT : undefined,
                    borderColor: active ? DSFR_ACCENT : DSFR_BORDER,
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="w-6 h-6 grid place-items-center rounded-full text-xs"
                      style={{
                        background: active ? "white" : "#F3F4F6",
                        color: active ? DSFR_ACCENT : "#374151",
                        border: active ? "1px solid white" : "1px solid " + DSFR_BORDER,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="font-medium">{s.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="h-1 mb-2 rounded bg-gray-200">
          <div
            className="h-1 rounded transition-all"
            style={{
              width: `${((step + 1) / steps.length) * 100}%`,
              background: DSFR_ACCENT,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// (Remove this duplicate progress bar block entirely, as the correct progress bar is already implemented above in the Stepper component.)

// Échelles réutilisables
function RadioScale({ name, value, onChange, options }: { name: string; value: string; onChange: (v: string) => void; options: string[]; }) {
  return (
    <div className="flex gap-3 flex-wrap">
      {options.map((opt) => (
        <label key={opt} className="inline-flex items-center gap-2">
          <input type="radio" name={name} value={opt} checked={value === opt} onChange={(e) => onChange(e.target.value)} />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}

const RADIO_BEHAV = ["Jamais", "Rarement", "Souvent", "Toujours"];
const RADIO_LEVEL = ["Solide", "Satisfaisant", "Fragile", "En difficulté"];

/** =========================================================
 *  Données par défaut (avec date d’édition pré-remplie)
 *  ========================================================= */
const todayISO = new Date().toISOString().slice(0, 10);

const DEFAULT_DATA: AnyData = {
  meta: {
    date_edition: todayISO,
  },
  settings: {
    logoUrl: "",
    accentColor: DSFR_ACCENT,
  },
  etablissement: {
    ecole: "",
    ecole_libre: "",
    type_ecole: "",
    date_demande: "",
    enseignant: "",
  },
  eleve: {
  nom: "",
  prenom: "",
  date_naissance: "",
  sexe: "F",
  niveau: "",
  niveau_classe: "",
  deja_maintenu: undefined as undefined | boolean,
  niveau_maintien: "",
},


  famille: {
    responsable1_nom: "",
    responsable1_tel: "",
    responsable1_email: "",
    responsable2_nom: "",
    responsable2_tel: "",
    responsable2_email: "",
  },
  difficultes: "",
  reponses_ecole: {
    apc: { actif: false, details: "" },
    differenciation: { actif: false, details: "" },
    autres: "",
  },
  sante: {
    trouble_auditif: "",
    trouble_auditif_details: "",
    trouble_visuel: "",
    trouble_visuel_details: "",
  },
  suivis_exterieurs: [] as Array<{
    dispositif: SuiviType | "";
    professionnel?: string;
    professionnel_libre?: string;
    frequence: string;
    contact: string;
  }>,
  place_parents: "",
  comportement: [] as Array<{ item: string; niveau: string; note?: string }>,
  apprentissages: [] as Array<{ domaine: string; niveau: string; note?: string }>,
  apprentissages_detail: {
    lecture: { fluence_mcl: "", date: "" },
  },
  remarques_besoins: "",
  conformites: {
    parents_informes: false,
    ppre_joint: false,
  },
};

/** =========================================================
 *  Étapes
 *  ========================================================= */
const STEPS = [
  { title: "Établissement & élève" },
  { title: "Famille" },
  { title: "Difficultés & suivis" },
  { title: "Place des parents" },
  { title: "Comportement" },
  { title: "Apprentissages" },
  { title: "Remarques & besoins" },
  { title: "Conformité & export" },
];

/** =========================================================
 *  Validations minimales par étape
 *  ========================================================= */
function canProceed(stepIndex: number, d: AnyData) {
  switch (stepIndex) {
    case 0: {
      const E = d.etablissement || {};
      const El = d.eleve || {};
      const hasSchool = !!(E.ecole && E.ecole !== "__AUTRE__") || !!E.ecole_libre;
      return (
        hasSchool &&
        !!E.type_ecole &&
        !!E.date_demande &&
        !!E.enseignant &&
        !!El.nom &&
        !!El.prenom &&
        !!El.date_naissance &&
        isDateISO(El.date_naissance) &&
        !!El.sexe &&
        !!El.niveau
      );
    }
    case 1: {
      const F = d.famille || {};
      const okTel = !F.responsable1_tel || isPhoneFRRE(F.responsable1_tel || "");
      const okEmail = !F.responsable1_email || isEmail(F.responsable1_email || "");
      return okTel && okEmail;
    }
    default:
      return true;
  }
}

/** =========================================================
 *  App
 *  ========================================================= */
export default function App() {
  const [data, setData] = useLocalStorageState<AnyData>(LS_KEY, DEFAULT_DATA);
  const [step, setStep] = useState(0);
  const [jsonFallback, setJsonFallback] = useState("");

  const update = (path: string, value: any) => {
    setData((d: AnyData) => {
      const copy = JSON.parse(JSON.stringify(d));
      setByPath(copy, path, value);
      return copy;
    });
  };

  const reset = () => {
    if (confirm("Réinitialiser le formulaire et vider la sauvegarde locale ?")) {
      setData(DEFAULT_DATA);
      localStorage.removeItem(LS_KEY);
      setStep(0);
    }
  };

  const canNext = useMemo(() => canProceed(step, data), [step, data]);

  const ACCENT = data.settings?.accentColor || DSFR_ACCENT;

  return (
    <div className="min-h-[100dvh] bg-white" style={{ ["--accent" as any]: ACCENT }}>
      {/* En-tête centré avec badge Date d'édition */}
      <header className="px-4 pt-8 pb-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Éducation nationale — Demande d’aide RASED
          </h1>
          <div className="mt-2 inline-flex items-center gap-2 text-sm">
            <span className="px-2.5 py-1 rounded-full border" style={{ borderColor: ACCENT, color: ACCENT }}>
              Édité le {data.meta?.date_edition || ""}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Wizard en 8 étapes, données stockées localement (aucun envoi serveur).
          </p>
        </div>
      </header>

      <Stepper steps={STEPS} step={step} setStep={setStep} />

      <main className="px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Étapes dans des grandes cartes centrées */}
          {step === 0 && (
            <Card>
              <EtablissementEleve data={data} update={update} />
            </Card>
          )}

          {step === 1 && (
            <Card>
              <Famille data={data} update={update} />
            </Card>
          )}

          {step === 2 && (
            <Card>
              <DifficultesSuivis data={data} update={update} />
            </Card>
          )}

          {step === 3 && (
            <Card>
              <PlaceParents data={data} update={update} />
            </Card>
          )}

          {step === 4 && (
            <Card>
              <Comportement data={data} update={update} />
            </Card>
          )}

          {step === 5 && (
            <Card>
              <Apprentissages data={data} update={update} />
            </Card>
          )}

          {step === 6 && (
            <Card>
              <RemarquesBesoins data={data} update={update} />
            </Card>
          )}

          {step === 7 && (
            <Card>
              <ConformiteExport
                data={data}
                update={update}
                onExportJSON={() => exportJSON(data, "rased-formulaire.json", setJsonFallback)}
                onPrint={() =>
                  doPrint(
                    data,
                    data.settings?.logoUrl || "",
                    data.settings?.accentColor || DSFR_ACCENT
                  )
                }
              />
            </Card>
          )}

          {/* Actions globales centrées */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="px-4 py-2 rounded-full border bg-white"
              style={{ borderColor: DSFR_BORDER }}
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={step >= STEPS.length - 1 || !canNext}
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="px-4 py-2 rounded-full text-white"
              style={{
                background: canNext && step < STEPS.length - 1 ? ACCENT : "#9CA3AF",
                borderColor: canNext && step < STEPS.length - 1 ? ACCENT : "#9CA3AF",
              }}
            >
              Suivant
            </button>

            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 rounded-full border bg-white"
              style={{ borderColor: DSFR_BORDER }}
            >
              Réinitialiser
            </button>
          </div>

          {/* Fallback JSON si téléchargement/clipboard bloqués */}
          {jsonFallback && (
            <Card>
              <div className="mb-2 font-medium">Export JSON (fallback)</div>
              <textarea
                value={jsonFallback}
                readOnly
                rows={10}
                className="w-full rounded-xl border px-3 py-2"
                style={{ borderColor: DSFR_BORDER }}
              />
              <div className="text-xs text-gray-600 mt-1">
                Copiez ce contenu manuellement si le téléchargement ne s’est pas lancé.
              </div>
            </Card>
          )}
        </div>
      </main>

      <footer className="px-4 py-10 text-center text-xs text-gray-500">
        Données non transmises. Pense à autoriser l’impression si ton navigateur la bloque.
      </footer>
    </div>
  );
}

/** ============================
 * Étape 1 — Établissement & élève
 * ============================ */
function EtablissementEleve({ data, update }: any) {
  const ECOLES_AFFICHAGE = ECOLES_POSSESSION
    .filter((e) => !data.etablissement.type_ecole || e.type === data.etablissement.type_ecole);

  const [typed, setTyped] = useState("");

  const useTypedAsSchool = () => {
    if (!typed.trim()) return;
    update("etablissement.ecole", "__AUTRE__");
    update("etablissement.ecole_libre", typed.trim());
  };

return (
  <>
    <section className="grid md:grid-cols-2 gap-8">
      <div>
        {/* Section : Établissement */}
        <h2 className="text-xl font-semibold mb-2">Établissement</h2>

        <Field label="Type d’école" required>
          <div className="flex flex-wrap gap-4">
<button
  type="button"
  onClick={() => {
    const sel = ECOLES_POSSESSION.find(s => s.nom === data.etablissement?.ecole);
    if (sel?.type) update("etablissement.type_ecole", sel.type);
  }}
  className="text-xs px-2 py-1 rounded border bg-white"
  style={{ borderColor: DSFR_BORDER }}
  title="Renseigner automatiquement d’après l’école"
>
  Auto depuis l’école
</button>
          </div>
        </Field>

        <Field label="École" required>
          <select
            value={data.etablissement.ecole}
            onChange={(e) => {
  const nom = e.target.value;
  update("etablissement.ecole", nom);
  if (nom !== "__AUTRE__") {
    const sel = ECOLES_POSSESSION.find(s => s.nom === nom);
    if (sel?.type) update("etablissement.type_ecole", sel.type);
  }
}}

            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            style={{ borderColor: DSFR_BORDER }}
          >
            <option value="">— Sélectionner —</option>
            {ECOLES_AFFICHAGE.map((e) => (
              <option key={e.nom + e.type} value={e.nom}>
                {e.nom} — {e.type}{e.note ? ` (${e.note})` : ""}
              </option>
            ))}
            <option value="__AUTRE__">Autre… (saisie manuelle)</option>
          </select>

          {data.etablissement.ecole === "__AUTRE__" && (
            <div className="mt-2">
              <Input
                value={data.etablissement.ecole_libre || ""}
                onChange={(v: any) => update("etablissement.ecole_libre", v)}
                placeholder="Nom de l’école…"
              />
            </div>
          )}

          {data.etablissement.ecole !== "__AUTRE__" && (
            <div className="mt-3 grid md:grid-cols-[1fr_auto] gap-2 items-center">
              <Input
                value={typed}
                onChange={setTyped}
                placeholder="Ou saisir manuellement le nom de l’école…"
              />
              <button
                type="button"
                onClick={useTypedAsSchool}
                className="px-3 py-2 rounded-full border bg-white text-sm"
                style={{ borderColor: DSFR_BORDER }}
              >
                Utiliser cette saisie
              </button>
            </div>
          )}
        </Field>

  <Field label="Date de la demande" required>
    <Input
      type="date"
      value={data.etablissement.date_demande}
      onChange={(v: any) => update("etablissement.date_demande", v)}
    />
  </Field>

<Field label="L’élève a-t-il déjà été maintenu ?" required>
<div className="flex gap-3">
{([true, false] as const).map((v) => {
const active = data.eleve?.deja_maintenu === v;
return (
<button
key={String(v)}
type="button"
className={`rounded-2xl border px-3 py-1 text-sm ${
active ? "border-[var(--DSFR_ACCENT)] ring-1 ring-[var(--DSFR_ACCENT)]" : "border-[var(--DSFR_BORDER)]"
}`}
onClick={() => {
update("eleve.deja_maintenu", v);
if (!v) update("eleve.niveau_maintien", "");
}}
>
{v ? "Oui" : "Non"}
</button>
);
})}
</div>
</Field>

{data.eleve?.deja_maintenu && (
<Field label="Niveau du maintien précédent" required>
<select
className="mt-2 w-full rounded-lg border border-[var(--DSFR_BORDER)] p-2"
value={data.eleve?.niveau_maintien ?? ""}
onChange={(e) => update("eleve.niveau_maintien", e.target.value || "")}
>
<option value="">Sélectionner…</option>
{(() => {
const t = data.etablissement?.type_ecole as EcoleType | undefined;
const options = t ? NIVEAUX_BY_TYPE[t] : NIVEAUX_BY_TYPE.Primaire;
return options.map((niv) => (
<option key={niv} value={niv}>{niv}</option>
));
})()}
</select>
</Field>
)}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: DSFR_ACCENT }}>
          Élève
        </h2>
        <Field label="Nom" required>
          <Input value={data.eleve.nom} onChange={(v: any) => update("eleve.nom", v)} />
        </Field>
        <Field label="Prénom" required>
          <Input value={data.eleve.prenom} onChange={(v: any) => update("eleve.prenom", v)} />
        </Field>
        <Field label="Date de naissance" required>
          <Input
            type="date"
            value={data.eleve.date_naissance}
            onChange={(v: any) => update("eleve.date_naissance", v)}
          />
        </Field>
        <Field label="Sexe" required>
          <select
            value={data.eleve.sexe}
            onChange={(e) => update("eleve.sexe", e.target.value)}
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            style={{ borderColor: DSFR_BORDER }}
          >
            <option value="F">F</option>
            <option value="M">M</option>
          </select>
        </Field>
        <Field label="Niveau" required>
          <select
            value={data.eleve.niveau}
            onChange={(e) => update("eleve.niveau", e.target.value)}
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            style={{ borderColor: DSFR_BORDER }}
          >
            <option value="">— Sélectionner —</option>
            {NIVEAUX.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </Field>
        <Field label="Niveau de la classe (si double niveau)">
          <input
            list="niveau-classe-suggest"
            value={data.eleve.niveau_classe || ""}
            onChange={(e) => update("eleve.niveau_classe", e.target.value)}
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            style={{ borderColor: DSFR_BORDER }}
            placeholder="Ex. CE1-CE2"
          />
          <datalist id="niveau-classe-suggest">
            {NIVEAUX_CLASSE_SUGGEST.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </Field>
      </div>
    </section>
  </>
);
}

/** ============================
 * Étape 2 — Famille
 * ============================ */
function Famille({ data, update }: any) {
  const F = data.famille || {};
  const telOk = !F.responsable1_tel || isPhoneFRRE(F.responsable1_tel);
  const mailOk = !F.responsable1_email || isEmail(F.responsable1_email);

  return (
    <section className="grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: DSFR_ACCENT }}>
          Responsable légal 1
        </h2>
        <Field label="Nom">
          <Input
            value={F.responsable1_nom}
            onChange={(v: any) => update("famille.responsable1_nom", v)}
          />
        </Field>
        <Field label="Téléphone">
          <Input
            value={F.responsable1_tel}
            onChange={(v: any) => update("famille.responsable1_tel", v)}
            className={!telOk ? "border-red-500" : ""}
          />
        </Field>
        <Field label="Email">
          <Input
            value={F.responsable1_email}
            onChange={(v: any) => update("famille.responsable1_email", v)}
            className={!mailOk ? "border-red-500" : ""}
          />
        </Field>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: DSFR_ACCENT }}>
          Responsable légal 2 (facultatif)
        </h2>
        <Field label="Nom">
          <Input
            value={F.responsable2_nom}
            onChange={(v: any) => update("famille.responsable2_nom", v)}
          />
        </Field>
        <Field label="Téléphone">
          <Input
            value={F.responsable2_tel}
            onChange={(v: any) => update("famille.responsable2_tel", v)}
          />
        </Field>
        <Field label="Email">
          <Input
            value={F.responsable2_email}
            onChange={(v: any) => update("famille.responsable2_email", v)}
          />
        </Field>
      </div>
    </section>
  );
}

/** ============================
 * Étape 3 — Difficultés & suivis
 * ============================ */
function DifficultesSuivis({ data, update }: any) {
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
    <section className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: DSFR_ACCENT }}>
          Difficultés observées
        </h2>
        <TextArea
          value={data.difficultes}
          onChange={(v: any) => update("difficultes", v)}
          rows={6}
          placeholder="Décrire brièvement les difficultés constatées (comportement, apprentissages, contextes, etc.)"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: DSFR_ACCENT }}>
          Réponses mises en place à l’école
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="inline-flex items-center gap-2 rounded-xl border bg-white p-3" style={{ borderColor: DSFR_BORDER }}>
            <input
              type="checkbox"
              checked={!!rE.apc?.actif}
              onChange={(e) => update("reponses_ecole.apc.actif", e.target.checked)}
            />
            <span>APC</span>
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border bg-white p-3" style={{ borderColor: DSFR_BORDER }}>
            <input
              type="checkbox"
              checked={!!rE.differenciation?.actif}
              onChange={(e) => update("reponses_ecole.differenciation.actif", e.target.checked)}
            />
            <span>Différenciation</span>
          </label>
        </div>

        {rE.apc?.actif && (
          <Field label="Précisions APC (objectif, période, durée)">
            <TextArea
              value={rE.apc?.details || ""}
              onChange={(v: any) => update("reponses_ecole.apc.details", v)}
              rows={3}
              placeholder="Ex. Remédiation compréhension orale, 6 semaines, 2 × 30 min / semaine"
            />
          </Field>
        )}

        {rE.differenciation?.actif && (
          <Field label="Précisions Différenciation (aménagements, supports, regroupements)">
            <TextArea
              value={rE.differenciation?.details || ""}
              onChange={(v: any) => update("reponses_ecole.differenciation.details", v)}
              rows={3}
              placeholder="Ex. Textes adaptés, binômes hétérogènes, consignes segmentées, temps majoré"
            />
          </Field>
        )}

        <Field label="Autres aménagements / dispositifs (facultatif)">
          <TextArea
            value={rE.autres || ""}
            onChange={(v: any) => update("reponses_ecole.autres", v)}
            rows={3}
            placeholder="Ex. PAP en cours, aménagements d’évaluation, tutorat, coin calme, etc."
          />
        </Field>
      </div>

      <div>
        <h3 className="text-base font-semibold" style={{ color: DSFR_ACCENT }}>Santé — dépistage</h3>
        <div className="grid md:grid-cols-2 gap-3 mt-2">
          <Field label="Problème auditif">
            <RadioScale name="sante-aud" value={S.trouble_auditif || ""} onChange={(v) => update("sante.trouble_auditif", v)} options={["Non","À vérifier","Oui"]} />
          </Field>
          {S.trouble_auditif === "Oui" && (
            <Field label="Détails auditif (facultatif)">
              <Input value={S.trouble_auditif_details || ""} onChange={(v) => update("sante.trouble_auditif_details", v)} placeholder="Appareillage, bilan ORL du…, résultats dépistage…" />
            </Field>
          )}
          <Field label="Problème visuel">
            <RadioScale name="sante-vis" value={S.trouble_visuel || ""} onChange={(v) => update("sante.trouble_visuel", v)} options={["Non","À vérifier","Oui"]} />
          </Field>
          {S.trouble_visuel === "Oui" && (
            <Field label="Détails visuel (facultatif)">
              <Input value={S.trouble_visuel_details || ""} onChange={(v) => update("sante.trouble_visuel_details", v)} placeholder="Lunettes, RDV OPH du…, dépistage infirmier…" />
            </Field>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: DSFR_ACCENT }}>
          Suivis extérieurs
        </h2>
        {items.length === 0 && (
          <div className="text-sm text-gray-600">Aucun suivi déclaré.</div>
        )}
        <div className="space-y-3">
          {items.map((r: any, i: number) => {
            const isOrtho = r.dispositif === "Orthophonie";
            return (
              <div
                key={i}
                className="grid md:grid-cols-1 gap-3 items-start border rounded-2xl p-3 bg-white"
                style={{ borderColor: DSFR_BORDER }}
              >
                <div className="grid md:grid-cols-2 gap-3">
                  <Field label="Type de suivi">
                    <select
                      value={r.dispositif || ""}
                      onChange={(e) => set(i, "dispositif", e.target.value)}
                      className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                      style={{ borderColor: DSFR_BORDER }}
                    >
                      <option value="">— Sélectionner —</option>
                      {SUIVIS_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Fréquence">
                    <Input value={r.frequence} onChange={(v) => set(i, "frequence", v)} />
                  </Field>
                </div>

                {isOrtho ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="Nom de l’orthophoniste">
                      <select
                        value={r.professionnel || ""}
                        onChange={(e) => set(i, "professionnel", e.target.value)}
                        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                        style={{ borderColor: DSFR_BORDER }}
                      >
                        <option value="">— Sélectionner —</option>
                        {ORTHOPHONISTES_OUEST.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                        <option value="__AUTRE__">Autre…</option>
                      </select>
                    </Field>
                    {r.professionnel === "__AUTRE__" && (
                      <Field label="Saisir le nom">
                        <Input value={r.professionnel_libre || ""} onChange={(v) => set(i, "professionnel_libre", v)} />
                      </Field>
                    )}
                  </div>
                ) : (
                  ["Orthoptie","Psychomotricité","Ergothérapie","Psychologue libéral"].includes(r.dispositif) && (
                    <Field label="Nom du professionnel">
                      <Input value={r.professionnel || ""} onChange={(v) => set(i, "professionnel", v)} />
                    </Field>
                  )
                )}

                <Field label="Contact">
                  <Input value={r.contact} onChange={(v) => set(i, "contact", v)} />
                </Field>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => del(i)}
                    className="px-3 py-2 rounded-full border bg-white"
                    style={{ borderColor: DSFR_BORDER }}
                    aria-label="Supprimer le suivi"
                    title="Supprimer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={add}
          className="mt-3 px-4 py-2 rounded-full border bg-white"
          style={{ borderColor: DSFR_BORDER }}
        >
          + Ajouter un suivi
        </button>
      </div>
    </section>
  );
}

/** ============================
 * Étape 4 — Place des parents
 * ============================ */
function PlaceParents({ data, update }: any) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3" style={{ color: DSFR_ACCENT }}>
        Place des parents
      </h2>
      <TextArea
        value={data.place_parents}
        onChange={(v: any) => update("place_parents", v)}
        rows={8}
        placeholder="Échanges avec les responsables, adhésion aux mesures proposées, attentes exprimées, etc."
      />
    </section>
  );
}

/** ============================
 * Étape 5 — Comportement
 * ============================ */
const COMPORTEMENTS = [
  "Respect des règles",
  "Attention en classe",
  "Gestion des émotions",
  "Relation aux pairs",
  "Autonomie",
];

function Comportement({ data, update }: any) {
  const items = (data.comportement as Array<any>)?.length
    ? data.comportement
    : COMPORTEMENTS.map((c) => ({ item: c, niveau: "", note: "" }));

  const set = (idx: number, key: string, val: string) => {
    const next = items.map((r: any, i: number) => (i === idx ? { ...r, [key]: val } : r));
    update("comportement", next);
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3" style={{ color: DSFR_ACCENT }}>
        Comportement
      </h2>
      <div className="grid md:grid-cols-2 gap-3">
        {items.map((r: any, i: number) => (
          <div key={i} className="rounded-2xl border bg-white p-3" style={{ borderColor: DSFR_BORDER }}>
            <div className="font-medium mb-2">{r.item}</div>
            <RadioScale name={`comp-${i}`} value={r.niveau} onChange={(v) => set(i, "niveau", v)} options={RADIO_BEHAV} />
            <div className="mt-2">
              <Input
                value={r.note || ""}
                onChange={(v) => set(i, "note", v)}
                placeholder="Complément (facultatif) — ex. récidive en récréation, contexte spécifique…"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** ============================
 * Étape 6 — Apprentissages
 * ============================ */
const DOMAINES = ["Lecture", "Écriture", "Mathématiques", "Langage oral", "Motricité"];

function Apprentissages({ data, update }: any) {
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
      <h2 className="text-lg font-semibold mb-3" style={{ color: DSFR_ACCENT }}>
        Apprentissages
      </h2>
      <div className="grid md:grid-cols-2 gap-3">
        {items.map((r: any, i: number) => (
          <div key={i} className="rounded-2xl border bg-white p-3" style={{ borderColor: DSFR_BORDER }}>
            <div className="font-medium mb-2">{r.domaine}</div>
            <RadioScale name={`appr-${i}`} value={r.niveau} onChange={(v) => set(i, "niveau", v)} options={RADIO_LEVEL} />
            <div className="mt-2">
              <Input
                value={r.note || ""}
                onChange={(v) => set(i, "note", v)}
                placeholder="Complément (facultatif) — ex. difficultés en résolution, copie lente…"
              />
            </div>

            {r.domaine === "Lecture" && (
              <div className="mt-3 grid md:grid-cols-2 gap-3">
                <Field label="Fluence (mots correctement lus / 1 min)">
                  <Input
                    type="number"
                    value={lect.fluence_mcl || ""}
                    onChange={(v) => update("apprentissages_detail.lecture.fluence_mcl", v)}
                    placeholder="Ex. 85"
                  />
                </Field>
                <Field label="Date de mesure">
                  <Input
                    type="date"
                    value={lect.date || ""}
                    onChange={(v) => update("apprentissages_detail.lecture.date", v)}
                  />
                </Field>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/** ============================
 * Étape 7 — Remarques & besoins
 * ============================ */
function RemarquesBesoins({ data, update }: any) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3" style={{ color: DSFR_ACCENT }}>
        Remarques & besoins
      </h2>
      <TextArea
        value={data.remarques_besoins}
        onChange={(v: any) => update("remarques_besoins", v)}
        rows={8}
        placeholder="Besoins identifiés, objectifs visés, aménagements souhaités, etc."
      />
    </section>
  );
}

/** ============================
 * Étape 8 — Conformité & export
 * ============================ */
function ConformiteExport({
  data,
  update,
  onExportJSON,
  onPrint,
}: {
  data: AnyData;
  update: (path: string, value: any) => void;
  onExportJSON: () => void;
  onPrint: () => void;
}) {
  const ok =
    data.conformites?.parents_informes && data.conformites?.ppre_joint;

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: DSFR_ACCENT }}>
          Conformité
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="inline-flex items-center gap-2 rounded-xl border bg-white p-3" style={{ borderColor: DSFR_BORDER }}>
            <input
              type="checkbox"
              checked={!!data.conformites?.parents_informes}
              onChange={(e) => update("conformites.parents_informes", e.target.checked)}
            />
            <span>Parents informés</span>
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border bg-white p-3" style={{ borderColor: DSFR_BORDER }}>
            <input
              type="checkbox"
              checked={!!data.conformites?.ppre_joint}
              onChange={(e) => update("conformites.ppre_joint", e.target.checked)}
            />
            <span>PPRE joint</span>
          </label>
        </div>
        {!ok && (
          <div className="text-sm text-orange-800 bg-orange-50 border border-orange-200 rounded-xl p-3 mt-2">
            Coche les deux cases pour valider la conformité (conseillé avant d’imprimer).
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: DSFR_ACCENT }}>
          Mise en page & logo (impression)
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Logo (URL ou data:URI)">
            <Input
              value={data.settings?.logoUrl || ""}
              onChange={(v: any) => update("settings.logoUrl", v)}
              placeholder="https://…/logo.png"
            />
          </Field>
          <Field label="Couleur d’accent">
            <Input
              type="color"
              value={data.settings?.accentColor || DSFR_ACCENT}
              onChange={(v: any) => update("settings.accentColor", v)}
            />
          </Field>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          Astuce : un logo en <code>data:image/png;base64,…</code> évite les soucis CORS.
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: DSFR_ACCENT }}>
          Métadonnées
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Date d’édition">
            <Input
              type="date"
              value={data.meta?.date_edition || ""}
              onChange={(v: any) => update("meta.date_edition", v)}
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onExportJSON}
          className="px-4 py-2 rounded-full border bg-white"
          style={{ borderColor: DSFR_BORDER }}
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="px-4 py-2 rounded-full text-white"
          style={{ background: DSFR_ACCENT, borderColor: DSFR_ACCENT }}
        >
          Aperçu / Impression
        </button>
      </div>
    </section>
  );
}
