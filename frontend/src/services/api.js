import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem("accessToken", res.data.access);
        api.defaults.headers.Authorization = `Bearer ${res.data.access}`;

        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// ============== AUTHENTICATION ==============

export const authAPI = {
  login: (email, password) => api.post("/auth/login/", { email, password }),
  register: (data) => api.post("/auth/register/", data),
  refreshToken: (refresh) => api.post("/auth/token/refresh/", { refresh }),
};

// ============== EMPLOYEES ==============

// export const employeeAPI = {
//   list: (params) => api.post("/employees/", params),
//   get: (id) => api.get(`/employees/${id}/`),
//   create: (data) => api.post("/employees/", data),
//   update: (id, data) => api.put(`/employees/${id}/`, data),
//   delete: (id) => api.delete(`/employees/${id}/`),
//   changePassword: (id, data) =>
//     api.post(`/employees/${id}/change_password/`, data),
//   getTeam: (id) => api.get(`/employees/${id}/team/`),
//   getPerformanceSummary: (id) =>
//     api.get(`/employees/${id}/performance_summary/`),
//   getReports: () => api.get("/employees/reports/"),
//   getAuditLogs: () => api.get("/employees/audit_logs/"),
// };

export const employeeAPI = {
  list: (params) => api.get("/employees/", { params }), // ✅ FIXED

  get: (id) => api.get(`/employees/${id}/`),

  create: (data) => api.post("/employees/", data),

  update: (id, data) => api.put(`/employees/${id}/`, data),

  delete: (id) => api.delete(`/employees/${id}/`),

  changePassword: (id, data) =>
    api.post(`/employees/${id}/change_password/`, data),

  getTeam: (id) => api.get(`/employees/${id}/team/`),

  getPerformanceSummary: (id) =>
    api.get(`/employees/${id}/performance_summary/`),

  getReports: () => api.get("/employees/reports/"),

  getAuditLogs: () => api.get("/employees/audit_logs/"),
};
// ============== DEPARTMENTS ==============

export const departmentAPI = {
  list: () => api.get("/departments/"),
  get: (id) => api.get(`/departments/${id}/`),
  create: (data) => api.post("/departments/", data),
  update: (id, data) => api.put(`/departments/${id}/`, data),
  delete: (id) => api.delete(`/departments/${id}/`),
  getEmployees: (id) => api.get(`/departments/${id}/employees/`),
  getBudgetSummary: (id) => api.get(`/departments/${id}/budget_summary/`),
};

// ============== POSITIONS ==============

export const positionAPI = {
  list: () => api.get("/positions/"),
  get: (id) => api.get(`/positions/${id}/`),
  create: (data) => api.post("/positions/", data),
  update: (id, data) => api.put(`/positions/${id}/`, data),
  delete: (id) => api.delete(`/positions/${id}/`),
};

// ============== LEAVES ==============

export const leaveAPI = {
  list: (params) => api.get("/leaves/", { params }),
  get: (id) => api.get(`/leaves/${id}/`),
  create: (data) => api.post("/leaves/", data),
  update: (id, data) => api.put(`/leaves/${id}/`, data),
  approve: (id) => api.post(`/leaves/${id}/approve/`),
  reject: (id, data) => api.post(`/leaves/${id}/reject/`, data),
  getMyLeaves: () => api.get("/leaves/my_leaves/"),
};

// ============== LEAVE TYPES ==============

export const leaveTypeAPI = {
  list: () => api.get("/leave-types/"),
  get: (id) => api.get(`/leave-types/${id}/`),
};

// ============== ATTENDANCE ==============

export const attendanceAPI = {
  list: (params) => api.get("/attendance/", { params }),
  get: (id) => api.get(`/attendance/${id}/`),
  create: (data) => api.post("/attendance/", data),
  update: (id, data) => api.put(`/attendance/${id}/`, data),
  getMyAttendance: (params) =>
    api.get("/attendance/my_attendance/", { params }),
  getSummary: () => api.get("/attendance/summary/"),
};

// ============== BONUSES ==============

export const bonusAPI = {
  list: (params) => api.get("/bonuses/", { params }),
  get: (id) => api.get(`/bonuses/${id}/`),
  create: (data) => api.post("/bonuses/", data),
  approve: (id) => api.post(`/bonuses/${id}/approve/`),
};

// ============== SALARY ==============

export const salaryAPI = {
  list: (params) => api.get("/salaries/", { params }),
  get: (id) => api.get(`/salaries/${id}/`),
  create: (data) => api.post("/salaries/", data),
};

// ============== PERFORMANCE REVIEWS ==============

export const performanceAPI = {
  list: (params) => api.get("/performance-reviews/", { params }),
  get: (id) => api.get(`/performance-reviews/${id}/`),
  create: (data) => api.post("/performance-reviews/", data),
  update: (id, data) => api.put(`/performance-reviews/${id}/`, data),
  getEmployeeReviews: (empId) =>
    api.get(`/performance-reviews/${empId}/employee_reviews/`),
};

// ============== PROJECTS ==============

export const projectAPI = {
  list: (params) => api.get("/projects/", { params }),
  get: (id) => api.get(`/projects/${id}/`),
  create: (data) => api.post("/projects/", data),
  update: (id, data) => api.put(`/projects/${id}/`, data),
  delete: (id) => api.delete(`/projects/${id}/`),
  getTasks: (id) => api.get(`/projects/${id}/tasks/`),
};

// ============== TASKS ==============

export const taskAPI = {
  list: (params) => api.get("/tasks/", { params }),
  get: (id) => api.get(`/tasks/${id}/`),
  create: (data) => api.post("/tasks/", data),
  update: (id, data) => api.put(`/tasks/${id}/`, data),
  delete: (id) => api.delete(`/tasks/${id}/`),
  getMyTasks: () => api.get("/tasks/my_tasks/"),
  updateStatus: (id, status) =>
    api.post(`/tasks/${id}/update_status/`, { status }),
};

// ============== CHAT ==============

export const chatAPI = {
  listConversations: (params) => api.get("/chat-conversations/", { params }),
  getConversation: (id) => api.get(`/chat-conversations/${id}/`),
  createConversation: (data) => api.post("/chat-conversations/", data),
  sendMessage: (conversationId, data) =>
    api.post(`/chat-conversations/${conversationId}/send_message/`, data),
  markAsRead: (conversationId) =>
    api.post(`/chat-conversations/${conversationId}/mark_as_read/`),
};

// ============== NOTIFICATIONS ==============

export const notificationAPI = {
  list: (params) => api.get("/notifications/", { params }),
  get: (id) => api.get(`/notifications/${id}/`),
  getUnreadCount: () => api.get("/notifications/unread_count/"),
  markAsRead: (id) => api.post(`/notifications/${id}/mark_as_read/`),
  markAllAsRead: () => api.post("/notifications/mark_all_as_read/"),
};

// ============== ROLES & PERMISSIONS ==============

export const roleAPI = {
  list: () => api.get("/roles/"),
  get: (id) => api.get(`/roles/${id}/`),
  create: (data) => api.post("/roles/", data),
  update: (id, data) => api.put(`/roles/${id}/`, data),
};

export const permissionAPI = {
  list: () => api.get("/permissions/"),
  get: (id) => api.get(`/permissions/${id}/`),
};

export default api;
