// api/client.js — Fetch wrapper to backend
const BASE_URL = "http://localhost:8000";

const AUTH_KEY = "gigshield_token";

export const authState = {
  getToken: () => localStorage.getItem(AUTH_KEY),
  setToken: (token) => localStorage.setItem(AUTH_KEY, token),
  clearToken: () => localStorage.removeItem(AUTH_KEY),
  isAuthenticated: () => !!localStorage.getItem(AUTH_KEY),
};

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = authState.getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    if (res.status === 401) {
      authState.clearToken();
      window.location.href = "/login";
    }
    const error = await res.text();
    throw new Error(error || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  // Auth
  requestOtp: (phoneNumber) => request("/auth/otp/request", { method: "POST", body: JSON.stringify({ phone_number: phoneNumber }) }),
  verifyOtp: (phoneNumber, otpCode) => request("/auth/otp/verify", { method: "POST", body: JSON.stringify({ phone_number: phoneNumber, otp_code: otpCode }) }),
  getPlatforms: () => request("/auth/platforms"),
  getMe: () => request("/auth/me"),
  updateMe: (data) => request("/auth/me", { method: "PUT", body: JSON.stringify(data) }),

  // Dashboard
  getWeeklyDashboard: () => request("/dashboard/weekly"),

  // Jobs
  getJobs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/jobs${q ? "?" + q : ""}`);
  },
  getJob: (id) => request(`/jobs/${id}`),
  getJobSafetyScore: (id) => request(`/jobs/${id}/safety`),
  deleteJob: (id) => request(`/jobs/${id}`, { method: "DELETE" }),
  createJob: (data) => request("/jobs", { method: "POST", body: JSON.stringify(data) }),
  scanJob: (file) => {
    const form = new FormData();
    form.append("file", file);
    const headers = {};
    const token = authState.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(`${BASE_URL}/jobs/scan`, { method: "POST", body: form, headers }).then((r) => {
      if (r.status === 401) { authState.clearToken(); window.location.href = "/login"; }
      return r.json();
    });
  },
  runFairnessCheck: (jobId) => request(`/jobs/${jobId}/fairness-check`, { method: "POST" }),

  // Insights
  getWeeklyInsight: () => request("/insights/weekly"),

  // Chat
  sendMessage: (message, jobId = null) => request("/chat", { method: "POST", body: JSON.stringify({ message, job_id: jobId }) }),

  // Complaints
  draftComplaint: (jobId) => request("/complaints/draft", { method: "POST", body: JSON.stringify({ job_id: jobId }) }),

  // Goals
  getGoal: () => request("/goals"),
  setGoal: (target) => request("/goals", { method: "POST", body: JSON.stringify({ target_amount: target }) }),
};
