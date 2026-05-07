// ====================================================
//  STATE
// ====================================================
const state = {
   wp: { criteria: [], alternatives: [] },
   saw: { criteria: [], alternatives: [] },
   smart: { criteria: [], alternatives: [] },
};

// ====================================================
//  NAVIGATION
// ====================================================
function showPanel(id) {
   document
      .querySelectorAll(".panel")
      .forEach((p) => p.classList.remove("active"));
   document
      .querySelectorAll(".nav-btn")
      .forEach((b) => b.classList.remove("active"));
   document.getElementById("panel-" + id).classList.add("active");
   document.getElementById("nav-" + id).classList.add("active");
}

// ====================================================
//  INIT DEFAULT DATA
// ====================================================
function initDefaults() {
   ["wp", "saw", "smart"].forEach((m) => {
      // 3 default criteria
      ["Harga (Cost)", "Kualitas (Benefit)", "Pelayanan (Benefit)"].forEach(
         (name, i) => {
            const types = ["cost", "benefit", "benefit"];
            state[m].criteria.push({
               id: Date.now() + i + m,
               name,
               weight: [5, 4, 3][i],
               type: types[i],
            });
         },
      );
      // 3 default alternatives
      ["Alternatif A", "Alternatif B", "Alternatif C"].forEach((name, i) => {
         const vals = [
            [80, 85, 90],
            [70, 90, 80],
            [60, 75, 70],
         ];
         const obj = { id: Date.now() + 100 + i + m, name };
         state[m].criteria.forEach((c, ci) => {
            obj["c_" + c.id] = vals[i][ci];
         });
         state[m].alternatives.push(obj);
      });
      renderAll(m);
   });
}

// ====================================================
//  RENDER CRITERIA TABLE
// ====================================================
function renderAll(m) {
   renderCriteria(m);
   renderAlternatives(m);
}

