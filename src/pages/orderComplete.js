import { getOrderById } from "../state/store.js";
import { formatPrice } from "../components/format.js";
import { navigate } from "../router/router.js";
import { ICON_CHECK } from "../components/icons.js";

export function renderOrderCompletePage({ params }) {
  const outlet = document.getElementById("page-outlet");
  const order = getOrderById(params.id);

  if (!order) {
    outlet.innerHTML = `<div class="empty-state"><p>주문 정보를 찾을 수 없습니다.</p></div>`;
    return;
  }

  const dateStr = new Date(order.date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  outlet.innerHTML = `
    <div class="view-fade order-complete">
      <div class="check-icon">${ICON_CHECK}</div>
      <h1>ORDER COMPLETE</h1>
      <p class="desc">주문이 정상적으로 완료됐습니다.</p>
      <div class="order-info-box">
        <div class="row"><span>주문번호</span><span>${order.id}</span></div>
        <div class="row"><span>주문일</span><span>${dateStr}</span></div>
        <div class="row"><span>결제금액</span><span>${formatPrice(order.total)}</span></div>
      </div>
      <div class="order-complete-actions">
        <button class="btn btn-outline" id="continue-shopping-btn">CONTINUE SHOPPING</button>
        <button class="btn btn-primary" id="view-order-btn">VIEW MY ORDER</button>
      </div>
    </div>
  `;

  document.getElementById("continue-shopping-btn").addEventListener("click", () => navigate("/shop"));
  document.getElementById("view-order-btn").addEventListener("click", () => navigate("/mypage?tab=orders"));
}
