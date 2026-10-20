// Estrela solitária em pixel art, desenhada a partir de um mapa de caracteres.
const ESTRELA = [
  "......#......",
  ".....###.....",
  ".....###.....",
  "#############",
  ".###########.",
  "..#########..",
  "...#######...",
  "...#######...",
  "..####.####..",
  "..###...###..",
  ".##.......##.",
];

function desenharEstrela(el) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${ESTRELA[0].length} ${ESTRELA.length}`);
  svg.setAttribute("class", "estrela");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("shape-rendering", "crispEdges");
  ESTRELA.forEach((linha, y) => {
    [...linha].forEach((c, x) => {
      if (c !== "#") return;
      const r = document.createElementNS(ns, "rect");
      r.setAttribute("x", x);
      r.setAttribute("y", y);
      r.setAttribute("width", 1);
      r.setAttribute("height", 1);
      r.setAttribute("fill", "#f5f5f5");
      svg.appendChild(r);
    });
  });
  el.replaceWith(svg);
}

document.querySelectorAll("[data-estrela]").forEach(desenharEstrela);

const TIPOS_ACOMP = [
  { id: "acompanhante", nome: "Acompanhante" },
  { id: "outros", nome: "Outros" },
];

const BEBIDAS = [
  { id: "cerveja", nome: "Cerveja" },
  { id: "drinks", nome: "Drinks" },
  { id: "refri", nome: "Refri" },
  { id: "suco", nome: "Suco" },
  { id: "agua", nome: "Água" },
];

async function supabase(caminho, corpo, extraHeaders = {}) {
  const { SUPABASE_URL, SUPABASE_KEY } = window.CONFIG || {};
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("O site ainda não foi ligado ao banco de dados.");
  }
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/${caminho}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify(corpo),
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`Falha ao falar com o servidor (${resp.status}). ${txt.slice(0, 120)}`);
  }
  return resp.status === 204 || resp.status === 201 ? null : resp.json();
}
