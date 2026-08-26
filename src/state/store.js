// 장바구니 / 찜 / 저장한 LOOK / 주문 상태 관리
// 로그인 상태: Supabase(cart_items/wishlist_items/saved_looks/orders/order_items)에 사용자별로 저장
// 게스트 상태: 로그인 전까지는 localStorage에 임시 보관하고, 로그인 시 Supabase로 병합합니다.

import { supabase } from "../lib/supabaseClient.js";
import { getCurrentUser, onAuthChange } from "./auth.js";

const GUEST_KEY = "fitroom_guest_data";
const listeners = new Set();

let cache = { cart: [], wish: [], savedLooks: [], orders: [] };

function emit() {
  listeners.forEach((fn) => fn(cache));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function readGuest() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) || { cart: [], wish: [] };
  } catch {
    return { cart: [], wish: [] };
  }
}

function writeGuest() {
  localStorage.setItem(GUEST_KEY, JSON.stringify({ cart: cache.cart, wish: cache.wish }));
}

async function loadFromSupabase(userId) {
  const [{ data: cartRows }, { data: wishRows }, { data: savedRows }, { data: orderRows }] = await Promise.all([
    supabase.from("cart_items").select("*").eq("user_id", userId),
    supabase.from("wishlist_items").select("product_id").eq("user_id", userId),
    supabase.from("saved_looks").select("look_id, created_at").eq("user_id", userId),
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  cache = {
    cart: (cartRows || []).map((r) => ({ cartId: r.id, productId: r.product_id, color: r.color, size: r.size, qty: r.quantity })),
    wish: (wishRows || []).map((r) => r.product_id),
    savedLooks: (savedRows || []).map((r) => ({ lookId: r.look_id, savedAt: r.created_at })),
    orders: (orderRows || []).map((o) => ({
      id: o.order_number,
      dbId: o.id,
      date: o.created_at,
      total: o.total_price,
      status: o.status,
      items: (o.order_items || []).map((it) => ({
        productId: it.product_id,
        color: it.color,
        size: it.size,
        qty: it.quantity,
        price: it.price,
      })),
    })),
  };
  emit();
}

async function loadGuest() {
  const guest = readGuest();
  cache = { cart: guest.cart || [], wish: guest.wish || [], savedLooks: [], orders: [] };
  emit();
}

export async function initStore() {
  const user = getCurrentUser();
  if (user) {
    await loadFromSupabase(user.id);
  } else {
    await loadGuest();
  }
}

onAuthChange(async (user) => {
  if (user) {
    const guest = readGuest();
    await Promise.all([
      ...(guest.cart || []).map((item) =>
        supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: item.productId,
          color: item.color,
          size: item.size,
          quantity: item.qty,
        })
      ),
      ...(guest.wish || []).map((productId) =>
        supabase.from("wishlist_items").upsert(
          { user_id: user.id, product_id: productId },
          { onConflict: "user_id,product_id", ignoreDuplicates: true }
        )
      ),
    ]);
    localStorage.removeItem(GUEST_KEY);
    await loadFromSupabase(user.id);
  } else {
    await loadGuest();
  }
});

export function getData() {
  return cache;
}

/* ------------------------- CART ------------------------- */

export function getCart() {
  return cache.cart;
}

export function getCartCount() {
  return cache.cart.reduce((sum, item) => sum + item.qty, 0);
}

