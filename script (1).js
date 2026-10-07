/* ===== DATA =====
   Bahan sumber (dropdown) -> bahan pengganti BARU. Pengganti tidak ada di `data`,
   jadi relasi tidak pernah berputar (A->B lalu B->A). Struktur = DAG di atas rooted tree. */
const REFS = {
  1: { t: "Aydar, Tutuncu & Özçelik (2020). Plant-based milk substitutes. Journal of Functional Foods 70, 103975.", u: "https://doi.org/10.1016/j.jff.2020.103975" },
  2: { t: "Karoui & Bouaicha (2024). A review on nutritional quality of animal and plant-based milk alternatives. Frontiers in Nutrition.", u: "https://doi.org/10.3389/fnut.2024.1378556" },
  3: { t: "Nutritional assessment of plant-based beverages in comparison to bovine milk (2022). Frontiers in Nutrition.", u: "https://doi.org/10.3389/fnut.2022.957486" },
  4: { t: "Physical properties and microstructure of butter cake added with Persea americana puree (2016). Sains Malaysiana 45(7).", u: "https://www.ukm.my/jsm/english_journals/vol45num7_2016/vol45num7_2016pg1105-1111.html" },
  5: { t: "Plant-based cheese analogs: structure, texture, and functionality (2025). Critical Reviews in Food Science and Nutrition.", u: "https://research.ucc.ie/en/publications/plant-based-cheese-analogs-structure-texture-and-functionality/" },
  6: { t: "Craig, Mangels & Brothers (2022). Nutritional profiles of non-dairy plant-based cheese alternatives. Nutrients.", u: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8952881/" },
  7: { t: "Avocado as a baking fat substitute in cakes. Disertasi, Makerere University.", u: "https://dissertations.mak.ac.ug/handle/20.500.12281/21880" },
  8: { t: "Marangoni dkk. (2025). Plant protein–fat interactions in plant-based cheese analogs. Physics of Fluids. (lengkapi sitasi dari halaman jurnal)" },
  10: { t: "Plant-based cheeses: a systematic review of sensory evaluation studies and strategies to increase consumer acceptance (2021). Foods 10(4), 725.", u: "https://doi.org/10.3390/foods10040725" },
  9: { t: "Studi saus apel, pasta kacang hijau, dan puree pepaya sebagai pengganti lemak (judul ada pada daftar pustaka Sains Malaysiana 2016). Cari artikel aslinya sebelum dikutip." },
};

const GROUPS = {
  "Susu Cair": ["Susu Hewani", "Susu Nabati"],
  "Lemak Padat": ["Lemak Hewani", "Lemak Nabati"],
  "Keju": ["Keju Hewani", "Keju Nabati"],
};
const S = (f, n, t, r) => ({ function: f, nutrition: n, taste: t, ref: r });

const data = {
  "Susu Sapi":   { group: "Susu Cair", category: "Susu Hewani", subs: { "Susu Kacang Polong": S(82,80,78,[2,3]), "Susu Beras": S(76,60,80,[1,3]) } },
  "Susu Kambing":{ group: "Susu Cair", category: "Susu Hewani", subs: { "Susu Mete": S(80,66,86,[1]), "Susu Kelapa": S(74,55,82,[1,3]) } },
  "Susu Kedelai":{ group: "Susu Cair", category: "Susu Nabati", subs: { "Susu Hemp": S(78,74,72,[1]), "Susu Kacang Tanah": S(80,72,80,[1]) } },
  "Susu Oat":    { group: "Susu Cair", category: "Susu Nabati", subs: { "Susu Hazelnut": S(80,70,85,[1]), "Susu Wijen": S(76,72,74,[1]) } },
  "Susu Almond": { group: "Susu Cair", category: "Susu Nabati", subs: { "Susu Kenari": S(79,74,80,[1]), "Susu Tiger Nut": S(75,68,82,[1]) } },
  "Mentega":     { group: "Lemak Padat", category: "Lemak Hewani", subs: { "Puree Alpukat": S(78,84,70,[4,7]), "Pasta Kacang Hijau": S(70,78,68,[9]) } },
  "Margarin":    { group: "Lemak Padat", category: "Lemak Nabati", subs: { "Saus Apel": S(72,80,68,[9]), "Puree Pepaya": S(70,78,66,[9]) } },
  "Keju Cheddar":{ group: "Keju", category: "Keju Hewani", subs: { "Keju Mete": S(74,72,84,[6,5]), "Keju Protein Kacang Polong": S(82,70,78,[5,8]) } },
  "Keju Vegan":  { group: "Keju", category: "Keju Nabati", subs: { "Keju Tahu Fermentasi": S(70,76,80,[10]), "Keju Santan Kelapa": S(72,62,78,[5,6]) } },
};

/* ===== ELEMEN ===== */
const $ = (id) => document.getElementById(id);
const ingredient = $("ingredient"), priority = $("priority");
let current = { source: "", result: "", ranked: [] };

/* isi dropdown per kelompok */
Object.keys(GROUPS).forEach((g) => {
  const og = document.createElement("optgroup");
  og.label = g;
  Object.keys(data).filter((k) => data[k].group === g).forEach((k) => og.append(new Option(k, k)));
  ingredient.append(og);
});
$("statSrc").textContent = Object.keys(data).length;
$("statSub").textContent = Object.values(data).reduce((n, d) => n + Object.keys(d.subs).length, 0);

/* ===== LOGIKA REKOMENDASI ===== */
const average = (s) => Math.round((s.function + s.nutrition + s.taste) / 3);
const scoreBy = (s) => (priority.value === "overall" ? average(s) : s[priority.value]);

function rank(source) {
  const subs = data[source].subs;
  return Object.keys(subs).sort((a, b) => scoreBy(subs[b]) - scoreBy(subs[a]));
}

const level = (v, texts) => (v >= 80 ? texts[0] : v >= 70 ? texts[1] : texts[2]);
const explain = {
  function: (v) => level(v, ["Cara kerjanya sangat dekat pada panas dan adonan, jadi bisa dipakai dengan sedikit penyesuaian.", "Cukup dekat, tetapi takaran atau cairan resep mungkin perlu disesuaikan.", "Cukup berbeda. Coba dulu pada resep kecil."]),
  nutrition: (v) => level(v, ["Profil gizi dekat dengan bahan asal.", "Gizi cukup dekat, tetapi protein atau kalsium bisa berbeda. Periksa label produk.", "Gizi berbeda cukup jauh dan bisa perlu dilengkapi dari sumber lain."]),
  taste: (v) => level(v, ["Rasa sangat familiar dan mudah diterima.", "Rasa cukup dekat, dengan sedikit perbedaan aroma atau manis.", "Rasa terasa berbeda dan lebih cocok untuk resep dengan bumbu kuat."]),
};
const overallText = (v) => (v >= 85 ? "Kemiripan tinggi." : v >= 75 ? "Kemiripan cukup tinggi." : "Kemiripan sedang, gunakan dengan penyesuaian.");

/* ===== TAMPILKAN HASIL ===== */
function show(source, result) {
  current.source = source; current.result = result;
  const sc = data[source].subs[result];
  $("originalName").textContent = source;
  $("originalCategory").textContent = data[source].category;
  $("substituteName").textContent = result;
  $("substituteCategory").textContent = GROUPS[data[source].group][1];

  ["function", "nutrition", "taste"].forEach((k) => {
    $(k + "Score").textContent = sc[k] + "%";
    $(k + "Bar").style.width = sc[k] + "%";
    $(k + "Text").textContent = explain[k](sc[k]);
  });
  const total = average(sc);
  $("overallScore").textContent = total + "%";
  $("overallText").textContent = overallText(total);

  $("refList").innerHTML = sc.ref.map((n) => {
    const r = REFS[n];
    return "<li>" + (r.u ? `<a href="${r.u}" target="_blank" rel="noopener">${r.t}</a>` : r.t) + "</li>";
  }).join("");

  const alts = $("altRow");
  alts.innerHTML = current.ranked.length > 1 ? "<span class='muted'>Alternatif:</span>" : "";
  if (current.ranked.length > 1) current.ranked.forEach((name) => {
    const b = document.createElement("button");
    b.textContent = name + " " + scoreBy(data[source].subs[name]) + "%";
    if (name === result) b.className = "on";
    b.onclick = () => { show(source, name); if (!$("treeSection").hidden) drawTree(); };
    alts.append(b);
  });
}

function search() {
  const source = ingredient.value;
  if (!source) { alert("Pilih bahan terlebih dahulu."); return; }
  current.ranked = rank(source);
  show(source, current.ranked[0]);
  $("resultSection").hidden = false;
  $("treeSection").hidden = true;
  $("resultSection").scrollIntoView({ behavior: "smooth", block: "start" });
}
$("searchBtn").addEventListener("click", search);
$("treeBtn").addEventListener("click", () => {
  drawTree();
  $("treeSection").hidden = false;
  $("treeSection").scrollIntoView({ behavior: "smooth", block: "start" });
});

/* ===== ROOTED TREE (hanya cabang kelompok terpilih) ===== */
const NS = "http://www.w3.org/2000/svg";
const el = (name, attrs) => { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

function drawTree() {
  const { source, result } = current;
  const g = data[source].group, cats = GROUPS[g];
  const resCat = cats[1];

  /* daun: semua bahan sumber di kelompok ini + semua kandidat pengganti */
  const leaves = [];
  cats.forEach((c) => {
    Object.keys(data).filter((k) => data[k].group === g && data[k].category === c)
      .forEach((k) => leaves.push({ label: k, cat: c, role: k === source ? "source" : "normal" }));
    if (c === resCat) current.ranked.forEach((k) => leaves.push({ label: k, cat: c, role: k === result ? "result" : "alt" }));
  });

  const GAP = 150, W = leaves.length * GAP + 20, Y = { root: 45, grp: 140, cat: 235, leaf: 335 };
  leaves.forEach((l, i) => (l.x = 10 + GAP / 2 + i * GAP));
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;

  const nodes = {};
  cats.forEach((c) => { nodes["c:" + c] = { label: c, x: mean(leaves.filter((l) => l.cat === c).map((l) => l.x)), y: Y.cat, w: 130, parent: "g" }; });
  nodes.g = { label: "Kelompok " + g, x: mean(cats.map((c) => nodes["c:" + c].x)), y: Y.grp, w: 160, parent: "root" };
  nodes.root = { label: "Produk Dairy & Alternatifnya", x: nodes.g.x, y: Y.root, w: 200 };
  leaves.forEach((l) => { nodes["l:" + l.label] = { label: l.label, x: l.x, y: Y.leaf, w: 136, parent: "c:" + l.cat, role: l.role }; });

  /* jalur & LCA */
  const chain = (id) => { const p = []; for (let n = id; n; n = nodes[n].parent) p.unshift(n); return p; };
  const pS = chain("l:" + source), pR = chain("l:" + result);
  let i = 0; while (i < pS.length && pS[i] === pR[i]) i++;
  const lca = pS[i - 1];
  const full = [...pS.slice(i - 1).reverse(), ...pR.slice(i)];
  const active = new Set([...pS, ...pR]);

  $("lcaInfo").innerHTML = `LCA: <b>${nodes[lca].label}</b> · jalur: ${full.map((n) => nodes[n].label).join(" → ")}`;

  const svg = $("treeSvg");
  svg.innerHTML = "";
  svg.setAttribute("viewBox", `0 0 ${W} 400`);
  svg.setAttribute("width", Math.max(W, 560));
  svg.setAttribute("height", 400);

  Object.keys(nodes).forEach((id) => {
    const n = nodes[id]; if (!n.parent) return;
    const p = nodes[n.parent], y1 = p.y + 24, y2 = n.y - 24, m = (y1 + y2) / 2;
    svg.append(el("path", { d: `M${p.x} ${y1} C${p.x} ${m},${n.x} ${m},${n.x} ${y2}`, class: "tree-edge" + (active.has(id) && active.has(n.parent) ? " on" : "") }));
  });

  Object.keys(nodes).forEach((id) => {
    const n = nodes[id];
    let cls = n.role === "source" || n.role === "result" || n.role === "alt" ? n.role : active.has(id) ? "path" : "";
    if (id === lca) cls = "lca";
    const grp = el("g", { class: "tree-node " + cls });
    grp.append(el("rect", { x: n.x - n.w / 2, y: n.y - 24, width: n.w, height: 48, rx: 10 }));
    const words = n.label.split(" "), half = Math.ceil(words.length / 2);
    const lines = n.label.length > 16 ? [words.slice(0, half).join(" "), words.slice(half).join(" ")] : [n.label];
    lines.forEach((t, k) => {
      const tx = el("text", { x: n.x, y: n.y + (k - (lines.length - 1) / 2) * 15 });
      tx.textContent = t; grp.append(tx);
    });
    svg.append(grp);
  });
}

/* ===== NAVIGASI & TEMA ===== */
const navButtons = document.querySelectorAll(".nav-btn"), pages = document.querySelectorAll(".page");
function go(name) {
  navButtons.forEach((b) => b.classList.toggle("active", b.dataset.page === name));
  pages.forEach((p) => p.classList.toggle("active", p.id === name));
  scrollTo({ top: 0 });
}
navButtons.forEach((b) => b.addEventListener("click", () => go(b.dataset.page)));
$("startBtn").addEventListener("click", () => go("search"));
$("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  $("themeToggle").textContent = document.body.classList.contains("dark-theme") ? "☀️" : "🌙";
});
priority.addEventListener("change", () => { if (ingredient.value && !$("resultSection").hidden) search(); });
