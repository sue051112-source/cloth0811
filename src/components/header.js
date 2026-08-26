import { ICON_SEARCH, ICON_HEART, ICON_BAG, ICON_USER } from "./icons.js";
import { getCartCount, subscribe } from "../state/store.js";
import { getCurrentUser } from "../state/auth.js";
import { navigate } from "../router/router.js";
import { requireLogin } from "./authModal.js";

export function renderHeader() {
  return `
  <header class="site-header">
    <div class="container">
      <div class="header-left">
        <a href="#/" class="brand-logo">FITROOM</a>
      </div>
      <nav class="header-nav">
        <a href="#/looks" data-nav="looks">LOOKS</a>
        <a href="#/shop" data-nav="shop">SHOP</a>
        <a href="#/shop?sort=newest" data-nav="shop">NEW</a>
        <a href="#/looks" data-nav="looks">BEST</a>
      </nav>
      <div class="header-right">
        <div class="header-search" id="header-search" style="display:none">
          <span style="width:14px;height:14px;display:flex">${ICON_SEARCH}</span>
          <input type="text" id="header-search-input" placeholder="상품 검색" />
        </div>
        <button class="icon-btn" id="btn-search" title="검색">${ICON_SEARCH}</button>
        <button class="icon-btn" id="btn-wish" title="찜">${ICON_HEART}</button>
        <button class="icon-btn" id="btn-cart" title="장바구니">
          ${ICON_BAG}
          <span class="badge" id="cart-badge" style="display:none">0</span>
        </button>
        <button class="icon-btn" id="btn-my" title="마이페이지">${ICON_USER}</button>
      </div>
    </div>
  </header>`;
}

export function mountHeaderEvents() {
  const searchBox = document.getElementById("header-search");
  const searchInput = document.getElementById("header-search-input");

  document.getElementById("btn-search").addEventListener("click", () => {
    const visible = searchBox.style.display !== "none";
    searchBox.style.display = visible ? "none" : "flex";
    if (!visible) searchInput.focus();
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && searchInput.value.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchInput.value.trim())}`);
    }
  });

  document.getElementById("btn-wish").addEventListener("click", () => navigate("/wish"));
  document.getElementById("btn-cart").addEventListener("click", () => navigate("/cart"));
  document.getElementById("btn-my").addEventListener("click", () => {
    requireLogin(() => navigate("/mypage"));
  });

  updateCartBadge();
  subscribe(updateCartBadge);
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count > 99 ? "99+" : String(count);
  badge.style.display = count > 0 ? "flex" : "none";
}
