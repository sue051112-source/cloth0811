import { login, signup, getCurrentUser } from "../state/auth.js";
import { initStore } from "../state/store.js";
import { ICON_CLOSE } from "./icons.js";

let overlayEl = null;

function closeModal() {
  if (overlayEl) {
    overlayEl.remove();
    overlayEl = null;
  }
}

function renderLogin(onSuccess) {
  overlayEl.innerHTML = `
    <div class="modal-box" style="position:relative">
      <button class="modal-close" data-close>${ICON_CLOSE}</button>
      <h2>LOGIN</h2>
      <div class="modal-error" data-error style="display:none"></div>
      <input type="email" placeholder="EMAIL" data-email />
      <input type="password" placeholder="PASSWORD" data-password />
      <button class="btn btn-primary" data-submit>LOGIN</button>
      <div class="modal-switch">
        계정이 없으신가요? <button data-goto-signup>회원가입</button>
      </div>
    </div>
  `;
  overlayEl.querySelector("[data-close]").addEventListener("click", closeModal);
  overlayEl.querySelector("[data-goto-signup]").addEventListener("click", () => renderSignup(onSuccess));
  overlayEl.querySelector("[data-submit]").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    const email = overlayEl.querySelector("[data-email]").value.trim();
    const password = overlayEl.querySelector("[data-password]").value;
    btn.disabled = true;
    const result = await login({ email, password });
    if (!overlayEl) return;
    if (!result.ok) {
      btn.disabled = false;
      const errEl = overlayEl.querySelector("[data-error]");
      errEl.textContent = result.error;
      errEl.style.display = "block";
      return;
    }
    await initStore();
    closeModal();
    onSuccess && onSuccess(result.user);
  });
}

function renderSignup(onSuccess) {
  overlayEl.innerHTML = `
    <div class="modal-box" style="position:relative">
      <button class="modal-close" data-close>${ICON_CLOSE}</button>
      <h2>SIGN UP</h2>
      <div class="modal-error" data-error style="display:none"></div>
      <input type="text" placeholder="NAME" data-name />
      <input type="email" placeholder="EMAIL" data-email />
      <input type="password" placeholder="PASSWORD" data-password />
      <input type="password" placeholder="PASSWORD CONFIRM" data-password-confirm />
      <button class="btn btn-primary" data-submit>SIGN UP</button>
      <div class="modal-switch">
        이미 계정이 있으신가요? <button data-goto-login>로그인</button>
      </div>
    </div>
  `;
  overlayEl.querySelector("[data-close]").addEventListener("click", closeModal);
  overlayEl.querySelector("[data-goto-login]").addEventListener("click", () => renderLogin(onSuccess));
  overlayEl.querySelector("[data-submit]").addEventListener("click", async (e) => {
    const name = overlayEl.querySelector("[data-name]").value.trim();
    const email = overlayEl.querySelector("[data-email]").value.trim();
    const password = overlayEl.querySelector("[data-password]").value;
    const passwordConfirm = overlayEl.querySelector("[data-password-confirm]").value;
    const btn = e.currentTarget;
    btn.disabled = true;
    const result = await signup({ email, password, passwordConfirm, name });
    if (!overlayEl) return;
    if (!result.ok) {
      btn.disabled = false;
      const errEl = overlayEl.querySelector("[data-error]");
      errEl.textContent = result.error;
      errEl.style.display = "block";
      return;
    }
    await initStore();
    closeModal();
    onSuccess && onSuccess(result.user);
  });
}

export function openLoginModal(onSuccess) {
  closeModal();
  overlayEl = document.createElement("div");
  overlayEl.className = "modal-overlay";
  overlayEl.addEventListener("click", (e) => {
    if (e.target === overlayEl) closeModal();
  });
  document.body.appendChild(overlayEl);
  renderLogin(onSuccess);
}

export function openSignupModal(onSuccess) {
  closeModal();
  overlayEl = document.createElement("div");
  overlayEl.className = "modal-overlay";
  overlayEl.addEventListener("click", (e) => {
    if (e.target === overlayEl) closeModal();
  });
  document.body.appendChild(overlayEl);
  renderSignup(onSuccess);
}

// 로그인이 필요한 동작을 감쌉니다: 로그인 상태면 즉시 실행, 아니면 로그인 모달을 띄우고 성공 시 실행합니다.
export function requireLogin(action) {
  const user = getCurrentUser();
  if (user) {
    action(user);
  } else {
    openLoginModal((user) => action(user));
  }
}
