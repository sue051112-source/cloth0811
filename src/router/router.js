// 해시 기반 라우터: "#/path/segment?query=value" 형태를 지원합니다.

let routes = [];
let notFoundHandler = () => {};

export function registerRoutes(routeTable, fallback) {
  routes = routeTable.map((r) => ({
    ...r,
    segments: r.path.split("/").filter(Boolean),
  }));
  if (fallback) notFoundHandler = fallback;
}

export function navigate(path) {
  if (location.hash === `#${path}`) {
    handleRoute();
  } else {
    location.hash = path;
  }
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

export function getQuery() {
  const hash = location.hash.slice(1);
  const qIndex = hash.indexOf("?");
  if (qIndex === -1) return {};
  const params = new URLSearchParams(hash.slice(qIndex + 1));
  const out = {};
  for (const [key, value] of params.entries()) out[key] = value;
  return out;
}

function parsePath() {
  const hash = location.hash.slice(1) || "/";
  const qIndex = hash.indexOf("?");
  return qIndex === -1 ? hash : hash.slice(0, qIndex);
}

function matchRoute(path) {
  const pathSegments = path.split("/").filter(Boolean);
  for (const route of routes) {
    if (route.segments.length !== pathSegments.length) continue;
    const params = {};
    let matched = true;
    for (let i = 0; i < route.segments.length; i++) {
      const seg = route.segments[i];
      if (seg.startsWith(":")) {
        params[seg.slice(1)] = decodeURIComponent(pathSegments[i]);
      } else if (seg !== pathSegments[i]) {
        matched = false;
        break;
      }
    }
    if (matched) return { route, params };
  }
  return null;
}

function handleRoute() {
  const path = parsePath();
  const matched = matchRoute(path);
  const query = getQuery();
  if (matched) {
    matched.route.handler({ params: matched.params, query });
  } else {
    notFoundHandler();
  }
  document.querySelectorAll(".header-nav a[data-nav]").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("data-nav") === path.split("/")[1]);
  });
}

export function startRouter() {
  window.addEventListener("hashchange", handleRoute);
  if (!location.hash) location.hash = "#/";
  handleRoute();
}
