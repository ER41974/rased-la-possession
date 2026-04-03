import type { AnyData } from "./types";
import { esc, toDataURL } from "./utils";

const PRINT_CSS = `
@page { size: A4 portrait; margin: 10mm 12mm; }
@media print {
  html, body { height: auto; background: white; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print { display: none !important; }
  .section { break-inside: avoid; margin-bottom: 20px; }
  .pb { page-break-before: always; }
  h1, h2, h3 { break-after: avoid; }
}
:root {
  --accent: #000091;
  --marianne-red: #e1000f;
  --dsfr-alt: #f6f6f6;
  --text-main: #161616;
  --text-muted: #6B7280;
  --border-color: #E5E7EB;
  --green: #10B981;
  --green-bg: #ECFDF5;
  --blue: #3B82F6;
  --blue-bg: #EFF6FF;
  --red: #EF4444;
  --red-bg: #FEF2F2;
  --gray: #9CA3AF;
  --gray-bg: #F3F4F6;
}
body {
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: var(--text-main);
  line-height: 1.4;
  font-size: 12px;
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
.table { width:100%; border-collapse: collapse; margin-top: 6px; }
.table th { background: transparent; text-align: left; font-weight: 600; color: var(--accent); border-bottom: 2px solid var(--accent); padding: 6px 4px; }
.table td { border-bottom: 1px solid var(--border-color); padding: 6px 4px; font-size: 12px; vertical-align: top; }
.section-title {
  color: var(--accent);
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 10px 0;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.sub-title { font-weight: 600; color: #374151; margin-top: 16px; margin-bottom: 8px; font-size: 15px; }
.badge { display:inline-block; padding:4px 8px; border-radius:4px; font-size:12px; font-weight: 600; border:1px solid #E5E7EB; background: #F9FAFB; color: #4B5563; }
.eval-badge {
  display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; white-space: nowrap;
}
.eval-badge::before {
  content: ""; display: block; width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
}
.eval-green { color: #065F46; }
.eval-green::before { background: var(--green); }
.eval-blue { color: #1E40AF; }
.eval-blue::before { background: var(--blue); }
.eval-red { color: #991B1B; }
.eval-red::before { background: var(--red); }
.eval-gray { color: #4B5563; }
.eval-gray::before { background: var(--gray); }

.grid { display:grid; gap:16px; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.grid-3 { grid-template-columns: 1fr 1fr 1fr; }
.small { font-size: 12px; }
.box { border-left: 4px solid var(--accent); padding: 12px; background: var(--dsfr-alt); margin-top: 8px; }
.card { border: 1px solid #E5E7EB; border-radius: 6px; padding: 12px; margin-bottom: 12px; }
.card-title { font-weight: 600; font-size: 13px; color: #4B5563; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
.value-label { font-size: 10px; color: #9CA3AF; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; letter-spacing: 0.02em; }
.value-text { font-size: 13px; font-weight: 600; color: #111827; }
.id-block { border: 1px solid var(--border-color); border-top: 3px solid var(--accent); padding: 12px; border-radius: 4px; background: white; margin-bottom: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.list-disc { padding-left: 20px; margin-top: 8px; margin-bottom: 8px; }
.list-disc li { margin-bottom: 4px; }
.bar-chart { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.bar-chart-label { width: 45%; font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-container { flex-grow: 1; height: 6px; background: #E5E7EB; border-radius: 3px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 3px; }
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
      <td style="width: 30%;"><b>${esc(item)}</b></td>
      <td style="width: 25%;">${renderEvalBadge(entry.evaluation)}</td>
      <td style="color: var(--text-muted); font-style: italic;">${esc(entry.observation || "")}</td>
    </tr>`;
  };

  const renderRelRow = (item: string, entry: any) => {
    if (!entry) return "";
    return `<tr>
      <td style="width: 30%;"><b>${esc(item)}</b></td>
      <td style="width: 25%;">
        <div style="margin-bottom: 4px;">Freq: ${renderEvalBadge(entry.frequence)}</div>
        <div>Qual: ${renderEvalBadge(entry.qualite)}</div>
      </td>
      <td style="color: var(--text-muted); font-style: italic;">${esc(entry.observation || "")}</td>
    </tr>`;
  };

  const renderBarChart = (title: string, items: {label: string, score: number}[]) => {
    const validItems = items.filter(i => i.score > 0);
    if (validItems.length === 0) return "";

    return `
      <div style="margin-bottom: 16px;">
        <div class="sub-title" style="margin-top: 0; color: var(--accent); border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 8px;">${esc(title)}</div>
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
  <div class="id-block">
    <div class="grid grid-3">
      <div style="border-right: 1px solid var(--border-color); padding-right: 12px;">
        <div class="value-label">Élève</div>
        <div class="value-text" style="font-size: 16px; color: var(--accent); margin-bottom: 4px;">${esc(d.eleve?.nom || "")} ${esc(d.eleve?.prenom || "")}</div>
        <div class="small">Né(e) le : <b>${esc(d.eleve?.date_naissance || "—")}</b> (${esc(d.eleve?.sexe || "—")})</div>
        <div class="small">Niveau : <b>${esc(d.eleve?.niveau || "")} ${d.eleve?.niveau_classe ? `(${d.eleve.niveau_classe})` : ""}</b></div>
        ${d.eleve?.deja_maintenu ? `<div style="color: var(--red); font-weight: 600; margin-top: 4px; font-size: 11px;">⚠ Déjà maintenu (${esc(d.eleve?.niveau_maintien || "")})</div>` : ""}
      </div>
      <div style="border-right: 1px solid var(--border-color); padding-left: 12px; padding-right: 12px;">
        <div class="value-label">Établissement</div>
        <div class="value-text" style="margin-bottom: 4px;">${esc(schoolName || "—")}</div>
        <div class="small">Enseignant : <b>${esc(d.etablissement?.enseignant || "—")}</b></div>
        <div class="small">Demande du : <b>${esc(d.etablissement?.date_demande || "—")}</b></div>
      </div>
      <div style="padding-left: 12px;">
        <div class="value-label">Responsables légaux</div>
        <div class="small"><b>1.</b> ${esc(d.famille?.responsable1_nom || "—")}</div>
        <div class="small" style="color: var(--text-muted); margin-bottom: 4px;">${esc(d.famille?.responsable1_tel || "")} ${esc(d.famille?.responsable1_email || "")}</div>
        ${d.famille?.responsable2_nom ? `
          <div class="small"><b>2.</b> ${esc(d.famille?.responsable2_nom)}</div>
          <div class="small" style="color: var(--text-muted);">${esc(d.famille?.responsable2_tel || "")} ${esc(d.famille?.responsable2_email || "")}</div>
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
    <thead><tr><th>Item</th><th>Évaluation</th><th>Observations</th></tr></thead>
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
    <div class="card" style="margin-bottom: 0; background: var(--blue-bg); border-color: #BFDBFE;">
      <div class="card-title" style="color: var(--accent);">Précisions Code</div>
      <div style="margin-bottom: 4px; font-weight: 500;">Stade de maîtrise : <span style="color: var(--accent);">${esc(codeDetails.stade || "—")}</span></div>
      <i class="small text-gray-600">${esc(codeDetails.observation || "")}</i>
    </div>` : "<div></div>"}

    ${lectDetails.fluence_mcl ? `
    <div class="card" style="margin-bottom: 0; background: var(--blue-bg); border-color: #BFDBFE;">
      <div class="card-title" style="color: var(--accent);">Fluence</div>
      <div style="font-size: 16px;"><b>${esc(lectDetails.fluence_mcl)}</b> <span class="small">Mots/min</span></div>
      <div class="small" style="color: var(--text-muted); margin-top: 4px;">Date d'évaluation : ${esc(lectDetails.date || "—")}</div>
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
    <div class="card-title" style="margin-bottom: 12px;">Aperçu visuel des évaluations</div>
    <div class="grid grid-2" style="gap: 24px;">
      ${renderBarChart("Comportement", compScores)}
      ${renderBarChart("Apprentissages (Extraits)", apprScores)}
    </div>
    <div class="small" style="color: var(--text-muted); margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 8px; display: flex; justify-content: center; gap: 16px;">
      <div style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:6px; height:6px; background:var(--green); border-radius:50%;"></span> Très satisfaisant</div>
      <div style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:6px; height:6px; background:var(--blue); border-radius:50%;"></span> Satisfaisant</div>
      <div style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:6px; height:6px; background:var(--red); border-radius:50%;"></span> Problématique</div>
    </div>
  </div>
  ` : ""}

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
    <div class="card" style="margin-bottom: 0; background: var(--blue-bg); border: 1px solid var(--blue); border-left: 4px solid var(--accent);">
      <div class="card-title" style="color: var(--accent); display: flex; items-center; gap: 6px;">
        Besoins prioritaires identifiés
      </div>
      <ul style="padding-left: 16px; margin-top: 8px; margin-bottom: 0; font-size: 13px; font-weight: 600; line-height: 1.5; color: var(--accent);">
        ${besoins[0] ? `<li style="margin-bottom: 6px;">${esc(besoins[0])}</li>` : ""}
        ${besoins[1] ? `<li>${esc(besoins[1])}</li>` : ""}
        ${(!besoins[0] && !besoins[1]) ? "<li style='color: var(--text-muted); font-weight: normal; font-style: italic; list-style-type: none; padding-left: 0; margin-left: -16px;'>Non renseignés</li>" : ""}
      </ul>
    </div>

    <div class="card" style="margin-bottom: 0;">
      <div class="card-title">Remarques complémentaires</div>
      <div style="white-space: pre-wrap; font-size: 12px; color: var(--text-main); font-style: italic;">${esc(d.remarques_besoins || "Aucune remarque complémentaire.")}</div>
    </div>
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
