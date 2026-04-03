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
.section-title { color: var(--accent); margin: 8px 0; border-bottom: 1px solid #eee; padding-bottom: 2px; }
.sub-title { font-weight: bold; margin-top: 8px; margin-bottom: 4px; font-size: 14px; }
.badge { display:inline-block; padding:2px 6px; border-radius:6px; font-size:12px; border:1px solid var(--accent); }
.grid { display:grid; gap:8px; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.small { font-size: 12px; }
.box { border: 1px solid #eee; padding: 8px; border-radius: 4px; background: #f9fafb; margin-top: 4px; }
`;

type PrintOptions = { title?: string; logoDataUrl?: string; accent?: string };

function buildPrintableHTML(d: AnyData, opts: PrintOptions) {
  const { title = "Éducation nationale – RASED", logoDataUrl = "", accent = "#000091" } = opts;

  const schoolName =
    d.etablissement?.ecole && d.etablissement?.ecole !== "__AUTRE__"
      ? d.etablissement?.ecole
      : d.etablissement?.ecole_libre || "";

  // Helpers for new structure
  const getComp = (item: string) => (d.comportement || []).find((x: any) => x.item === item);
  const getAppr = (item: string) => (d.apprentissages || []).find((x: any) => x.item === item);

  const renderEvalRow = (item: string, entry: any) => {
    if (!entry) return "";
    return `<tr>
      <td><b>${esc(item)}</b></td>
      <td>${esc(entry.evaluation || "—")}</td>
      <td>${esc(entry.observation || "")}</td>
    </tr>`;
  };

  const renderRelRow = (item: string, entry: any) => {
    if (!entry) return "";
    return `<tr>
      <td><b>${esc(item)}</b></td>
      <td>
        <div>Freq: ${esc(entry.frequence || "—")}</div>
        <div>Qual: ${esc(entry.qualite || "—")}</div>
      </td>
      <td>${esc(entry.observation || "")}</td>
    </tr>`;
  };

  // Section Data
  const COMP_ITEMS = [
    "Autonomie", "Intérêt scolaire", "Attention / concentration", "Confiance en soi",
    "Rythme de travail", "Attitude face à la difficulté / à l’erreur", "Respect des règles"
  ];
  const REL_ITEMS = ["Relation aux pairs", "Relation aux adultes"];

  const APPR_LECTURE = ["Connaissance des lettres", "Connaissance du code", "Écriture", "Compréhension écrite"];
  const APPR_ORAL = ["Ose prendre la parole, demander de l’aide…", "Qualité du langage (syntaxe, vocabulaire…)", "Cohérence des propos", "Compréhension orale"];
  const APPR_MATH = ["Structuration spatio-temporelle", "Numération", "Techniques opératoires"];
  const APPR_TRANS = ["Compréhension des consignes", "Mémorisation"];

  // Code & Fluence Details
  const codeDetails = d.apprentissages_detail?.code || {};
  const lectDetails = d.apprentissages_detail?.lecture || {};

  // Besoins
  const besoins = d.besoins_prioritaires || [];

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
    <div><b>Enseignant</b><br/>${esc(d.etablissement?.enseignant || "—")}</div>
    <div><b>Date de la demande</b><br/>${esc(d.etablissement?.date_demande || "—")}</div>
    <div><b>Élève</b><br/>${esc(d.eleve?.nom || "")} ${esc(d.eleve?.prenom || "")}</div>
    <div><b>Date de naissance</b><br/>${esc(d.eleve?.date_naissance || "—")}</div>
    <div><b>Sexe</b><br/>${esc(d.eleve?.sexe || "—")}</div>
    <div><b>Niveau</b><br/>${esc(d.eleve?.niveau || "")} ${d.eleve?.niveau_classe ? `(${d.eleve.niveau_classe})` : ""}</div>
    <div><b>Déjà maintenu ?</b><br/>${d.eleve?.deja_maintenu ? `Oui (${esc(d.eleve?.niveau_maintien || "")})` : "Non"}</div>
  </div>
</section>

<section class="section">
  <h2 class="section-title">Famille</h2>
  <div class="grid grid-2">
    <div><b>Responsable légal 1</b><br/>${esc(d.famille?.responsable1_nom || "—")}<br/>${esc(d.famille?.responsable1_tel || "")} ${esc(d.famille?.responsable1_email || "")}</div>
    <div><b>Responsable légal 2</b><br/>${d.famille?.responsable2_nom ? `${esc(d.famille?.responsable2_nom)}<br/>${esc(d.famille?.responsable2_tel || "")} ${esc(d.famille?.responsable2_email || "")}` : "—"}</div>
  </div>
</section>

<section class="section">
  <h2 class="section-title">Difficultés & suivis</h2>
  <div class="sub-title">Difficultés observées</div>
  <div>${esc(d.difficultes || "—")}</div>

  <div class="sub-title">Réponses mises en place à l'école</div>
  <ul>
    <li><b>APC:</b> ${d.reponses_ecole?.apc?.actif ? "Oui" : "Non"} ${d.reponses_ecole?.apc?.details ? `(${esc(d.reponses_ecole.apc.details)})` : ""}</li>
    <li><b>Différenciation:</b> ${d.reponses_ecole?.differenciation?.actif ? "Oui" : "Non"} ${d.reponses_ecole?.differenciation?.details ? `(${esc(d.reponses_ecole.differenciation.details)})` : ""}</li>
    ${d.reponses_ecole?.autres ? `<li><b>Autres:</b> ${esc(d.reponses_ecole.autres)}</li>` : ""}
  </ul>

  <div class="sub-title">Santé — dépistage</div>
  <ul>
    <li><b>Problème auditif:</b> ${esc(d.sante?.trouble_auditif || "Non")} ${d.sante?.trouble_auditif_details ? `(${esc(d.sante.trouble_auditif_details)})` : ""}</li>
    <li><b>Problème visuel:</b> ${esc(d.sante?.trouble_visuel || "Non")} ${d.sante?.trouble_visuel_details ? `(${esc(d.sante.trouble_visuel_details)})` : ""}</li>
  </ul>

  <div class="sub-title">Suivis extérieurs</div>
  ${d.suivis_exterieurs && d.suivis_exterieurs.length > 0 ? `
  <ul>
    ${d.suivis_exterieurs.map((s: any) => `
      <li><b>${esc(s.dispositif)}</b>: ${esc(s.professionnel || s.professionnel_libre || "")} ${s.frequence ? `(${esc(s.frequence)})` : ""} ${s.contact ? `[Contact: ${esc(s.contact)}]` : ""}</li>
    `).join("")}
  </ul>
  ` : "Aucun suivi extérieur renseigné."}
</section>

<section class="section">
  <h2 class="section-title">Place des parents</h2>
  <div>${esc(d.place_parents || "—")}</div>
</section>

<section class="section">
  <h2 class="section-title">Comportement & Relations</h2>
  <table class="table">
    <thead><tr><th style="width:40%">Item</th><th style="width:25%">Évaluation</th><th>Observations</th></tr></thead>
    <tbody>
      ${COMP_ITEMS.map(i => renderEvalRow(i, getComp(i))).join("")}
      ${REL_ITEMS.map(i => renderRelRow(i, getComp(i))).join("")}
    </tbody>
  </table>
</section>

<section class="section">
  <h2 class="section-title">Apprentissages</h2>

  <div class="sub-title">Lecture</div>
  <table class="table">
    <tbody>
       ${APPR_LECTURE.map(i => renderEvalRow(i, getAppr(i))).join("")}
    </tbody>
  </table>

  ${(codeDetails.stade || codeDetails.observation) ? `
  <div class="box small">
    <b>Précisions Code :</b> Stade de maîtrise : ${esc(codeDetails.stade || "—")}<br/>
    <i>${esc(codeDetails.observation || "")}</i>
  </div>` : ""}

  ${lectDetails.fluence_mcl ? `
  <div class="box small">
    <b>Fluence :</b> ${esc(lectDetails.fluence_mcl)} Mots/min (${esc(lectDetails.date || "")})
  </div>` : ""}

  <div class="sub-title">Langage Oral</div>
  <table class="table">
    <tbody>${APPR_ORAL.map(i => renderEvalRow(i, getAppr(i))).join("")}</tbody>
  </table>

  <div class="sub-title">Mathématiques</div>
  <table class="table">
    <tbody>${APPR_MATH.map(i => renderEvalRow(i, getAppr(i))).join("")}</tbody>
  </table>

  <div class="sub-title">Transversal</div>
  <table class="table">
    <tbody>${APPR_TRANS.map(i => renderEvalRow(i, getAppr(i))).join("")}</tbody>
  </table>
</section>

<section class="section pb">
  <h2 class="section-title">Besoins prioritaires</h2>
  <ul>
    <li>${esc(besoins[0] || "—")}</li>
    <li>${esc(besoins[1] || "—")}</li>
  </ul>
</section>

<section class="section">
  <h2 class="section-title">Remarques complémentaires</h2>
  <div>${esc(d.remarques_besoins || "—")}</div>
</section>

<footer class="hint" style="margin-top:24px; text-align:center;">
  Généré localement — RASED
</footer>
</body>
</html>`;
}

export async function doPrint(data: AnyData, logoUrl: string, accent = "#000091", defaultFileName?: string) {
  const logoDataUrl = await toDataURL(logoUrl);
  const title = defaultFileName || "Éducation nationale – RASED";
  const html = buildPrintableHTML(data, { title, logoDataUrl, accent });

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
    // Attempt to rename the document title temporarily for the print dialog save name
    const originalTitle = document.title;
    if (defaultFileName) {
      document.title = defaultFileName;
    }

    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      if (defaultFileName) {
        document.title = originalTitle;
      }
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(iframe);
      }, 150);
    }
  };
}
