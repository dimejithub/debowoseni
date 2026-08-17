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

// ---- Public reads ----
//
// Published content is read straight from Supabase, which is always warm.
// The FastAPI backend sleeps on Render's free tier, so routing public reads
// through it cost every first visitor a ~15s cold start for data the anon key
// is already allowed to read (see the "public read" RLS policies).
//
// The backend stays as a fallback for the case where Supabase env vars are
// missing from a build, so a misconfigured deploy degrades instead of breaking.
async function readTable(build, fallback) {
  try {
    const { data, error } = await build();
    if (error) throw error;
    if (data) return data;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Supabase read failed, falling back to API:", err?.message || err);
    }
  }
  return fallback();
}

export async function getHealth() {
  const r = await publicApi.get("/health");
  return r.data;
}

export async function getPublishedPosts(limit = 50) {
  return readTable(
    () =>
      supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(Math.min(Math.max(limit, 1), 100)),
    async () => (await publicApi.get(`/posts?limit=${limit}`)).data.posts || []
  );
}

export async function getPostBySlug(slug) {
  const rows = await readTable(
    () => supabase.from("posts").select("*").eq("slug", slug).eq("status", "published").limit(1),
    async () => [(await publicApi.get(`/posts/${slug}`)).data]
  );
  if (!rows || !rows.length) throw new Error("Post not found");
  return rows[0];
}

export async function getPublishedTestimonials() {
  return readTable(
    () =>
      supabase
        .from("testimonials")
        .select("*")
        .eq("status", "published")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
    async () => (await publicApi.get("/testimonials")).data.testimonials || []
  );
}

export async function getPublishedBooks() {
  return readTable(
    () =>
      supabase
        .from("books")
        .select("*")
        .eq("status", "published")
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
    async () => (await publicApi.get("/books")).data.books || []
  );
}

export async function getPublicationsList() {
  return readTable(
    () =>
      supabase
        .from("publications")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("year", { ascending: false }),
    async () => (await publicApi.get("/publications")).data.publications || []
  );
}

export async function getPublishedEvents() {
  return readTable(
    () =>
      supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .order("sort_order", { ascending: true })
        .order("event_date", { ascending: false }),
    async () => (await publicApi.get("/events")).data.events || []
  );
}

export async function getEventBySlug(slug) {
  const rows = await readTable(
    () => supabase.from("events").select("*").eq("slug", slug).eq("status", "published").limit(1),
    async () => [(await publicApi.get(`/events/${slug}`)).data]
  );
  if (!rows || !rows.length) throw new Error("Event not found");
  return rows[0];
}

// ---- Public writes (these must go through the backend) ----
export async function submitContact(payload) {
  const r = await publicApi.post("/contact", payload);
  return r.data;
}

export async function subscribeNewsletter(email, opts = {}) {
  const r = await publicApi.post("/newsletter", {
    email,
    name: opts.name,
    source: opts.source,
    tags: opts.tags || [],
  });
  return r.data;
}

export async function unsubscribeByToken(token) {
  const r = await publicApi.post("/newsletter/unsubscribe", { token });
  return r.data;
}

export async function registerForEvent(slug, payload) {
  const r = await publicApi.post(`/events/${slug}/register`, payload);
  return r.data;
}

export async function getCommunityInfo(groupKey = "lte") {
  const r = await publicApi.get(`/community/${groupKey}`);
  return r.data;
}

export async function joinCommunity(payload) {
  const r = await publicApi.post("/community/join", payload);
  return r.data;
}

export async function adminListSubscribers() {
  const headers = await authHeaders();
  const r = await axios.get(`${API}/admin/subscribers`, { headers });
  return r.data.subscribers || [];
}

// ---- Admin generic factory ----
function adminCrud(resource) {
  return {
    list: async () => {
      const headers = await authHeaders();
      const r = await axios.get(`${API}/admin/${resource}`, { headers });
      return r.data[resource] || [];
    },
    create: async (payload) => {
      const headers = await authHeaders();
      const r = await axios.post(`${API}/admin/${resource}`, payload, { headers });
      return r.data;
    },
    update: async (id, payload) => {
      const headers = await authHeaders();
      const r = await axios.put(`${API}/admin/${resource}/${id}`, payload, { headers });
      return r.data;
    },
    remove: async (id) => {
      const headers = await authHeaders();
      const r = await axios.delete(`${API}/admin/${resource}/${id}`, { headers });
      return r.data;
    },
  };
}

export const adminTestimonials = adminCrud("testimonials");
export const adminBooks = adminCrud("books");
export const adminPublications = adminCrud("publications");
export const adminEvents = adminCrud("events");
export const adminCampaigns = adminCrud("campaigns");

// ---- Admin — dashboard stats ----
export async function adminStats() {
  const headers = await authHeaders();
  const r = await axios.get(`${API}/admin/stats`, { headers });
  return r.data;
}

// ---- Admin — event registrations ----
export async function adminListRegistrations(eventId) {
  const headers = await authHeaders();
  const r = await axios.get(`${API}/admin/registrations`, {
    headers,
    params: eventId ? { event_id: eventId } : {},
  });
  return r.data.registrations || [];
}

export async function adminUpdateRegistration(id, payload) {
  const headers = await authHeaders();
  const r = await axios.put(`${API}/admin/registrations/${id}`, payload, { headers });
  return r.data;
}

