import type { AnyData } from "./types";
import { esc, toDataURL } from "./utils";

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
:root { --accent: #000091; }
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

type PrintOptions = { title?: string; logoDataUrl?: string; accent?: string };

function buildPrintableHTML(d: AnyData, opts: PrintOptions) {
  const { title = "Éducation nationale – RASED", logoDataUrl = "", accent = "#000091" } = opts;

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
<style>${PRINT_CSS.replace(":root { --accent: #000091; }", `:root { --accent: ${accent}; }`)}</style>
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

export async function doPrint(data: AnyData, logoUrl: string, accent = "#000091") {
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
