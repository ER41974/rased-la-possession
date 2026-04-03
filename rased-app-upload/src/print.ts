import type { AnyData } from "./types";
import { esc, toDataURL } from "./utils";

const PRINT_CSS = `
@page { size: A4 portrait; margin: 15mm; }
@media print {
  html, body { height: auto; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print { display: none !important; }
  .section { break-inside: avoid; margin-bottom: 16px; }
  .pb { break-before: page; }
  h1, h2, h3 { break-after: avoid; }
}
:root {
  --accent: #000091;
  --marianne-red: #e1000f;
  --dsfr-alt: #f6f6f6;
  --text-main: #161616;
}
body {
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: var(--text-main);
  line-height: 1.5;
}
.header {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 24px;
}
.marianne {
  border-left: 4px solid var(--accent);
  padding-left: 8px;
  font-weight: bold;
  color: var(--accent);
  text-transform: uppercase;
  font-size: 14px;
  line-height: 1.1;
  letter-spacing: 0.05em;
}
.header-title {
  text-align: right;
}
.header-title h1 {
  margin: 0; color: var(--accent); font-size: 20px;
}
.header-stripe {
  height: 4px; width: 100%; display: flex; margin-bottom: 16px;
}
.header-stripe > div { flex: 1; }
.stripe-blue { background: var(--accent); }
.stripe-white { background: white; }
.stripe-red { background: var(--marianne-red); }

.logo { width: 64px; height: 64px; object-fit: contain; }
.hint { font-size: 12px; color: #666; }
.table { width:100%; border-collapse: collapse; margin-top: 8px; }
.table th { background: var(--dsfr-alt); text-align: left; font-weight: 600; color: var(--accent); }
.table th, .table td { border: 1px solid #e5e5e5; padding: 8px; font-size: 13px; vertical-align: top; }
.section-title {
  color: var(--accent);
  margin: 16px 0 8px 0;
  border-bottom: 2px solid var(--accent);
  padding-bottom: 4px;
  font-size: 16px;
}
.sub-title { font-weight: 600; margin-top: 12px; margin-bottom: 4px; font-size: 14px; color: #333; }
.badge { display:inline-block; padding:4px 8px; border-radius: 4px; font-size:12px; background: var(--dsfr-alt); border: 1px solid #ddd;}
.grid { display:grid; gap:12px; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.small { font-size: 12px; }
.box { border-left: 4px solid var(--accent); padding: 12px; background: var(--dsfr-alt); margin-top: 8px; }
`;

type PrintOptions = { title?: string; logoDataUrl?: string; accent?: string };

function buildPrintableHTML(d: AnyData, opts: PrintOptions) {
  const { title = "Demande d'aide RASED", logoDataUrl = "", accent = "#000091" } = opts;

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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<title>${esc(title)}</title>
<style>${PRINT_CSS.replace(":root { --accent: #000091;", `:root { --accent: ${accent};`)}</style>
</head>
<body>

<div class="header-stripe">
  <div class="stripe-blue"></div>
  <div class="stripe-white"></div>
  <div class="stripe-red"></div>
</div>

<header class="header">
  <div style="display:flex;align-items:center;gap:16px;">
    <div class="marianne">
      République<br/>Française
    </div>
    ${logoDataUrl ? `<img class="logo" src="${logoDataUrl}" alt="Logo Académie" />` : ""}
  </div>
  <div class="header-title">
    <h1>${esc(title)}</h1>
    <div class="hint" style="margin-top:4px;">Circonscription de La Possession</div>
    <div style="margin-top:8px;" class="badge">Édité le ${esc(d.meta?.date_edition || "")}</div>
  </div>
</header>

<section class="section">
  <h2 class="section-title">Établissement & élève</h2>
  <div class="grid grid-2">
    <div><b>École</b><br/>${esc(schoolName || "—")}</div>
    <div><b>Enseignant</b><br/>${esc(d.etablissement?.enseignant || "—")}</div>
    <div><b>Élève</b><br/>${esc(d.eleve?.nom || "")} ${esc(d.eleve?.prenom || "")}</div>
    <div><b>Niveau</b><br/>${esc(d.eleve?.niveau || "")} ${d.eleve?.niveau_classe ? `(${d.eleve.niveau_classe})` : ""}</div>
  </div>
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
