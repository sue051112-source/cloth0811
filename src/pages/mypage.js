import { getCurrentUser, logout } from "../state/auth.js";
import { getOrders, getSavedLooks, getWishList } from "../state/store.js";
import { getLookById, getProductById } from "../data/data.js";
import { renderLookCard, initLookCards } from "../components/lookCard.js";
import { renderProductCard, initProductCards } from "../components/productCard.js";
import { formatPrice } from "../components/format.js";
import { navigate } from "../router/router.js";
import { openLoginModal } from "../components/authModal.js";

const MENU = [
  { key: "profile", label: "PROFILE" },
  { key: "orders", label: "ORDERS" },
  { key: "wish", label: "WISH LIST" },
  { key: "looks", label: "SAVED LOOKS" },
];

export function renderMyPage({ query }) {
  const outlet = document.getElementById("page-outlet");
  const user = getCurrentUser();

  if (!user) {
    outlet.innerHTML = `
      <div class="empty-state">
        <p>로그인이 필요한 페이지입니다.</p>
        <button class="btn btn-primary" id="mypage-login-btn">LOGIN</button>
      </div>
    `;
    document.getElementById("mypage-login-btn").addEventListener("click", () => {
      openLoginModal(() => renderMyPage({ query }));
    });
    return;
  }

  const activeTab = query.tab || "profile";

  outlet.innerHTML = `
    <div class="view-fade mypage">
      <h1 class="mypage-hello">HELLO, ${user.name}</h1>
      <div class="mypage-layout">
        <aside class="mypage-sidebar">
          ${MENU.map(
            (m) => `<div class="menu-item ${activeTab === m.key ? "active" : ""}" data-tab="${m.key}">${m.label}</div>`
          ).join("")}
          <div class="menu-item" id="logout-btn">LOGOUT</div>
        </aside>
        <div class="mypage-content" id="mypage-content"></div>
      </div>
    </div>
  `;

  document.querySelectorAll(".mypage-sidebar .menu-item[data-tab]").forEach((el) => {
    el.addEventListener("click", () => navigate(`/mypage?tab=${el.getAttribute("data-tab")}`));
  });
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await logout();
    navigate("/");
  });

  renderContent(activeTab);
}

function renderContent(tab) {
  const content = document.getElementById("mypage-content");

  if (tab === "orders") {
    const orders = getOrders();
    content.innerHTML = orders.length
      ? orders
          .map(
            (o) => `
        <div class="order-row">
          <div class="top-row"><span>주문번호 ${o.id}</span><span>${new Date(o.date).toLocaleDateString("ko-KR")}</span></div>
          ${o.items
            .map((item) => {
              const product = getProductById(item.productId);
              return `<div class="product-line">${product ? product.name : "상품"} (${item.color} · ${item.size}) × ${item.qty}</div>`;
            })
            .join("")}
          <div class="bottom-row"><span class="order-status">${o.status}</span><span>${formatPrice(o.total)}</span></div>
        </div>
      `
          )
          .join("")
      : `<div class="empty-state"><p>주문 내역이 없습니다.</p></div>`;
    return;
  }

  if (tab === "wish") {
    const products = getWishList()
      .map((id) => getProductById(id))
      .filter(Boolean);
    content.innerHTML = products.length
      ? `<div class="wish-grid" id="mypage-wish-grid">${products.map((p) => renderProductCard(p)).join("")}</div>`
      : `<div class="empty-state"><p>찜한 상품이 없습니다.</p></div>`;
    const grid = document.getElementById("mypage-wish-grid");
    if (grid) initProductCards(grid, { onWishChange: () => renderContent("wish") });
    return;
  }

  if (tab === "looks") {
    const saved = getSavedLooks();
    const looks = saved.map((s) => getLookById(s.lookId)).filter(Boolean);
    content.innerHTML = looks.length
      ? `<div class="saved-look-grid" id="mypage-look-grid">${looks.map((l) => renderLookCard(l)).join("")}</div>`
      : `<div class="empty-state"><p>저장한 LOOK이 없습니다.</p></div>`;
    const grid = document.getElementById("mypage-look-grid");
    if (grid) initLookCards(grid);
    return;
  }

  const user = getCurrentUser();
  content.innerHTML = `
    <div class="profile-box">
      <div class="field"><div class="label">NAME</div><div>${user.name}</div></div>
      <div class="field"><div class="label">EMAIL</div><div>${user.email}</div></div>
    </div>
  `;
}
