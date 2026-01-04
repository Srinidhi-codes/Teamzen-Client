import { useQuery, useMutation } from "@tanstack/react-query";
import client from "./client";
import { API_ENDPOINTS } from "./endpoints";

/* ---------------- AUTH ---------------- */

export const useAuth = () => {
  const login = useMutation({
    mutationFn: async (data: any) => {
      const response = await client.post(API_ENDPOINTS.LOGIN, data, {
        withCredentials: true,
      });
      return response.data;
    },
  });

  const register = useMutation({
    mutationFn: async (data: any) => {
      const response = await client.post(API_ENDPOINTS.REGISTER, data);
      return response.data;
    },
  });

  return { login, register };
};

/* ---------------- USER ---------------- */

export const useUser = () => {
  const query = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await client.get(API_ENDPOINTS.USER_ME);
      return response.data;
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
      const response = await client.put(
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

export const useLeaveRequests = () => {
  const query = useQuery({
    queryKey: ["leaveRequests"],
    queryFn: async () => {
      const response = await client.get(API_ENDPOINTS.LEAVE_REQUESTS);
      return response.data;
    },
  });

  const create = useMutation({
    mutationFn: async (data: any) => {
      const response = await client.post(API_ENDPOINTS.LEAVE_REQUESTS, data);
      return response.data;
    },
  });

  const approve = useMutation({
    mutationFn: async ({ id, comments }: { id: number; comments: string }) => {
      const response = await client.post(
        `${API_ENDPOINTS.LEAVE_REQUESTS}${id}/approve/`,
        { comments }
      );
      return response.data;
    },
  });

  return {
    ...query,
    create,
    approve,
  };
};

/* ---------------- LEAVE BALANCES ---------------- */

export const useLeaveBalances = () => {
  const query = useQuery({
    queryKey: ["leaveBalances"],
    queryFn: async () => {
      const response = await client.get(API_ENDPOINTS.LEAVE_BALANCES);
      return response.data;
    },
  });

  return {
    balances: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};

/* ---------------- ATTENDANCE ---------------- */

export const useAttendance = () => {
  const checkIn = useMutation({
    mutationFn: async (data: any) => {
      const response = await client.post(API_ENDPOINTS.CHECK_IN, data);
      return response.data;
    },
  });

  const checkOut = useMutation({
    mutationFn: async (data: any) => {
      const response = await client.post(API_ENDPOINTS.CHECK_OUT, data);
      return response.data;
    },
  });

  const records = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const response = await client.get(API_ENDPOINTS.ATTENDANCE);
      return response.data;
    },
  });

  return {
    checkIn,
    checkOut,
    records: records.data,
    isLoading: records.isLoading,
  };
};

/* ---------------- PAYROLL ---------------- */

export const usePayrollRuns = () => {
  const query = useQuery({
    queryKey: ["payrollRuns"],
    queryFn: async () => {
      const response = await client.get(API_ENDPOINTS.PAYROLL_RUNS);
      return response.data;
    },
  });

  const create = useMutation({
    mutationFn: async (data: any) => {
      const response = await client.post(API_ENDPOINTS.PAYROLL_RUNS, data);
      return response.data;
    },
  });

  const calculate = useMutation({
    mutationFn: async (id: number) => {
      const response = await client.post(
        `${API_ENDPOINTS.PAYROLL_RUNS}${id}/calculate/`
      );
      return response.data;
    },
  });

  return { ...query, create, calculate };
};
