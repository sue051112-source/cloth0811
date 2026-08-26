import { CATEGORIES, PRODUCTS } from "../data/data.js";
import { renderProductCard, initProductCards } from "../components/productCard.js";

const ALL_SIZES = ["S", "M", "L", "FREE"];

export function renderShopPage({ query }) {
  const outlet = document.getElementById("page-outlet");
  const ALL_COLORS = [...new Map(PRODUCTS.flatMap((p) => p.colors).map((c) => [c.name, c])).values()];

  const state = {
    category: query.category || "ALL",
    search: query.search || "",
    sort: query.sort === "newest" ? "NEWEST" : "RECOMMENDED",
    sizes: new Set(),
    colors: new Set(),
    priceMin: "",
    priceMax: "",
  };

  function applyFilters() {
    let list = PRODUCTS.filter((p) => {
      const categoryOk = state.category === "ALL" || p.category === state.category;
      const searchOk =
        !state.search ||
        p.name.toLowerCase().includes(state.search.toLowerCase()) ||
        p.category.toLowerCase().includes(state.search.toLowerCase());
      const sizeOk = state.sizes.size === 0 || p.sizes.some((s) => state.sizes.has(s));
      const colorOk = state.colors.size === 0 || p.colors.some((c) => state.colors.has(c.name));
      const min = state.priceMin ? Number(state.priceMin) : null;
      const max = state.priceMax ? Number(state.priceMax) : null;
      const priceOk = (min === null || p.price >= min) && (max === null || p.price <= max);
      return categoryOk && searchOk && sizeOk && colorOk && priceOk;
    });

    if (state.sort === "NEWEST") {
      list = [...list].reverse();
    } else if (state.sort === "LOW PRICE") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (state.sort === "HIGH PRICE") {
      list = [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }

  function renderProductsGrid() {
    const grid = document.getElementById("shop-product-grid");
    const products = applyFilters();
    grid.innerHTML = products.length
      ? products.map((p) => renderProductCard(p)).join("")
      : `<div class="empty-state" style="grid-column:1/-1"><p>조건에 맞는 상품이 없습니다.</p></div>`;
    initProductCards(grid);
    document.getElementById("result-count").textContent = `${products.length}개의 상품`;
  }

  outlet.innerHTML = `
    <div class="view-fade">
      <div class="page-head">
        <h1 class="page-title">SHOP</h1>
        <div class="filter-group" id="category-tabs" style="margin-top:20px">
          <button class="filter-pill ${state.category === "ALL" ? "active" : ""}" data-category="ALL">ALL</button>
          ${CATEGORIES.map(
            (c) => `<button class="filter-pill ${state.category === c.code ? "active" : ""}" data-category="${c.code}">${c.label}</button>`
          ).join("")}
        </div>
      </div>
      <div class="shop-layout">
        <aside class="shop-sidebar">
          <div class="filter-block">
            <div class="filter-title">SIZE</div>
            ${ALL_SIZES.map(
              (s) => `<label><input type="checkbox" data-size="${s}" /> ${s}</label>`
            ).join("")}
          </div>
          <div class="filter-block">
            <div class="filter-title">COLOR</div>
            ${ALL_COLORS.map(
              (c) => `<label><input type="checkbox" data-color="${c.name}" /> ${c.name}</label>`
            ).join("")}
          </div>
          <div class="filter-block">
            <div class="filter-title">PRICE</div>
            <div class="price-inputs">
              <input type="number" id="price-min" placeholder="최소" />
              <span>-</span>
              <input type="number" id="price-max" placeholder="최대" />
            </div>
          </div>
        </aside>
        <div class="shop-main">
          <div class="shop-toolbar">
            <div class="sub-text" id="result-count"></div>
            <select class="sort-select" id="sort-select">
              <option value="RECOMMENDED">RECOMMENDED</option>
              <option value="NEWEST">NEWEST</option>
              <option value="LOW PRICE">LOW PRICE</option>
              <option value="HIGH PRICE">HIGH PRICE</option>
            </select>
          </div>
          <div class="product-grid-3" id="shop-product-grid"></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("sort-select").value = state.sort;

  document.getElementById("category-tabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-category]");
    if (!btn) return;
    state.category = btn.getAttribute("data-category");
    document.querySelectorAll("#category-tabs .filter-pill").forEach((el) => el.classList.remove("active"));
    btn.classList.add("active");
    renderProductsGrid();
  });

  document.querySelectorAll("[data-size]").forEach((el) =>
    el.addEventListener("change", () => {
      el.checked ? state.sizes.add(el.getAttribute("data-size")) : state.sizes.delete(el.getAttribute("data-size"));
      renderProductsGrid();
    })
  );
  document.querySelectorAll("[data-color]").forEach((el) =>
    el.addEventListener("change", () => {
      el.checked ? state.colors.add(el.getAttribute("data-color")) : state.colors.delete(el.getAttribute("data-color"));
      renderProductsGrid();
    })
  );
  document.getElementById("price-min").addEventListener("input", (e) => {
    state.priceMin = e.target.value;
    renderProductsGrid();
  });
  document.getElementById("price-max").addEventListener("input", (e) => {
    state.priceMax = e.target.value;
    renderProductsGrid();
  });
  document.getElementById("sort-select").addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderProductsGrid();
  });

  renderProductsGrid();
}