export async function adminDeleteRegistration(id) {
  const headers = await authHeaders();
  const r = await axios.delete(`${API}/admin/registrations/${id}`, { headers });
  return r.data;
}

// ---- Admin — campaigns ----
export async function adminGetCampaign(id) {
  const headers = await authHeaders();
  const r = await axios.get(`${API}/admin/campaigns/${id}`, { headers });
  return r.data;
}

export async function adminPreviewCampaign(id) {
  const headers = await authHeaders();
  const r = await axios.get(`${API}/admin/campaigns/${id}/preview`, { headers });
  return r.data;
}

export async function adminTestCampaign(id, email) {
  const headers = await authHeaders();
  const r = await axios.post(`${API}/admin/campaigns/${id}/test`, { email }, { headers });
  return r.data;
}

export async function adminSendCampaign(id) {
  const headers = await authHeaders();
  const r = await axios.post(`${API}/admin/campaigns/${id}/send`, {}, { headers });
  return r.data;
}

// ---- Admin — automations (sequences) ----
export const adminSequences = adminCrud("sequences");

export async function adminGetSequence(id) {
  const headers = await authHeaders();
  const r = await axios.get(`${API}/admin/sequences/${id}`, { headers });
  return r.data;
}

export async function adminCreateStep(sequenceId, payload) {
  const headers = await authHeaders();
  const r = await axios.post(`${API}/admin/sequences/${sequenceId}/steps`, payload, { headers });
  return r.data;
}

export async function adminUpdateStep(stepId, payload) {
  const headers = await authHeaders();
  const r = await axios.put(`${API}/admin/sequences/steps/${stepId}`, payload, { headers });
  return r.data;
}

export async function adminDeleteStep(stepId) {
  const headers = await authHeaders();
  const r = await axios.delete(`${API}/admin/sequences/steps/${stepId}`, { headers });
  return r.data;
}

export async function adminRunSequences(id) {
  const headers = await authHeaders();
  const r = await axios.post(`${API}/admin/sequences/${id}/run`, {}, { headers });
  return r.data;
}

// ---- Admin — enquiries (contact-form messages) ----
export async function adminListEnquiries() {
  const headers = await authHeaders();
  const r = await axios.get(`${API}/admin/enquiries`, { headers });
  return r.data.enquiries || [];
}

export async function adminDeleteEnquiry(id) {
  const headers = await authHeaders();
  const r = await axios.delete(`${API}/admin/enquiries/${id}`, { headers });
  return r.data;
}

// ---- Admin — newsletter (scheduled digest) ----
export async function adminGetNewsletter() {
  const headers = await authHeaders();
  const r = await axios.get(`${API}/admin/newsletter`, { headers });
  return r.data;
}

export async function adminUpdateNewsletter(payload) {
  const headers = await authHeaders();
  const r = await axios.put(`${API}/admin/newsletter`, payload, { headers });
  return r.data;
}

export async function adminSendNewsletterNow() {
  const headers = await authHeaders();
  const r = await axios.post(`${API}/admin/newsletter/send-now`, {}, { headers });
  return r.data;
}

// ---- Admin — community ----
export async function adminListCommunity() {
  const headers = await authHeaders();
  const r = await axios.get(`${API}/admin/community`, { headers });
  return r.data.members || [];
}

export async function adminUpdateCommunityMember(id, payload) {
  const headers = await authHeaders();
  const r = await axios.put(`${API}/admin/community/${id}`, payload, { headers });
  return r.data;
}

// ---- Admin — programme enrolments ----
export async function adminListEnrolments() {
  const headers = await authHeaders();
  const r = await axios.get(`${API}/admin/enrolments`, { headers });
  return r.data.enrolments || [];
}

export async function adminCreateEnrolment(payload) {
  const headers = await authHeaders();
  const r = await axios.post(`${API}/admin/enrolments`, payload, { headers });
  return r.data;
}

export async function adminUpdateEnrolment(id, payload) {
  const headers = await authHeaders();
  const r = await axios.put(`${API}/admin/enrolments/${id}`, payload, { headers });
  return r.data;
}

export async function adminDeleteEnrolment(id) {
  const headers = await authHeaders();
  const r = await axios.delete(`${API}/admin/enrolments/${id}`, { headers });
  return r.data;
}

// ---- Admin — people (CRM) ----
export async function adminListPeople() {
  const headers = await authHeaders();
  const r = await axios.get(`${API}/admin/people`, { headers });
  return r.data.people || [];
}

export async function adminGetPerson(email) {
  const headers = await authHeaders();
  const r = await axios.get(`${API}/admin/people/${encodeURIComponent(email)}`, { headers });
  return r.data;
}

// ---- Admin posts (specialised — has separate getById endpoint) ----
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

// Mirror of the backend's MAX_UPLOAD_BYTES, so an over-size file is caught
// instantly with a friendly message instead of a slow round-trip that 413s.
// The server still resizes and re-encodes everything under this to web-ready
// WebP, so the uploader never has to shrink a photo by hand.
export const MAX_UPLOAD_MB = 25;

export async function adminUpload(file, folder = "posts") {
  if (file && file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `That image is ${mb} MB — the limit is ${MAX_UPLOAD_MB} MB. Please pick a smaller one; an ordinary phone photo is fine.`
    );
  }
  const headers = await authHeaders();
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const r = await axios.post(`${API}/admin/upload`, form, {
    headers: { ...headers, "Content-Type": "multipart/form-data" },
  });
  return r.data;
}
