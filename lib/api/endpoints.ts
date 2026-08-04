export const API_ENDPOINTS = {
  // Auth
  REGISTER: "/auth/register/",
  LOGIN: "/auth/login/",
  LOGOUT: "/users/logout/",
  REFRESH: "/auth/refresh/",
  
  // New Auth Endpoints
  OTP_SEND: "/users/auth/otp/send/",
  OTP_VERIFY: "/users/auth/otp/verify/",
  TOTP_SETUP: "/users/auth/totp/setup/",
  TOTP_ENABLE: "/users/auth/totp/enable/",
  TOTP_DISABLE: "/users/auth/totp/disable/",
  TOTP_VERIFY: "/users/auth/totp/verify/",
  GOOGLE_LOGIN: "/users/auth/google/",
  SESSIONS: "/users/auth/sessions/",
  LOGOUT_DEVICE: "/users/auth/sessions/logout-device/",
  LOGOUT_ALL_OTHERS: "/users/auth/sessions/logout-all-others/",

  // Users
  USERS: "/users/",
  USER_ME: "/users/me/",
  USER_UPDATE: "/users/update_profile/",

  // Leaves
  LEAVE_TYPES: "/leaves/types/",
  LEAVE_REQUESTS: "/leaves/requests/",
  LEAVE_BALANCES: "/leaves/balance/",

  // Attendance
  ATTENDANCE: "/attendance/records/",
  CHECK_IN: "/attendance/records/check_in/",
  CHECK_OUT: "/attendance/records/check_out/",

  // Payroll
  SALARY_STRUCTURES: "/payroll/salary-structures/",
  PAYROLL_RUNS: "/payroll/runs/",
  PAYROLL_RECORDS: "/payroll/records/",
  // AI
  POLICIES: "/ai/policies/",
  CHAT: "/ai/chat/",
  FORMAT_TEXT: "/ai/format-text/",
  FEEDBACK_ATTACHMENTS: "/feedback/attachments/",

  // Password Reset
  PASSWORD_RESET_REQUEST: "/users/password-reset/",
  PASSWORD_RESET_CONFIRM: "/users/password-reset-confirm/",
};
