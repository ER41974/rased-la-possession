export const norm = (s: any) => (s ?? "").toString().trim();

export const isDateISO = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(norm(s)) && !Number.isNaN(new Date(s).getTime());

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm(s));

// France (métropole) + Réunion (0262/0692 et +262 262 / +262 692)
export const isPhoneFRRE = (s: string) => {
  const x = norm(s).replace(/[ .-]/g, "");
  const fr = /^(?:\+33|0)[1-9]\d{8}$/.test(x);
  const re = /^(?:0(?:262|692)\d{6}|\+262(?:262|692)\d{6})$/.test(x);
  return fr || re;
};

export const esc = (s: any) =>
  (s ?? "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

export function setByPath(obj: any, path: string, value: any) {
  const parts = path.split(".");
  const last = parts.pop()!;
  let cur = obj;
  for (const p of parts) {
    if (!(p in cur) || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[last] = value;
}

export async function toDataURL(url: string): Promise<string> {
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

export function asJSONBlob(obj: unknown) {
  const json = JSON.stringify(obj, null, 2);
  return { json, blob: new Blob([json], { type: "application/json" }) };
}

export async function exportJSON(
  data: any,
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
