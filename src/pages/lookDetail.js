import { getLookById, getProductById } from "../data/data.js";
import { formatPrice } from "../components/format.js";
import { addManyToCart, addToCart, isLookSaved, isWished, toggleSavedLook, toggleWish } from "../state/store.js";
import { showToast } from "../components/toast.js";
import { navigate } from "../router/router.js";
import { requireLogin } from "../components/authModal.js";
import { ICON_HEART } from "../components/icons.js";

export function renderLookDetailPage({ params }) {
  const outlet = document.getElementById("page-outlet");
  const look = getLookById(params.id);

  if (!look) {
    outlet.innerHTML = `<div class="empty-state"><p>LOOK을 찾을 수 없습니다.</p></div>`;
    return;
  }

  const products = look.productIds.map((id) => getProductById(id)).filter(Boolean);

  outlet.innerHTML = `
    <div class="view-fade look-detail">
      <div class="look-detail-top">
        <img class="look-detail-img" src="${look.image}" alt="${look.name}" />
        <div class="look-detail-info">
          <div class="look-no">${look.code}</div>
          <h1 class="look-title">${look.name}</h1>
          <div class="look-tag">${look.situation} · ${look.mood}</div>
          <p class="look-desc">${look.description}</p>
          <button class="btn btn-primary" id="add-all-btn">LOOK 전체 담기</button>
          <button class="btn btn-outline" id="save-look-btn">${isLookSaved(look.id) ? "저장 완료" : "LOOK 저장"}</button>
        </div>
      </div>

      <div class="shop-this-look">
        <h2 class="section-title">SHOP THIS LOOK</h2>
        <div class="look-product-grid" id="look-product-grid">
          ${products
            .map(
              (p) => `
            <div class="look-product-card">
              <div class="thumb" style="position:relative">
                <img src="${p.images[0]}" alt="${p.name}" />
                <button class="wish-btn ${isWished(p.id) ? "active" : ""}" data-wish-id="${p.id}">${ICON_HEART}</button>
              </div>
              <div class="info">
                <div class="cat">${p.category}</div>
                <div class="name">${p.name}</div>
                <div class="price">${formatPrice(p.price)}</div>
              </div>
              <button class="add-btn" data-add-id="${p.id}">ADD TO BAG</button>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  document.getElementById("add-all-btn").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    await addManyToCart(products.map((p) => ({ productId: p.id, color: p.colors[0].name, size: p.sizes[0], qty: 1 })));
    btn.disabled = false;
    showToast("LOOK의 모든 상품을 장바구니에 담았습니다.");
  });

  document.getElementById("save-look-btn").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    requireLogin(async () => {
      const active = await toggleSavedLook(look.id);
      btn.textContent = active ? "저장 완료" : "LOOK 저장";
      showToast(active ? "LOOK을 저장했습니다." : "LOOK 저장을 취소했습니다.");
    });
  });

  document.getElementById("look-product-grid").addEventListener("click", async (e) => {
    const wishBtn = e.target.closest("[data-wish-id]");
    if (wishBtn) {
      wishBtn.disabled = true;
      const active = await toggleWish(wishBtn.getAttribute("data-wish-id"));
      wishBtn.disabled = false;
      wishBtn.classList.toggle("active", active);
      showToast(active ? "찜 목록에 추가했습니다." : "찜 목록에서 제거했습니다.");
      return;
    }
    const addBtn = e.target.closest("[data-add-id]");
    if (addBtn) {
      const product = getProductById(addBtn.getAttribute("data-add-id"));
      addBtn.disabled = true;
      await addToCart({ productId: product.id, color: product.colors[0].name, size: product.sizes[0], qty: 1 });
      addBtn.disabled = false;
      showToast("장바구니에 상품을 추가했어.");
      return;
    }
    const img = e.target.closest(".look-product-card img");
    if (img) {
      const card = img.closest(".look-product-card");
      const addId = card.querySelector("[data-add-id]").getAttribute("data-add-id");
      navigate(`/product/${addId}`);
    }
  });
}
