import { getProductById } from "../data/data.js";
import { formatPrice } from "../components/format.js";
import { addToCart, isWished, toggleWish } from "../state/store.js";
import { showToast } from "../components/toast.js";

export function renderProductDetailPage({ params }) {
  const outlet = document.getElementById("page-outlet");
  const product = getProductById(params.id);

  if (!product) {
    outlet.innerHTML = `<div class="empty-state"><p>상품을 찾을 수 없습니다.</p></div>`;
    return;
  }

  const state = {
    color: product.colors[0].name,
    size: product.sizes[0],
    qty: 1,
  };

  function render() {
    outlet.innerHTML = `
      <div class="view-fade product-detail">
        <div class="product-detail-top">
          <div class="product-images">
            ${product.images.map((src) => `<img src="${src}" alt="${product.name}" />`).join("")}
          </div>
          <div class="product-info">
            <div class="cat">${product.category}</div>
            <h1 class="name">${product.name}</h1>
            <div class="price">${formatPrice(product.price)}</div>
            <p class="desc">${product.description}</p>

            <div class="option-block">
              <div class="option-title">COLOR</div>
              <div class="color-list" id="color-list">
                ${product.colors
                  .map(
                    (c) => `
                  <button class="color-dot ${c.name === state.color ? "selected" : ""}" data-color="${c.name}" title="${c.name}">
                    <span class="fill" style="background:${c.hex}"></span>
                  </button>
                `
                  )
                  .join("")}
              </div>
            </div>

            <div class="option-block">
              <div class="option-title">SIZE</div>
              <div class="size-list" id="size-list">
                ${product.sizes
                  .map(
                    (s) => `<button class="size-btn ${s === state.size ? "selected" : ""}" data-size="${s}">${s}</button>`
                  )
                  .join("")}
              </div>
            </div>

            <div class="option-block">
              <div class="option-title">QUANTITY</div>
              <div class="qty-block">
                <button class="qty-btn" id="qty-minus">-</button>
                <div class="qty-value" id="qty-value">${state.qty}</div>
                <button class="qty-btn" id="qty-plus">+</button>
              </div>
              <div class="product-total" id="product-total">${formatPrice(product.price * state.qty)}</div>
            </div>

            <div class="product-actions">
              <button class="btn btn-primary" id="add-to-bag-btn">ADD TO BAG</button>
              <button class="btn btn-outline" id="wish-btn">
                ${isWished(product.id) ? "찜 완료" : "WISH"}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("color-list").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-color]");
      if (!btn) return;
      state.color = btn.getAttribute("data-color");
      document.querySelectorAll("#color-list .color-dot").forEach((el) => el.classList.remove("selected"));
      btn.classList.add("selected");
    });

    document.getElementById("size-list").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-size]");
      if (!btn) return;
      state.size = btn.getAttribute("data-size");
      document.querySelectorAll("#size-list .size-btn").forEach((el) => el.classList.remove("selected"));
      btn.classList.add("selected");
    });

    document.getElementById("qty-minus").addEventListener("click", () => {
      state.qty = Math.max(1, state.qty - 1);
      updateQtyUI();
    });
    document.getElementById("qty-plus").addEventListener("click", () => {
      state.qty += 1;
      updateQtyUI();
    });

    document.getElementById("add-to-bag-btn").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      await addToCart({ productId: product.id, color: state.color, size: state.size, qty: state.qty });
      btn.disabled = false;
      showToast("장바구니에 상품을 추가했어.");
    });

    document.getElementById("wish-btn").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      const active = await toggleWish(product.id);
      btn.disabled = false;
      btn.textContent = active ? "찜 완료" : "WISH";
      showToast(active ? "찜 목록에 추가했습니다." : "찜 목록에서 제거했습니다.");
    });
  }

  function updateQtyUI() {
    document.getElementById("qty-value").textContent = state.qty;
    document.getElementById("product-total").textContent = formatPrice(product.price * state.qty);
  }

  render();
}
