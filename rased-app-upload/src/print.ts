import type { AnyData } from "./types";
import { esc, toDataURL } from "./utils";

const PRINT_CSS = `
@page { size: A4 portrait; margin: 15mm; }
@media print {
  html, body { height: auto; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print { display: none !important; }
  .section { break-inside: avoid; margin-bottom: 24px; }
  .pb { page-break-before: always; }
  h1, h2, h3 { break-after: avoid; }
}
:root {
  --accent: #000091;
  --marianne-red: #e1000f;
  --dsfr-alt: #f6f6f6;
  --text-main: #161616;
  --green: #10B981;
  --green-bg: #ECFDF5;
  --blue: #3B82F6;
  --blue-bg: #EFF6FF;
  --red: #EF4444;
  --red-bg: #FEF2F2;
  --gray: #6B7280;
  --gray-bg: #F3F4F6;
}
body {
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: var(--text-main);
  line-height: 1.5;
  font-size: 13px;
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
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px 0;
  border-bottom: 2px solid #E5E7EB;
  padding-bottom: 4px;
}
.sub-title { font-weight: 600; color: #374151; margin-top: 16px; margin-bottom: 8px; font-size: 15px; }
.badge { display:inline-block; padding:4px 8px; border-radius:4px; font-size:12px; font-weight: 600; border:1px solid #E5E7EB; background: #F9FAFB; color: #4B5563; }
.eval-badge {
  display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; text-align: center; white-space: nowrap;
}
.eval-green { background: var(--green-bg); color: #065F46; border: 1px solid #A7F3D0; }
.eval-blue { background: var(--blue-bg); color: #1E40AF; border: 1px solid #BFDBFE; }
.eval-red { background: var(--red-bg); color: #991B1B; border: 1px solid #FECACA; }
.eval-gray { background: var(--gray-bg); color: #374151; border: 1px solid #D1D5DB; }

.grid { display:grid; gap:16px; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.grid-3 { grid-template-columns: 1fr 1fr 1fr; }
.small { font-size: 12px; }
.box { border-left: 4px solid var(--accent); padding: 12px; background: var(--dsfr-alt); margin-top: 8px; }
.card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.card-title { font-weight: 600; font-size: 14px; color: #4B5563; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
.value-label { font-size: 11px; color: #6B7280; text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }
.value-text { font-size: 14px; font-weight: 500; color: #111827; }
.list-disc { padding-left: 20px; margin-top: 8px; margin-bottom: 8px; }
.list-disc li { margin-bottom: 4px; }
.bar-chart { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.bar-chart-label { width: 45%; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-container { flex-grow: 1; height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 4px; }
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

  const getBadgeClass = (val: string) => {
    const v = (val || "").toLowerCase();
    if (v.includes("très satisfaisant") || v.includes("excellente") || v.includes("jamais")) return "eval-green";
    if (v.includes("satisfaisant") || v.includes("bonne") || v.includes("rarement")) return "eval-blue";
    if (v.includes("problématique") || v.includes("fragile") || v.includes("souvent") || v.includes("toujours")) return "eval-red";
    return "eval-gray";
  };

  const getScore = (val: string) => {
    const v = (val || "").toLowerCase();
    if (v.includes("très satisfaisant") || v.includes("excellente") || v.includes("jamais")) return 3;
    if (v.includes("satisfaisant") || v.includes("bonne") || v.includes("rarement")) return 2;
    if (v.includes("problématique") || v.includes("fragile") || v.includes("souvent") || v.includes("toujours")) return 1;
    return 0; // Unknown or not filled
  };

  const renderEvalBadge = (val: string) => {
    if (!val) return "—";
    return `<span class="eval-badge ${getBadgeClass(val)}">${esc(val)}</span>`;
  };

  const renderEvalRow = (item: string, entry: any) => {
    if (!entry) return "";
    return `<tr>
      <td><b>${esc(item)}</b></td>
      <td>${renderEvalBadge(entry.evaluation)}</td>
      <td>${esc(entry.observation || "")}</td>
    </tr>`;
  };

  const renderRelRow = (item: string, entry: any) => {
    if (!entry) return "";
    return `<tr>
      <td><b>${esc(item)}</b></td>
      <td>
        <div style="margin-bottom: 4px;">Freq: ${renderEvalBadge(entry.frequence)}</div>
        <div>Qual: ${renderEvalBadge(entry.qualite)}</div>
      </td>
      <td>${esc(entry.observation || "")}</td>
    </tr>`;
  };

  const renderBarChart = (title: string, items: {label: string, score: number}[]) => {
    const validItems = items.filter(i => i.score > 0);
    if (validItems.length === 0) return "";

    return `
      <div style="margin-bottom: 16px;">
        <div class="sub-title" style="margin-top: 0;">${esc(title)}</div>
        ${validItems.map(item => {
          const width = (item.score / 3) * 100;
          let color = "var(--gray)";
          if (item.score === 3) color = "var(--green)";
          if (item.score === 2) color = "var(--blue)";
          if (item.score === 1) color = "var(--red)";

          return `
            <div class="bar-chart">
              <div class="bar-chart-label" title="${esc(item.label)}">${esc(item.label)}</div>
              <div class="bar-container">
                <div class="bar-fill" style="width: ${width}%; background-color: ${color};"></div>
              </div>
            </div>`;
        }).join("")}
      </div>`;
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

  // Scores synthétiques
  const compScores = COMP_ITEMS.map(i => {
    const entry = getComp(i);
    return { label: i, score: entry ? getScore(entry.evaluation) : 0 };
  });

  const apprScores = [
    ...APPR_LECTURE.map(i => ({ label: `Lecture: ${i}`, score: getAppr(i) ? getScore(getAppr(i).evaluation) : 0 })),
    ...APPR_MATH.map(i => ({ label: `Math: ${i}`, score: getAppr(i) ? getScore(getAppr(i).evaluation) : 0 }))
  ];

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
    <div class="marianne" style="border-left-color: #6B7280; color: #374151;">
      Académie<br/>de La Réunion
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
  <div class="card" style="background-color: var(--blue-bg); border-color: var(--blue);">
    <div class="grid grid-3">
      <div>
        <div class="value-label">Élève</div>
        <div class="value-text" style="font-size: 16px; font-weight: 700;">${esc(d.eleve?.nom || "")} ${esc(d.eleve?.prenom || "")}</div>
        <div style="margin-top: 4px;">Né(e) le : <b>${esc(d.eleve?.date_naissance || "—")}</b> (${esc(d.eleve?.sexe || "—")})</div>
        <div>Niveau : <b>${esc(d.eleve?.niveau || "")} ${d.eleve?.niveau_classe ? `(${d.eleve.niveau_classe})` : ""}</b></div>
        ${d.eleve?.deja_maintenu ? `<div style="color: var(--red); font-weight: 600; margin-top: 4px;">⚠ Déjà maintenu (${esc(d.eleve?.niveau_maintien || "")})</div>` : ""}
      </div>
      <div>
        <div class="value-label">Établissement</div>
        <div class="value-text"><b>${esc(schoolName || "—")}</b></div>
        <div>Enseignant : <b>${esc(d.etablissement?.enseignant || "—")}</b></div>
        <div>Date de demande : <b>${esc(d.etablissement?.date_demande || "—")}</b></div>
      </div>
      <div>
        <div class="value-label">Responsables légaux</div>
        <div><b>1.</b> ${esc(d.famille?.responsable1_nom || "—")}</div>
        <div class="small">${esc(d.famille?.responsable1_tel || "")} ${esc(d.famille?.responsable1_email || "")}</div>
        ${d.famille?.responsable2_nom ? `
          <div style="margin-top: 4px;"><b>2.</b> ${esc(d.famille?.responsable2_nom)}</div>
          <div class="small">${esc(d.famille?.responsable2_tel || "")} ${esc(d.famille?.responsable2_email || "")}</div>
        ` : ""}
      </div>
    </div>
  </div>
</section>

<section class="section">
  <h2 class="section-title">Motifs & Contexte</h2>

  <div class="card">
    <div class="card-title">Difficultés observées</div>
    <div>${esc(d.difficultes || "—")}</div>
  </div>

  <div class="grid grid-2">
    <div class="card">
      <div class="card-title">Réponses de l'école</div>
      <ul class="list-disc">
        <li><b>APC:</b> ${d.reponses_ecole?.apc?.actif ? "Oui" : "Non"} ${d.reponses_ecole?.apc?.details ? `(${esc(d.reponses_ecole.apc.details)})` : ""}</li>
        <li><b>Différenciation:</b> ${d.reponses_ecole?.differenciation?.actif ? "Oui" : "Non"} ${d.reponses_ecole?.differenciation?.details ? `(${esc(d.reponses_ecole.differenciation.details)})` : ""}</li>
        ${d.reponses_ecole?.autres ? `<li><b>Autres:</b> ${esc(d.reponses_ecole.autres)}</li>` : ""}
      </ul>
    </div>

    <div class="card">
      <div class="card-title">Santé — Dépistage</div>
      <ul class="list-disc">
        <li><b>Problème auditif:</b> ${renderEvalBadge(d.sante?.trouble_auditif || "Non")} ${d.sante?.trouble_auditif_details ? `(${esc(d.sante.trouble_auditif_details)})` : ""}</li>
        <li><b>Problème visuel:</b> ${renderEvalBadge(d.sante?.trouble_visuel || "Non")} ${d.sante?.trouble_visuel_details ? `(${esc(d.sante.trouble_visuel_details)})` : ""}</li>
      </ul>
    </div>
  </div>

  <div class="grid grid-2">
    <div class="card">
      <div class="card-title">Suivis extérieurs</div>
      ${d.suivis_exterieurs && d.suivis_exterieurs.length > 0 ? `
      <ul class="list-disc">
        ${d.suivis_exterieurs.map((s: any) => `
          <li><b>${esc(s.dispositif)}</b>: ${esc(s.professionnel || s.professionnel_libre || "")} ${s.frequence ? `(${esc(s.frequence)})` : ""} ${s.contact ? `[${esc(s.contact)}]` : ""}</li>
        `).join("")}
      </ul>
      ` : "<div class='small text-gray-500'>Aucun suivi extérieur renseigné.</div>"}
    </div>

    <div class="card">
      <div class="card-title">Place des parents</div>
      <div>${esc(d.place_parents || "—")}</div>
    </div>
  </div>
</section>

<section class="section pb">
  <h2 class="section-title">Comportement & Relations</h2>
  <table class="table">
    <thead><tr><th style="width:40%">Item</th><th style="width:20%">Évaluation</th><th>Observations</th></tr></thead>
    <tbody>
      ${COMP_ITEMS.map(i => renderEvalRow(i, getComp(i))).join("")}
      ${REL_ITEMS.map(i => renderRelRow(i, getComp(i))).join("")}
    </tbody>
  </table>
</section>

<section class="section pb">
  <h2 class="section-title">Apprentissages</h2>

  <div class="sub-title">Lecture</div>
  <table class="table">
    <tbody>
       ${APPR_LECTURE.map(i => renderEvalRow(i, getAppr(i))).join("")}
    </tbody>
  </table>

  <div class="grid grid-2" style="margin-top: 12px; margin-bottom: 16px;">
    ${(codeDetails.stade || codeDetails.observation) ? `
    <div class="card" style="margin-bottom: 0;">
      <div class="card-title">Précisions Code</div>
      <div style="margin-bottom: 4px;">Stade de maîtrise : <b>${esc(codeDetails.stade || "—")}</b></div>
      <i class="small text-gray-600">${esc(codeDetails.observation || "")}</i>
    </div>` : "<div></div>"}

    ${lectDetails.fluence_mcl ? `
    <div class="card" style="margin-bottom: 0;">
      <div class="card-title">Fluence</div>
      <div style="font-size: 16px;"><b>${esc(lectDetails.fluence_mcl)}</b> Mots/min</div>
      <div class="small text-gray-500">Date d'évaluation : ${esc(lectDetails.date || "—")}</div>
    </div>` : "<div></div>"}
  </div>

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
  <h2 class="section-title">Synthèse & Besoins</h2>

  ${(compScores.some(s => s.score > 0) || apprScores.some(s => s.score > 0)) ? `
  <div class="card">
    <div class="card-title">Aperçu visuel des évaluations</div>
    <div class="grid grid-2">
      ${renderBarChart("Comportement", compScores)}
      ${renderBarChart("Apprentissages (Extraits)", apprScores)}
    </div>
    <div class="small text-gray-500" style="margin-top: 8px;">
      <span style="display:inline-block; width:8px; height:8px; background:var(--green); border-radius:50%; margin-right:4px;"></span> Très satisfaisant
      <span style="display:inline-block; width:8px; height:8px; background:var(--blue); border-radius:50%; margin-right:4px; margin-left:12px;"></span> Satisfaisant
      <span style="display:inline-block; width:8px; height:8px; background:var(--red); border-radius:50%; margin-right:4px; margin-left:12px;"></span> Problématique
    </div>
  </div>
  ` : ""}

  <div class="card" style="background-color: var(--blue-bg); border-color: var(--blue); margin-bottom: 24px;">
    <div class="card-title" style="color: var(--accent);">Besoins prioritaires identifiés</div>
    <ul class="list-disc" style="font-size: 14px; font-weight: 500;">
      ${besoins[0] ? `<li>${esc(besoins[0])}</li>` : ""}
      ${besoins[1] ? `<li>${esc(besoins[1])}</li>` : ""}
      ${(!besoins[0] && !besoins[1]) ? "<li style='color: #6B7280; font-weight: normal; font-style: italic;'>Non renseignés</li>" : ""}
    </ul>
  </div>

  <div class="card">
    <div class="card-title">Remarques complémentaires</div>
    <div style="white-space: pre-wrap;">${esc(d.remarques_besoins || "Aucune remarque complémentaire.")}</div>
  </div>
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
