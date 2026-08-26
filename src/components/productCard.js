import { getProductById } from "../data/data.js";
import { formatPrice } from "./format.js";
import { isWished, toggleWish } from "../state/store.js";
import { navigate } from "../router/router.js";
import { ICON_HEART } from "./icons.js";
import { showToast } from "./toast.js";

export function renderProductCard(product) {
  const wished = isWished(product.id);
  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="thumb">
        <img src="${product.images[0]}" alt="${product.name}" />
        <button class="wish-btn ${wished ? "active" : ""}" data-wish-id="${product.id}">${ICON_HEART}</button>
      </div>
      <div class="info">
        <div class="cat">${product.category}</div>
        <div class="name">${product.name}</div>
        <div class="price">${formatPrice(product.price)}</div>
      </div>
    </div>
  `;
}

// containerEl 내부의 .product-card 들에 클릭/찜 이벤트를 위임 방식으로 연결합니다.
export function initProductCards(containerEl, { onWishChange } = {}) {
  containerEl.addEventListener("click", async (e) => {
    const wishBtn = e.target.closest(".wish-btn");
    if (wishBtn) {
      e.stopPropagation();
      const id = wishBtn.getAttribute("data-wish-id");
      wishBtn.disabled = true;
      const active = await toggleWish(id);
      wishBtn.disabled = false;
      wishBtn.classList.toggle("active", active);
      showToast(active ? "찜 목록에 추가했습니다." : "찜 목록에서 제거했습니다.");
      onWishChange && onWishChange(active);
      return;
    }
    const card = e.target.closest(".product-card");
    if (card) {
      const product = getProductById(card.getAttribute("data-product-id"));
      if (product) navigate(`/product/${product.id}`);
    }
  });
}
