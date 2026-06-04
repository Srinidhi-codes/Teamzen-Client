"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { useEffect } from 'react';
import { refreshAuthToken } from '@/lib/api/client';

/* ---------------- AUTH ---------------- */

export const useAuth = () => {
  const login = useMutation({
    mutationFn: async (data: any) => {
      // ⚠️ MUST use fetch to the Next.js proxy — NOT client.post.
      // The proxy at /api/auth/login relays the cookies as same-origin.
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.detail || err?.error || 'Login failed');
      }
      return response.json();
    },
  });

  const register = useMutation({
    mutationFn: async (data: any) => {
      const response = await client.post(API_ENDPOINTS.REGISTER, data);
      return response.data;
    },
  });

  const requestOtp = useMutation({
    mutationFn: async (email: string) => {
      const response = await client.post(API_ENDPOINTS.OTP_SEND, { email });
      return response.data;
    }
  });

  const verifyOtp = useMutation({
    mutationFn: async (data: { email: string; otp: string; latitude?: number; longitude?: number }) => {
      const response = await fetch('/api/auth/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.detail || err?.error || 'OTP verification failed');
      }
      return response.json();
    }
  });

  const verifyTotp = useMutation({
    mutationFn: async (data: { temp_token: string; code: string; latitude?: number; longitude?: number }) => {
      const response = await fetch('/api/auth/totp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.detail || err?.error || '2FA verification failed');
      }
      return response.json();
    }
  });

  const googleLogin = useMutation({
    mutationFn: async (data: { id_token: string; latitude?: number; longitude?: number }) => {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.detail || err?.error || 'Google login failed');
      }
      return response.json();
    }
  });

  return { login, register, requestOtp, verifyOtp, verifyTotp, googleLogin };
};

// hooks/useTokenRefresh.ts

export const useTokenRefresh = () => {
  useEffect(() => {
    // Refresh token every 25 minutes (before 30-minute expiry)
    const interval = setInterval(async () => {
      try {
        await refreshAuthToken();
      } catch (error) {
      }
    }, 25 * 60 * 1000); // 25 minutes

    return () => clearInterval(interval);
  }, []);
};

/* ---------------- USER ---------------- */

export const useUser = () => {
  const query = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await client.get(API_ENDPOINTS.USER_ME);
      // Map backend snake_case to frontend camelCase
      const { mapBackendUserToFrontendUser } = await import("@/lib/transformers");
      return mapBackendUserToFrontendUser(response.data);
    },
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useUpdateUser = () => {
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await client.patch(
        API_ENDPOINTS.USER_UPDATE,
        data,
        { withCredentials: true }
      );
      return response.data;
    },
  });

  return {
    updateUser: mutation.mutate,
    updateUserAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

/* ---------------- LEAVE REQUESTS ---------------- */

// export const useLeaveRequests = () => {
//   const query = useQuery({
//     queryKey: ["leaveRequests"],
//     queryFn: async () => {
//       const response = await client.get(API_ENDPOINTS.LEAVE_REQUESTS);
//       return response.data;
//     },
//   });

//   const create = useMutation({
//     mutationFn: async (data: any) => {
//       const response = await client.post(API_ENDPOINTS.LEAVE_REQUESTS, data);
//       return response.data;
//     },
//   });

//   const approve = useMutation({
//     mutationFn: async ({ id, comments }: { id: number; comments: string }) => {
//       const response = await client.post(
//         `${API_ENDPOINTS.LEAVE_REQUESTS}${id}/approve/`,
//         { comments }
//       );
//       return response.data;
//     },
//   });

//   return {
//     ...query,
//     create,
//     approve,
//   };
// };

/* ---------------- LEAVE BALANCES ---------------- */

// export const useLeaveBalances = () => {
//   const query = useQuery({
//     queryKey: ["leaveBalances"],
//     queryFn: async () => {
//       const response = await client.get(API_ENDPOINTS.LEAVE_BALANCES);
//       return response.data;
//     },
//   });

//   return {
//     balances: query.data,
//     isLoading: query.isLoading,
//     error: query.error,
//   };
// };

/* ---------------- ATTENDANCE ---------------- */

// export const useAttendance = () => {
//   const checkIn = useMutation({
//     mutationFn: async (data: any) => {
//       const response = await client.post(API_ENDPOINTS.CHECK_IN, data);
//       return response.data;
//     },
//   });

//   const checkOut = useMutation({
//     mutationFn: async (data: any) => {
//       const response = await client.post(API_ENDPOINTS.CHECK_OUT, data);
//       return response.data;
//     },
//   });

//   const records = useQuery({
//     queryKey: ["attendance"],
//     queryFn: async () => {
//       const response = await client.get(API_ENDPOINTS.ATTENDANCE);
//       return response.data;
//     },
//   });

//   return {
//     checkIn,
//     checkOut,
//     records: records.data,
//     isLoading: records.isLoading,
//   };
// };

/* ---------------- PAYROLL ---------------- */

// export const usePayrollRuns = () => {
//   const query = useQuery({
//     queryKey: ["payrollRuns"],
//     queryFn: async () => {
//       const response = await client.get(API_ENDPOINTS.PAYROLL_RUNS);
//       return response.data;
//     },
//   });

//   const create = useMutation({
//     mutationFn: async (data: any) => {
//       const response = await client.post(API_ENDPOINTS.PAYROLL_RUNS, data);
//       return response.data;
//     },
//   });

//   const calculate = useMutation({
//     mutationFn: async (id: number) => {
//       const response = await client.post(
//         `${API_ENDPOINTS.PAYROLL_RUNS}${id}/calculate/`
//       );
//       return response.data;
//     },
//   });

//   return { ...query, create, calculate };
// };

export const usePolicies = () => {
  const list = useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const response = await client.get(API_ENDPOINTS.POLICIES);
      return response.data;
    },
  });

  const upload = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await client.post(API_ENDPOINTS.POLICIES, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      list.refetch();
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`${API_ENDPOINTS.POLICIES}${id}/`);
    },
    onSuccess: () => {
      list.refetch();
    },
  });

  return {
    policies: list.data,
    isLoading: list.isLoading,
    isUploading: upload.isPending,
    isDeleting: remove.isPending,
    error: list.error,
    upload: upload,
    remove: remove,
  };
};

export const useDeviceSessions = () => {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ['device-sessions'],
    queryFn: async () => {
      const response = await client.get(API_ENDPOINTS.SESSIONS);
      return response.data;
    },
  });

  const logoutDevice = useMutation({
    mutationFn: async (jti: string) => {
      const response = await client.post(API_ENDPOINTS.LOGOUT_DEVICE, { jti });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-sessions'] });
    },
  });

  const logoutAllOthers = useMutation({
    mutationFn: async () => {
      const response = await client.post(API_ENDPOINTS.LOGOUT_ALL_OTHERS);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-sessions'] });
    },
  });

  return {
    sessions: list.data || [],
    isLoading: list.isLoading,
    error: list.error,
    refetch: list.refetch,
    logoutDevice,
    logoutAllOthers,
  };
};

