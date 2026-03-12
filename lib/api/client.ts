import axios from "axios";
import { API_ENDPOINTS } from "./endpoints";

// All client-side requests MUST go through the Next.js same-origin proxy
// at /api/ so the browser sends/receives cookies correctly.
const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api"
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/");

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for cookies
});

/* ----------------------------------
   Refresh Queue (Cookie-safe)
---------------------------------- */
let isRefreshing = false;
let refreshTokenPromise: Promise<void> | null = null;
let failedQueue: {
  resolve: () => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((p) => {
    error ? p.reject(error) : p.resolve();
  });
  failedQueue = [];
};

/* ----------------------------------
   Response Interceptor
---------------------------------- */
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(API_ENDPOINTS.REFRESH)
    ) {
      // ⏳ If refresh already happening → queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(client(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 🔄 Refresh via same-origin proxy
        const refreshResp = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        if (!refreshResp.ok) throw new Error('Refresh failed');

        processQueue();
        return client(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError);

        // ❌ Refresh failed → session expired
        // Clear global store
        import("@/lib/store/useStore").then(({ useStore }) => {
          useStore.getState().logoutUser();
        });

        if (typeof window !== "undefined") {
          import("@/lib/store/useStore").then(({ useStore }) => {
            useStore.getState().logoutUser();
          });

          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* ----------------------------------
   Manual Token Refresh
---------------------------------- */
export const refreshAuthToken = async () => {
  if (isRefreshing) {
    return new Promise<void>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const r = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    if (!r.ok) throw new Error('Refresh failed');
    processQueue();
  } catch (error) {
    processQueue(error);
    throw error;
  } finally {
    isRefreshing = false;
  }
};

export default client;
