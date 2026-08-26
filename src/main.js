import "./style.css";
import { renderHeader, mountHeaderEvents } from "./components/header.js";
import { renderFooter } from "./components/footer.js";
import { registerRoutes, startRouter } from "./router/router.js";
import { renderHomePage } from "./pages/home.js";
import { renderLooksPage } from "./pages/looks.js";
import { renderShopPage } from "./pages/shop.js";
import { renderProductDetailPage } from "./pages/productDetail.js";
import { renderLookDetailPage } from "./pages/lookDetail.js";
import { renderCartPage } from "./pages/cart.js";
import { renderWishPage } from "./pages/wish.js";
import { renderMyPage } from "./pages/mypage.js";
import { renderOrderCompletePage } from "./pages/orderComplete.js";
import { initCatalog } from "./data/data.js";
import { authReady } from "./state/auth.js";
import { initStore } from "./state/store.js";

document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");
  app.innerHTML = `${renderHeader()}<main id="page-outlet"><div class="empty-state"><p>불러오는 중...</p></div></main>${renderFooter()}`;
  mountHeaderEvents();

  await authReady;
  await Promise.all([initCatalog(), initStore()]);

  registerRoutes(
    [
      { path: "/", handler: renderHomePage },
      { path: "/looks", handler: renderLooksPage },
      { path: "/shop", handler: renderShopPage },
      { path: "/product/:id", handler: renderProductDetailPage },
      { path: "/look/:id", handler: renderLookDetailPage },
      { path: "/cart", handler: renderCartPage },
      { path: "/wish", handler: renderWishPage },
      { path: "/mypage", handler: renderMyPage },
      { path: "/order-complete/:id", handler: renderOrderCompletePage },
    ],
    renderHomePage
  );

  startRouter();
});
