import { getProductById } from "../data/data.js";
import { formatPrice } from "../components/format.js";
import { getCart, updateCartQty, removeFromCart, createOrder } from "../state/store.js";
import { navigate } from "../router/router.js";
import { requireLogin } from "../components/authModal.js";

const FREE_SHIPPING_THRESHOLD = 70000;
const SHIPPING_FEE = 3000;

export function renderCartPage() {
  const outlet = document.getElementById("page-outlet");

  function calcSubtotal(items) {
    return items.reduce((sum, item) => {
      const product = getProductById(item.productId);
      return sum + (product ? product.price * item.qty : 0);
    }, 0);
  }

  function render() {
    const cart = getCart();
    const subtotal = calcSubtotal(cart);
    const shipping = cart.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    outlet.innerHTML = `
      <div class="view-fade cart-page">
        <h1 class="page-title" style="margin-bottom:40px">YOUR BAG</h1>
        <div class="cart-layout">
          <div class="cart-list" id="cart-list">
            ${
              cart.length
                ? cart
                    .map((item) => {
                      const product = getProductById(item.productId);
                      if (!product) return "";
                      return `
                    <div class="cart-item" data-cart-id="${item.cartId}">
                      <img src="${product.images[0]}" alt="${product.name}" />
                      <div class="cart-item-info">
                        <button class="cart-remove" data-remove="${item.cartId}">삭제</button>
                        <div class="name">${product.name}</div>
                        <div class="opt">${item.color} · ${item.size}</div>
                        <div class="price">${formatPrice(product.price)}</div>
                        <div class="qty-block">
                          <button class="qty-btn" data-minus="${item.cartId}">-</button>
                          <div class="qty-value">${item.qty}</div>
                          <button class="qty-btn" data-plus="${item.cartId}">+</button>
                        </div>
                      </div>
                    </div>
                  `;
                    })
                    .join("")
                : `<div class="cart-empty">장바구니가 비어 있습니다.</div>`
            }
          </div>
          <div class="order-summary">
            <div class="summary-row"><span>상품 금액</span><span>${formatPrice(subtotal)}</span></div>
            <div class="summary-row"><span>배송비</span><span>${shipping === 0 ? "무료" : formatPrice(shipping)}</span></div>
            <div class="summary-row total"><span>TOTAL</span><span>${formatPrice(total)}</span></div>
            <button class="btn btn-primary checkout-btn" id="checkout-btn" ${cart.length ? "" : "disabled"}>CHECKOUT</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("cart-list").addEventListener("click", async (e) => {
      const minusBtn = e.target.closest("[data-minus]");
      const plusBtn = e.target.closest("[data-plus]");
      const removeBtn = e.target.closest("[data-remove]");
      if (minusBtn) {
        const item = cart.find((i) => i.cartId === minusBtn.getAttribute("data-minus"));
        await updateCartQty(item.cartId, item.qty - 1);
        render();
      } else if (plusBtn) {
        const item = cart.find((i) => i.cartId === plusBtn.getAttribute("data-plus"));
        await updateCartQty(item.cartId, item.qty + 1);
        render();
      } else if (removeBtn) {
        await removeFromCart(removeBtn.getAttribute("data-remove"));
        render();
      }
    });

    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        requireLogin(async () => {
          checkoutBtn.disabled = true;
          const items = cart.map((item) => {
            const product = getProductById(item.productId);
            return {
              productId: item.productId,
              color: item.color,
              size: item.size,
              qty: item.qty,
              price: product.price,
            };
          });
          const order = await createOrder({ items, total });
          navigate(`/order-complete/${order.id}`);
        });
      });
    }
  }

  render();
}
