import { getLookById } from "../data/data.js";
import { isLookSaved, toggleSavedLook } from "../state/store.js";
import { navigate } from "../router/router.js";
import { ICON_HEART } from "./icons.js";
import { showToast } from "./toast.js";
import { requireLogin } from "./authModal.js";

export function renderLookCard(look, { showSaveIcon = false } = {}) {
  const saved = showSaveIcon && isLookSaved(look.id);
  return `
    <div class="look-card" data-look-id="${look.id}" style="--mood-accent: var(--mood-${look.mood.toLowerCase()})">
      <div class="thumb" style="position:relative">
        <img src="${look.image}" alt="${look.name}" />
        ${
          showSaveIcon
            ? `<button class="wish-btn ${saved ? "active" : ""}" style="width:40px;height:40px" data-save-look-id="${look.id}">${ICON_HEART}</button>`
            : ""
        }
      </div>
      <div class="info">
        <div class="look-no">${look.code}</div>
        <div class="look-name">${look.name}</div>
        <div class="look-tag">${look.mood} · ${look.situation}</div>
      </div>
    </div>
  `;
}

export function initLookCards(containerEl) {
  containerEl.addEventListener("click", (e) => {
    const saveBtn = e.target.closest("[data-save-look-id]");
    if (saveBtn) {
      e.stopPropagation();
      const id = saveBtn.getAttribute("data-save-look-id");
      requireLogin(async () => {
        const active = await toggleSavedLook(id);
        saveBtn.classList.toggle("active", active);
        showToast(active ? "LOOK을 저장했습니다." : "LOOK 저장을 취소했습니다.");
      });
      return;
    }
    const card = e.target.closest(".look-card");
    if (card) {
      const look = getLookById(card.getAttribute("data-look-id"));
      if (look) navigate(`/look/${look.id}`);
    }
  });
}
