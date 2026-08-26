import { SITUATIONS, MOODS, LOOKS } from "../data/data.js";
import { renderLookCard, initLookCards } from "../components/lookCard.js";
import { navigate } from "../router/router.js";

export function renderLooksPage({ query }) {
  const outlet = document.getElementById("page-outlet");
  const activeSituation = query.situation || "ALL";
  const activeMood = query.mood || "ALL";

  function filteredLooks() {
    return LOOKS.filter((l) => {
      const situationOk = activeSituation === "ALL" || l.situation === activeSituation;
      const moodOk = activeMood === "ALL" || l.mood === activeMood;
      return situationOk && moodOk;
    });
  }

  function situationPill(code, label) {
    return `<button class="filter-pill ${activeSituation === code ? "active" : ""}" data-situation="${code}">${label}</button>`;
  }
  function moodPill(code, label) {
    return `<button class="filter-pill ${activeMood === code ? "active" : ""}" data-mood="${code}">${label}</button>`;
  }

  function render() {
    const looks = filteredLooks();
    outlet.innerHTML = `
      <div class="view-fade">
        <div class="page-head">
          <h1 class="page-title">LOOKS</h1>
          <p class="page-desc">상황과 무드에 맞는 완성된 스타일을 찾아보세요.</p>
        </div>
        <div class="looks-filters">
          <div class="filter-row">
            <div>
              <div class="filter-label">SITUATION</div>
              <div class="filter-group" id="situation-filters">
                ${situationPill("ALL", "ALL")}
                ${SITUATIONS.map((s) => situationPill(s.code, s.label)).join("")}
              </div>
            </div>
            <div>
              <div class="filter-label">MOOD</div>
              <div class="filter-group" id="mood-filters">
                ${moodPill("ALL", "ALL")}
                ${MOODS.map((m) => moodPill(m.code, m.label)).join("")}
              </div>
            </div>
          </div>
        </div>
        <div class="looks-grid-wrap">
          ${
            looks.length
              ? `<div class="look-grid-3" id="looks-grid">${looks.map((l) => renderLookCard(l, { showSaveIcon: true })).join("")}</div>`
              : `<div class="empty-state"><p>조건에 맞는 LOOK이 없습니다.</p></div>`
          }
        </div>
      </div>
    `;

    document.getElementById("situation-filters").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-situation]");
      if (!btn) return;
      const code = btn.getAttribute("data-situation");
      navigate(`/looks?situation=${code}&mood=${activeMood}`);
    });
    document.getElementById("mood-filters").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-mood]");
      if (!btn) return;
      const code = btn.getAttribute("data-mood");
      navigate(`/looks?situation=${activeSituation}&mood=${code}`);
    });

    const grid = document.getElementById("looks-grid");
    if (grid) initLookCards(grid);
  }

  render();
}
