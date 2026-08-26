import { getProductById } from "../data/data.js";
import { getWishList } from "../state/store.js";
import { renderProductCard, initProductCards } from "../components/productCard.js";
import { navigate } from "../router/router.js";

export function renderWishPage() {
  const outlet = document.getElementById("page-outlet");
  const products = getWishList()
    .map((id) => getProductById(id))
    .filter(Boolean);

  outlet.innerHTML = `
    <div class="view-fade wish-page">
      <div class="page-head" style="padding-left:0;padding-right:0">
        <h1 class="page-title">WISH LIST</h1>
      </div>
      ${
        products.length
          ? `<div class="wish-grid" id="wish-grid">${products.map((p) => renderProductCard(p)).join("")}</div>`
          : `
        <div class="empty-state">
          <p>아직 저장한 상품이 없습니다.</p>
          <button class="btn btn-primary" id="shop-now-btn">SHOP NOW</button>
        </div>
      `
      }
    </div>
  `;

  const grid = document.getElementById("wish-grid");
  if (grid) {
    initProductCards(grid, { onWishChange: () => renderWishPage() });
  }

  const shopNowBtn = document.getElementById("shop-now-btn");
  if (shopNowBtn) shopNowBtn.addEventListener("click", () => navigate("/shop"));
}
