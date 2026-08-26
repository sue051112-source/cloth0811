let hideTimer = null;

export function showToast(message) {
  let el = document.getElementById("fitroom-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "fitroom-toast";
    document.body.appendChild(el);
  }
  el.className = "toast";
  el.textContent = message;
  el.style.display = "flex";

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    el.style.display = "none";
  }, 2000);
}