function renderCriteria(m) {
   const tbody = document.getElementById(m + "-crit-body");
   tbody.innerHTML = "";
   state[m].criteria.forEach((c, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td class="mono" style="color:var(--text-muted)">${i + 1}</td>
      <td><input type="text" value="${c.name}" onchange="updateCrit('${m}','${c.id}','name',this.value)" style="min-width:160px"></td>
      <td><input type="number" value="${c.weight}" min="1" max="100" onchange="updateCrit('${m}','${c.id}','weight',+this.value)" style="width:70px"></td>
      <td>
        <select onchange="updateCrit('${m}','${c.id}','type',this.value)">
          <option value="benefit" ${c.type === "benefit" ? "selected" : ""}>Benefit</option>
          <option value="cost"    ${c.type === "cost" ? "selected" : ""}>Cost</option>
        </select>
      </td>
      <td><button class="btn btn-danger btn-sm" onclick="removeCrit('${m}','${c.id}')">✕</button></td>
    `;
      tbody.appendChild(tr);
   });
}

function renderAlternatives(m) {
   const thead = document.getElementById(m + "-alt-header");
   const tbody = document.getElementById(m + "-alt-body");

   // Header
   thead.innerHTML = "<th>No</th><th>Nama Alternatif</th>";
   state[m].criteria.forEach((c) => {
      const th = document.createElement("th");
      th.textContent = c.name.split(" ")[0];
      th.title = c.name;
      thead.appendChild(th);
   });
   const th = document.createElement("th");
   th.textContent = "Aksi";
   thead.appendChild(th);

   // Body
   tbody.innerHTML = "";
   state[m].alternatives.forEach((alt, i) => {
      const tr = document.createElement("tr");
      let cells = `
      <td class="mono" style="color:var(--text-muted)">${i + 1}</td>
      <td><input type="text" value="${alt.name}" onchange="updateAlt('${m}','${alt.id}','name',this.value)" style="min-width:130px"></td>
    `;
      state[m].criteria.forEach((c) => {
         const val = alt["c_" + c.id] ?? 0;
         cells += `<td><input type="number" value="${val}" min="0" onchange="updateAlt('${m}','${alt.id}','c_${c.id}',+this.value)" style="width:75px"></td>`;
      });
      cells += `<td><button class="btn btn-danger btn-sm" onclick="removeAlt('${m}','${alt.id}')">✕</button></td>`;
      tr.innerHTML = cells;
      tbody.appendChild(tr);
   });
}

// ====================================================
//  CRUD
// ====================================================
function addCriteria(m) {
   const c = {
      id: "c" + Date.now(),
      name: "Kriteria " + (state[m].criteria.length + 1),
      weight: 1,
      type: "benefit",
   };
   state[m].criteria.push(c);
   state[m].alternatives.forEach((a) => (a["c_" + c.id] = 0));
   renderAll(m);
}

function removeCrit(m, id) {
   if (state[m].criteria.length <= 1) {
      notify("Minimal 1 kriteria!");
      return;
   }
   state[m].criteria = state[m].criteria.filter((c) => c.id !== id);
   state[m].alternatives.forEach((a) => delete a["c_" + id]);
   renderAll(m);
}

function updateCrit(m, id, key, val) {
   const c = state[m].criteria.find((c) => c.id === id);
   if (c) {
      c[key] = val;
      if (key === "name") renderAlternatives(m);
   }
}

function addAlternative(m) {
   const alt = {
      id: "a" + Date.now(),
      name: "Alternatif " + (state[m].alternatives.length + 1),
   };
   state[m].criteria.forEach((c) => (alt["c_" + c.id] = 0));
   state[m].alternatives.push(alt);
   renderAll(m);
}

function removeAlt(m, id) {
   if (state[m].alternatives.length <= 1) {
      notify("Minimal 1 alternatif!");
      return;
   }
   state[m].alternatives = state[m].alternatives.filter((a) => a.id !== id);
   renderAlternatives(m);
}

function updateAlt(m, id, key, val) {
   const a = state[m].alternatives.find((a) => a.id === id);
   if (a) a[key] = val;
}

function resetMethod(m) {
   state[m].criteria = [];
   state[m].alternatives = [];
   document.getElementById(m + "-result").style.display = "none";
   initSingle(m);
   notify("Data direset");
}

function initSingle(m) {
   ["Harga (Cost)", "Kualitas (Benefit)", "Pelayanan (Benefit)"].forEach(
      (name, i) => {
         const types = ["cost", "benefit", "benefit"];
         state[m].criteria.push({
            id: "di" + Date.now() + i + m,
            name,
            weight: [5, 4, 3][i],
            type: types[i],
         });
      },
   );
   ["Alternatif A", "Alternatif B", "Alternatif C"].forEach((name, i) => {
      const vals = [
         [80, 85, 90],
         [70, 90, 80],
         [60, 75, 70],
      ];
      const obj = { id: "da" + Date.now() + i + m, name };
      state[m].criteria.forEach((c, ci) => (obj["c_" + c.id] = vals[i][ci]));
      state[m].alternatives.push(obj);
   });
   renderAll(m);
}

// ====================================================
//  CALCULATE
// ====================================================
function calculate(m) {
   const crits = state[m].criteria;
   const alts = state[m].alternatives;

   if (crits.length === 0 || alts.length === 0) {
      notify("Tambahkan kriteria dan alternatif!");
      return;
   }

   // Validate
   for (const c of crits) {
      if (!c.weight || c.weight <= 0) {
         notify("Bobot harus > 0!");
         return;
      }
   }

   const totalW = crits.reduce((s, c) => s + +c.weight, 0);
   const normW = crits.map((c) => c.weight / totalW);

   let scores = [];

   if (m === "wp") scores = calcWP(crits, alts, normW);
   if (m === "saw") scores = calcSAW(crits, alts, normW);
   if (m === "smart") scores = calcSMART(crits, alts, normW);

   renderResult(m, crits, alts, normW, scores);
}

// --- WP ---
function calcWP(crits, alts, normW) {
   const S = alts.map((alt) => {
      let s = 1;
      crits.forEach((c, j) => {
         const x = +alt["c_" + c.id] || 0;
         const exp = c.type === "benefit" ? normW[j] : -normW[j];
         s *= Math.pow(x, exp);
      });
      return s;
   });
   const sumS = S.reduce((a, b) => a + b, 0);
   return S.map((s) => s / sumS);
}

// --- SAW ---
function calcSAW(crits, alts, normW) {
   const norm = crits.map((c, j) => {
      const vals = alts.map((a) => +a["c_" + c.id] || 0);
      const best = c.type === "benefit" ? Math.max(...vals) : Math.min(...vals);
      return alts.map((a) => {
         const x = +a["c_" + c.id] || 0;
         if (best === 0) return 0;
         return c.type === "benefit" ? x / best : best / x;
      });
   });
   return alts.map((_, i) => {
      return crits.reduce((sum, c, j) => sum + normW[j] * norm[j][i], 0);
   });
}

// --- SMART ---
function calcSMART(crits, alts, normW) {
   const util = crits.map((c) => {
      const vals = alts.map((a) => +a["c_" + c.id] || 0);
      const min_ = Math.min(...vals);
      const max_ = Math.max(...vals);
      const range = max_ - min_;
      return alts.map((a) => {
         const x = +a["c_" + c.id] || 0;
         if (range === 0) return 100;
         const u = ((x - min_) / range) * 100;
         return c.type === "benefit" ? u : 100 - u;
      });
   });
   return alts.map((_, i) => {
      return crits.reduce((sum, c, j) => sum + normW[j] * util[j][i], 0);
   });
}

// ====================================================
//  RENDER RESULT
// ====================================================
function renderResult(m, crits, alts, normW, scores) {
   const ranked = alts
      .map((a, i) => ({ name: a.name, score: scores[i] }))
      .sort((a, b) => b.score - a.score);

   const colors = {
      wp: "var(--wp-color)",
      saw: "var(--saw-color)",
      smart: "var(--smart-color)",
   };
   const color = colors[m];

   // Normalized weight rows
   const wRows = crits
      .map(
         (c, j) => `
    <tr>
      <td>${c.name}</td>
      <td class="mono">${c.weight}</td>
      <td class="mono">${normW[j].toFixed(4)}</td>
      <td><span style="color:${c.type === "benefit" ? "var(--accent3)" : "var(--saw-color)"}; font-size:0.75rem; font-weight:700;">${c.type.toUpperCase()}</span></td>
    </tr>
  `,
      )
      .join("");

   // Score rows
   const scoreRows = ranked
      .map((r, i) => {
         const badges = [
            "rank-badge-1",
            "rank-badge-2",
            "rank-badge-3",
            "rank-badge-n",
         ];
         const bc = badges[Math.min(i, 3)];
         const cls = i === 0 ? "rank-1" : "";
         return `
      <tr class="${cls}">
        <td><span class="rank-badge ${bc}">${i + 1}</span></td>
        <td style="font-weight:700">${r.name}</td>
        <td class="mono">${r.score.toFixed(6)}</td>
        <td>
          <div style="background:var(--surface2);border-radius:4px;overflow:hidden;height:8px;width:120px;">
            <div style="height:100%;width:${((r.score / ranked[0].score) * 100).toFixed(1)}%;background:${color};border-radius:4px;"></div>
          </div>
        </td>
      </tr>
    `;
      })
      .join("");

   const html = `
    <div class="winner-box">
      <div class="winner-icon">🏆</div>
      <div>
        <div class="winner-label">Alternatif Terbaik (${m.toUpperCase()})</div>
        <div class="winner-name">${ranked[0].name}</div>
        <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text-muted);margin-top:0.2rem">
          Skor: ${ranked[0].score.toFixed(6)}
        </div>
      </div>
    </div>

    <div class="result-card">
      <div class="result-header" style="border-left:3px solid ${color}">
        ⚖️ Normalisasi Bobot Kriteria
      </div>
      <div class="result-body">
        <table class="result-table">
          <thead><tr><th>Kriteria</th><th>Bobot Asli</th><th>Bobot Normal</th><th>Tipe</th></tr></thead>
          <tbody>${wRows}</tbody>
        </table>
      </div>
    </div>

    <div class="result-card">
      <div class="result-header" style="border-left:3px solid ${color}">
        📊 Peringkat Alternatif
      </div>
      <div class="result-body">
        <table class="result-table">
          <thead><tr><th>Rank</th><th>Alternatif</th><th>Skor Akhir</th><th>Proporsi</th></tr></thead>
          <tbody>${scoreRows}</tbody>
        </table>
      </div>
    </div>
  `;

   const el = document.getElementById(m + "-result");
   el.innerHTML = html;
   el.style.display = "block";
   el.scrollIntoView({ behavior: "smooth", block: "nearest" });
   notify("Perhitungan " + m.toUpperCase() + " selesai! ✓");
}

// ====================================================
//  NOTIFY
// ====================================================
function notify(msg) {
   const el = document.getElementById("notif");
   el.textContent = msg;
   el.style.display = "block";
   clearTimeout(notify._t);
   notify._t = setTimeout(() => (el.style.display = "none"), 2800);
}

// ====================================================
//  INIT
// ====================================================
initDefaults();
