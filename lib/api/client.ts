import axios from "axios";
import { API_ENDPOINTS } from "./endpoints";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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
        // 🔄 Refresh token (cookies auto-sent)
        await client.post(API_ENDPOINTS.REFRESH);

        processQueue();
        return client(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError);

        // ❌ Refresh failed → session expired
        // Clear global store
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
  // Check if we even have a session flag (non-httponly cookie)
  if (typeof document !== "undefined") {
    const hasSession = document.cookie.includes("session_can_refresh=true");
    if (!hasSession) {
      console.log("No active session detected, skipping refresh.");
      throw new Error("No active session");
    }
  }

  // If already refreshing, return the existing promise
  if (isRefreshing && refreshTokenPromise) {
    return refreshTokenPromise;
  }

  // If refresh is queued, wait in queue
  if (isRefreshing) {
    return new Promise<void>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  refreshTokenPromise = (async () => {
    try {
      await client.post(API_ENDPOINTS.REFRESH);
      processQueue();
    } catch (error) {
      processQueue(error);
      throw error;
    } finally {
      isRefreshing = false;
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

export default client;