export async function addToCart({ productId, color, size, qty = 1 }) {
  const user = getCurrentUser();
  const existing = cache.cart.find((i) => i.productId === productId && i.color === color && i.size === size);

  if (user) {
    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.qty + qty }).eq("id", existing.cartId);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, color, size, quantity: qty });
    }
    await loadFromSupabase(user.id);
  } else {
    if (existing) {
      existing.qty += qty;
    } else {
      cache.cart.push({ cartId: `g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, productId, color, size, qty });
    }
    writeGuest();
    emit();
  }
}

export async function addManyToCart(items) {
  const user = getCurrentUser();

  if (user) {
    await Promise.all(
      items.map(({ productId, color, size, qty = 1 }) => {
        const existing = cache.cart.find((i) => i.productId === productId && i.color === color && i.size === size);
        if (existing) {
          return supabase.from("cart_items").update({ quantity: existing.qty + qty }).eq("id", existing.cartId);
        }
        return supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, color, size, quantity: qty });
      })
    );
    await loadFromSupabase(user.id);
  } else {
    items.forEach(({ productId, color, size, qty = 1 }) => {
      const existing = cache.cart.find((i) => i.productId === productId && i.color === color && i.size === size);
      if (existing) {
        existing.qty += qty;
      } else {
        cache.cart.push({
          cartId: `g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${productId}`,
          productId,
          color,
          size,
          qty,
        });
      }
    });
    writeGuest();
    emit();
  }
}

export async function updateCartQty(cartId, qty) {
  const user = getCurrentUser();
  const safeQty = Math.max(1, qty);

  if (user) {
    await supabase.from("cart_items").update({ quantity: safeQty }).eq("id", cartId);
    await loadFromSupabase(user.id);
  } else {
    const item = cache.cart.find((i) => i.cartId === cartId);
    if (item) {
      item.qty = safeQty;
      writeGuest();
      emit();
    }
  }
}

export async function removeFromCart(cartId) {
  const user = getCurrentUser();

  if (user) {
    await supabase.from("cart_items").delete().eq("id", cartId);
    await loadFromSupabase(user.id);
  } else {
    cache.cart = cache.cart.filter((i) => i.cartId !== cartId);
    writeGuest();
    emit();
  }
}

async function clearCart() {
  const user = getCurrentUser();
  if (user) {
    await supabase.from("cart_items").delete().eq("user_id", user.id);
  } else {
    cache.cart = [];
    writeGuest();
  }
}

/* ------------------------- WISH ------------------------- */

export function isWished(productId) {
  return cache.wish.includes(productId);
}

export async function toggleWish(productId) {
  const user = getCurrentUser();
  const active = cache.wish.includes(productId);

  if (user) {
    if (active) {
      await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", productId);
    } else {
      await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
    }
    await loadFromSupabase(user.id);
    return cache.wish.includes(productId);
  }

  if (active) {
    cache.wish = cache.wish.filter((id) => id !== productId);
  } else {
    cache.wish.push(productId);
  }
  writeGuest();
  emit();
  return cache.wish.includes(productId);
}

export function getWishList() {
  return cache.wish;
}

/* ---------------------- SAVED LOOKS ---------------------- */

export function isLookSaved(lookId) {
  return cache.savedLooks.some((l) => l.lookId === lookId);
}

export async function toggleSavedLook(lookId) {
  const user = getCurrentUser();
  if (!user) return false;

  const active = cache.savedLooks.some((l) => l.lookId === lookId);
  if (active) {
    await supabase.from("saved_looks").delete().eq("user_id", user.id).eq("look_id", lookId);
  } else {
    await supabase.from("saved_looks").insert({ user_id: user.id, look_id: lookId });
  }
  await loadFromSupabase(user.id);
  return cache.savedLooks.some((l) => l.lookId === lookId);
}

export function getSavedLooks() {
  return cache.savedLooks;
}

/* ------------------------- ORDERS ------------------------- */

export async function createOrder({ items, total }) {
  const user = getCurrentUser();
  if (!user) return null;

  const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
  const { data: order, error } = await supabase
    .from("orders")
    .insert({ user_id: user.id, order_number: orderNumber, total_price: total, status: "결제완료" })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      color: item.color,
      size: item.size,
      quantity: item.qty,
      price: item.price,
    }))
  );

  await clearCart();
  await loadFromSupabase(user.id);

  return { id: orderNumber, date: order.created_at, total, status: order.status };
}

export function getOrders() {
  return cache.orders;
}

export function getOrderById(id) {
  return cache.orders.find((o) => o.id === id);
}
