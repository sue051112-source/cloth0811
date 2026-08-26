// FITROOM 상품/LOOK 카탈로그 — Supabase(products/looks/look_products 테이블)에서 조회합니다.
// initCatalog()이 완료된 이후에만 PRODUCTS/LOOKS가 채워집니다. (main.js에서 라우터 시작 전 await)

import { supabase } from "../lib/supabaseClient.js";

export const SITUATIONS = [
  { code: "DAILY", label: "DAILY" },
  { code: "CAFE", label: "CAFE" },
  { code: "DATE", label: "DATE" },
  { code: "CAMPUS", label: "CAMPUS" },
  { code: "STREET", label: "STREET" },
  { code: "TRAVEL", label: "TRAVEL" },
];

export const MOODS = [
  { code: "MINIMAL", label: "MINIMAL" },
  { code: "CASUAL", label: "CASUAL" },
  { code: "SOFT", label: "SOFT" },
  { code: "VINTAGE", label: "VINTAGE" },
  { code: "STREET", label: "STREET" },
  { code: "MONO", label: "MONO" },
];

export const CATEGORIES = [
  { code: "TOP", label: "TOP" },
  { code: "BOTTOM", label: "BOTTOM" },
  { code: "OUTER", label: "OUTER" },
  { code: "SHOES", label: "SHOES" },
  { code: "ACCESSORIES", label: "ACCESSORIES" },
];

// DB에는 색상 "이름"만 저장되어 있으므로, 화면에 표시할 스와치 색상은 이름 기준으로 매핑합니다.
const COLOR_HEX = {
  BLACK: "#171717",
  WHITE: "#F5F5F3",
  BEIGE: "#D9CBB4",
  GRAY: "#9B9B93",
  BROWN: "#6B4A32",
  NAVY: "#2B3244",
};

export const SITUATION_TAG = {
  DAILY: "fashion,lifestyle,daily",
  CAFE: "cafe,fashion,model",
  DATE: "fashion,couple,romantic",
  CAMPUS: "campus,fashion,student",
  STREET: "street,fashion,model",
  TRAVEL: "travel,fashion,model",
};

export function situationImage(code, lock) {
  return `https://loremflickr.com/400/720/${SITUATION_TAG[code]}?lock=${lock}`;
}

export function heroImage() {
  return `https://loremflickr.com/900/1100/fashion,model,editorial?lock=999`;
}

export let PRODUCTS = [];
export let LOOKS = [];

export async function initCatalog() {
  const [{ data: products, error: productsError }, { data: looks, error: looksError }, { data: lookProducts, error: lpError }] =
    await Promise.all([
      supabase.from("products").select("*").order("created_at"),
      supabase.from("looks").select("*").order("created_at"),
      supabase.from("look_products").select("look_id, product_id"),
    ]);

  if (productsError || looksError || lpError) {
    throw productsError || looksError || lpError;
  }

  PRODUCTS = (products || []).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    description: p.description,
    colors: (p.colors || []).map((name) => ({ name, hex: COLOR_HEX[name] || "#CCCCCC" })),
    sizes: p.sizes || [],
    images: p.image_urls || [],
  }));

  LOOKS = (looks || []).map((l) => ({
    id: l.id,
    code: l.look_number,
    name: l.name,
    situation: l.situation,
    mood: l.mood,
    description: l.description,
    image: l.image_url,
    productIds: (lookProducts || []).filter((lp) => lp.look_id === l.id).map((lp) => lp.product_id),
  }));
}

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

export function getLookById(id) {
  return LOOKS.find((l) => l.id === id);
}
