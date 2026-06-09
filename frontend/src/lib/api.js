import axios from "axios";
import { supabase } from "./supabaseClient";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const publicApi = axios.create({ baseURL: API });

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getHealth() {
  const r = await publicApi.get("/health");
  return r.data;
}

export async function getPublishedPosts(limit = 50) {
  const r = await publicApi.get(`/posts?limit=${limit}`);
  return r.data.posts || [];
}

export async function getPostBySlug(slug) {
  const r = await publicApi.get(`/posts/${slug}`);
  return r.data;
}

export async function submitContact(payload) {
  const r = await publicApi.post("/contact", payload);
  return r.data;
}

export async function subscribeNewsletter(email) {
  const r = await publicApi.post("/newsletter", { email });
  return r.data;
}

// ---- Admin ----
export async function adminListPosts() {
  const headers = await authHeaders();
  const r = await axios.get(`${API}/admin/posts`, { headers });
  return r.data.posts || [];
}

export async function adminGetPost(id) {
  const headers = await authHeaders();
  const r = await axios.get(`${API}/admin/posts/${id}`, { headers });
  return r.data;
}

export async function adminCreatePost(payload) {
  const headers = await authHeaders();
  const r = await axios.post(`${API}/admin/posts`, payload, { headers });
  return r.data;
}

export async function adminUpdatePost(id, payload) {
  const headers = await authHeaders();
  const r = await axios.put(`${API}/admin/posts/${id}`, payload, { headers });
  return r.data;
}

export async function adminDeletePost(id) {
  const headers = await authHeaders();
  const r = await axios.delete(`${API}/admin/posts/${id}`, { headers });
  return r.data;
}

export async function adminUpload(file, folder = "posts") {
  const headers = await authHeaders();
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const r = await axios.post(`${API}/admin/upload`, form, {
    headers: { ...headers, "Content-Type": "multipart/form-data" },
  });
  return r.data; // { url, path }
}
