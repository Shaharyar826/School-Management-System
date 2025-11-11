import axios from '../config/axios';

// Base API service class
class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async get(endpoint = '', params = {}) {
    const response = await axios.get(`${this.baseUrl}${endpoint}`, { params });
    return response.data;
  }

  async post(endpoint = '', data = {}) {
    const response = await axios.post(`${this.baseUrl}${endpoint}`, data);
    return response.data;
  }

  async put(endpoint = '', data = {}) {
    const response = await axios.put(`${this.baseUrl}${endpoint}`, data);
    return response.data;
  }

  async delete(endpoint = '') {
    const response = await axios.delete(`${this.baseUrl}${endpoint}`);
    return response.data;
  }
}

// Students API
export const studentsApi = {
  getAll: (params = {}) => axios.get('/api/students', { params }).then(res => res.data),
  getById: (id) => axios.get(`/api/students/${id}`).then(res => res.data),
  create: (data) => axios.post('/api/students', data).then(res => res.data),
  update: (id, data) => axios.put(`/api/students/${id}`, data).then(res => res.data),
  delete: (id) => axios.delete(`/api/students/${id}`).then(res => res.data),
};

// Teachers API
export const teachersApi = {
  getAll: (params = {}) => axios.get('/api/teachers', { params }).then(res => res.data),
  getById: (id) => axios.get(`/api/teachers/${id}`).then(res => res.data),
  create: (data) => axios.post('/api/teachers', data).then(res => res.data),
  update: (id, data) => axios.put(`/api/teachers/${id}`, data).then(res => res.data),
  delete: (id) => axios.delete(`/api/teachers/${id}`).then(res => res.data),
};

// Fees API
export const feesApi = {
  getAll: (params = {}) => axios.get('/api/fees', { params }).then(res => res.data),
  getById: (id) => axios.get(`/api/fees/${id}`).then(res => res.data),
  getStudentFees: (studentId, params = {}) => axios.get(`/api/fees/student/${studentId}`, { params }).then(res => res.data),
  create: (data) => axios.post('/api/fees', data).then(res => res.data),
  update: (id, data) => axios.put(`/api/fees/${id}`, data).then(res => res.data),
  delete: (id) => axios.delete(`/api/fees/${id}`).then(res => res.data),
  processPayment: (id, data) => axios.post(`/api/fees/${id}/process-payment`, data).then(res => res.data),
  generateMonthly: (data) => axios.post('/api/fees/generate-monthly', data).then(res => res.data),
  cleanupOrphaned: () => axios.delete('/api/fees/cleanup-orphaned').then(res => res.data),
};

// Attendance API
export const attendanceApi = {
  getAll: (params = {}) => axios.get('/api/attendance', { params }).then(res => res.data),
  getStudentAttendance: (studentId, params = {}) => axios.get(`/api/attendance/student/${studentId}`, { params }).then(res => res.data),
  mark: (data) => axios.post('/api/attendance', data).then(res => res.data),
  update: (id, data) => axios.put(`/api/attendance/${id}`, data).then(res => res.data),
  delete: (id) => axios.delete(`/api/attendance/${id}`).then(res => res.data),
};

// Dashboard API
export const dashboardApi = {
  getStats: (role) => {
    const endpoint = role === 'admin' || role === 'principal' ? '/api/dashboard/admin-metrics' :
                    role === 'teacher' ? '/api/dashboard/teacher-metrics' :
                    role === 'student' ? '/api/dashboard/student-metrics' :
                    '/api/dashboard/metrics';
    return axios.get(endpoint).then(res => res.data);
  },
  getCharts: (role, period = 'month') => {
    // Use the same endpoint as stats for now since charts data is included
    const endpoint = role === 'admin' || role === 'principal' ? '/api/dashboard/admin-metrics' :
                    role === 'teacher' ? '/api/dashboard/teacher-metrics' :
                    role === 'student' ? '/api/dashboard/student-metrics' :
                    '/api/dashboard/metrics';
    return axios.get(endpoint).then(res => res.data);
  },
};

// Filters API (for classes, sections, etc.)
export const filtersApi = {
  getClasses: (userType = 'student') => axios.get(`/api/filters/classes?userType=${userType}`).then(res => res.data),
  getSections: (classId, userType = 'student') => axios.get(`/api/filters/sections?class=${classId}&userType=${userType}`).then(res => res.data),
};

// Salaries API
export const salariesApi = {
  getAll: (params = {}) => axios.get('/api/salaries', { params }).then(res => res.data),
  getById: (id) => axios.get(`/api/salaries/${id}`).then(res => res.data),
  create: (data) => axios.post('/api/salaries', data).then(res => res.data),
  update: (id, data) => axios.put(`/api/salaries/${id}`, data).then(res => res.data),
  delete: (id) => axios.delete(`/api/salaries/${id}`).then(res => res.data),
  processPayment: (id, data) => axios.post(`/api/salaries/${id}/process-payment`, data).then(res => res.data),
};

// Admin Staff API
export const adminStaffApi = {
  getAll: (params = {}) => axios.get('/api/admin-staff', { params }).then(res => res.data),
  getById: (id) => axios.get(`/api/admin-staff/${id}`).then(res => res.data),
  create: (data) => axios.post('/api/admin-staff', data).then(res => res.data),
  update: (id, data) => axios.put(`/api/admin-staff/${id}`, data).then(res => res.data),
  delete: (id) => axios.delete(`/api/admin-staff/${id}`).then(res => res.data),
};

// Support Staff API
export const supportStaffApi = {
  getAll: (params = {}) => axios.get('/api/support-staff', { params }).then(res => res.data),
  getById: (id) => axios.get(`/api/support-staff/${id}`).then(res => res.data),
  create: (data) => axios.post('/api/support-staff', data).then(res => res.data),
  update: (id, data) => axios.put(`/api/support-staff/${id}`, data).then(res => res.data),
  delete: (id) => axios.delete(`/api/support-staff/${id}`).then(res => res.data),
};

// Meetings API
export const meetingsApi = {
  getAll: (params = {}) => axios.get('/api/meetings', { params }).then(res => res.data),
  getById: (id) => axios.get(`/api/meetings/${id}`).then(res => res.data),
  create: (data) => axios.post('/api/meetings', data).then(res => res.data),
  update: (id, data) => axios.put(`/api/meetings/${id}`, data).then(res => res.data),
  delete: (id) => axios.delete(`/api/meetings/${id}`).then(res => res.data),
};

// Notifications API
export const notificationsApi = {
  getAll: (params = {}) => axios.get('/api/notifications', { params }).then(res => res.data),
  getUnread: () => axios.get('/api/notifications/unread').then(res => res.data),
  markAsRead: (id) => axios.put(`/api/notifications/${id}/read`).then(res => res.data),
  markAllAsRead: () => axios.put('/api/notifications/mark-all-read').then(res => res.data),
};

// Events and Notices API
export const eventsNoticesApi = {
  getAll: (params = {}) => axios.get('/api/events-notices', { params }).then(res => res.data),
  getById: (id) => axios.get(`/api/events-notices/${id}`).then(res => res.data),
  create: (data) => axios.post('/api/events-notices', data).then(res => res.data),
  update: (id, data) => axios.put(`/api/events-notices/${id}`, data).then(res => res.data),
  delete: (id) => axios.delete(`/api/events-notices/${id}`).then(res => res.data),
};