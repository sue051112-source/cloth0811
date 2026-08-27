import { SITUATIONS, MOODS, PRODUCTS, LOOKS, situationImage, heroImage } from "../data/data.js";
import { renderProductCard, initProductCards } from "../components/productCard.js";
import { renderLookCard, initLookCards } from "../components/lookCard.js";
import { navigate } from "../router/router.js";

const SITUATION_IMAGES = {
  DAILY: situationImage("DAILY"),
  CAFE: situationImage("CAFE"),
  DATE: situationImage("DATE"),
  CAMPUS: situationImage("CAMPUS"),
  STREET: situationImage("STREET"),
  TRAVEL: situationImage("TRAVEL"),
};

export function renderHomePage() {
  const outlet = document.getElementById("page-outlet");
  const newArrivals = PRODUCTS.slice(0, 8);
  const bestLooks = LOOKS.slice(0, 3);

  outlet.innerHTML = `
    <div class="view-fade">
      <section class="hero">
        <img class="hero-image" src="${heroImage()}" alt="FITROOM hero look" />
        <div class="hero-spine">FITROOM EDIT 01</div>
        <div class="hero-text-card">
          <div class="hero-eyebrow">오늘의 무드를 골라보세요</div>
          <h1 class="hero-title">WHAT ARE YOU<br />WEARING TODAY?</h1>
          <p class="hero-desc">오늘의 상황과 무드에 맞는<br />당신만의 LOOK을 찾아보세요.</p>
          <button class="btn btn-primary hero-btn" id="hero-find-btn">FIND MY LOOK</button>
        </div>
        <div class="hero-tag">LOOK 01</div>
      </section>

      <section class="situation-section">
        <div class="section-head">
          <h2 class="section-title-lg">WHAT'S YOUR PLAN?</h2>
          <p class="section-desc">오늘의 상황을 선택하면 어울리는 LOOK을 찾아드립니다.</p>
        </div>
        <div class="situation-grid" id="situation-grid">
          ${SITUATIONS.map(
            (s) => `
            <div class="situation-card" data-situation="${s.code}">
              <img src="${SITUATION_IMAGES[s.code]}" alt="${s.label}" />
              <div class="label">${s.label}</div>
            </div>
          `
          ).join("")}
        </div>
      </section>

      <section class="mood-section">
        <h2 class="section-title-lg">CHOOSE YOUR MOOD</h2>
        <div class="mood-list" id="mood-list">
          ${MOODS.map((m) => `<button class="mood-btn" data-mood="${m.code}">${m.label}</button>`).join("")}
        </div>
      </section>

      <section class="new-arrivals">
        <div class="container">
          <div class="section-row-head">
            <h2 class="section-title">NEW ARRIVALS</h2>
            <a href="#/shop?sort=newest" class="view-all">VIEW ALL →</a>
          </div>
          <div class="product-grid-4" id="new-arrivals-grid">
            ${newArrivals.map((p) => renderProductCard(p)).join("")}
          </div>
        </div>
      </section>

      <section class="best-look">
        <h2 class="section-title-lg">BEST LOOKS</h2>
        <p class="section-desc">지금 가장 많이 저장된 스타일.</p>
        <div class="best-asym" id="best-look-grid">
          <div class="best-asym-feature">${renderLookCard(bestLooks[0])}</div>
          <div class="best-asym-side">
            ${bestLooks
              .slice(1, 3)
              .map((l) => renderLookCard(l))
              .join("")}
          </div>
        </div>
      </section>

      <section class="editorial-banner">
        <div class="editorial-inner">
          <div class="editorial-eyebrow">FITROOM EDIT</div>
          <h2 class="editorial-title">YOUR MOOD.<br />YOUR LOOK.<br />YOUR FIT.</h2>
          <button class="btn btn-primary editorial-btn" id="editorial-btn">EXPLORE LOOKS</button>
        </div>
      </section>
    </div>
  `;

  document.getElementById("hero-find-btn").addEventListener("click", () => navigate("/looks"));
  document.getElementById("editorial-btn").addEventListener("click", () => navigate("/looks"));

  document.getElementById("situation-grid").addEventListener("click", (e) => {
    const card = e.target.closest(".situation-card");
    if (card) navigate(`/looks?situation=${card.getAttribute("data-situation")}`);
  });

  document.getElementById("mood-list").addEventListener("click", (e) => {
    const btn = e.target.closest(".mood-btn");
    if (btn) navigate(`/looks?mood=${btn.getAttribute("data-mood")}`);
  });

  initProductCards(document.getElementById("new-arrivals-grid"));
  initLookCards(document.getElementById("best-look-grid"));
}
