// 인증 모듈 — Supabase Auth(auth.users) + profiles 테이블 연동

import { supabase } from "../lib/supabaseClient.js";

let currentUser = null; // { id, email, name }
let ready = false;
const listeners = new Set();
const readyListeners = new Set();

async function loadProfileName(userId) {
  const { data } = await supabase.from("profiles").select("name").eq("id", userId).maybeSingle();
  return data?.name || "";
}

async function applySession(session) {
  if (session?.user) {
    const name = await loadProfileName(session.user.id);
    currentUser = { id: session.user.id, email: session.user.email, name };
  } else {
    currentUser = null;
  }
  listeners.forEach((fn) => fn(currentUser));
}

supabase.auth.onAuthStateChange((_event, session) => {
  applySession(session);
});

export const authReady = supabase.auth.getSession().then(({ data }) => applySession(data.session).then(() => {
  ready = true;
  readyListeners.forEach((fn) => fn());
}));

export function getCurrentUser() {
  return currentUser;
}

export function isAuthReady() {
  return ready;
}

export function onAuthChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function signup({ email, password, passwordConfirm, name }) {
  if (!email || !password || !name) {
    return { ok: false, error: "모든 항목을 입력해주세요." };
  }
  if (password !== passwordConfirm) {
    return { ok: false, error: "비밀번호가 일치하지 않습니다." };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { ok: false, error: error.message };
  }

  const userId = data.user?.id;
  if (userId) {
    await supabase.from("profiles").insert({ id: userId, name });
  }

  if (!data.session) {
    return {
      ok: false,
      error: "가입 확인 메일을 보냈습니다. 메일함에서 인증 후 로그인해주세요.",
    };
  }

  await applySession(data.session);
  return { ok: true, user: currentUser };
}

export async function login({ email, password }) {
  if (!email || !password) {
    return { ok: false, error: "이메일과 비밀번호를 입력해주세요." };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }
  await applySession(data.session);
  return { ok: true, user: currentUser };
}

export async function logout() {
  await supabase.auth.signOut();
  currentUser = null;
  listeners.forEach((fn) => fn(currentUser));
}
