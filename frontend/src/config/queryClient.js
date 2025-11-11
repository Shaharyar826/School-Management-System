import { QueryClient } from '@tanstack/react-query';

// Create a query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 15 minutes
      gcTime: 15 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: true,
      // Only refetch if data is stale
      refetchOnMount: 'ifStale',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Students
  students: {
    all: () => ['students'],
    lists: () => [...queryKeys.students.all(), 'list'],
    list: (filters = {}) => {
      // Create stable query key by sorting and stringifying filters
      const stableFilters = Object.keys(filters)
        .sort()
        .reduce((acc, key) => {
          if (filters[key] !== '' && filters[key] != null) {
            acc[key] = filters[key];
          }
          return acc;
        }, {});
      return [...queryKeys.students.lists(), stableFilters];
    },
    details: () => [...queryKeys.students.all(), 'detail'],
    detail: (id) => [...queryKeys.students.details(), id],
  },
  
  // Teachers
  teachers: {
    all: () => ['teachers'],
    lists: () => [...queryKeys.teachers.all(), 'list'],
    list: (filters = {}) => {
      const stableFilters = Object.keys(filters)
        .sort()
        .reduce((acc, key) => {
          if (filters[key] !== '' && filters[key] != null) {
            acc[key] = filters[key];
          }
          return acc;
        }, {});
      return [...queryKeys.teachers.lists(), stableFilters];
    },
    details: () => [...queryKeys.teachers.all(), 'detail'],
    detail: (id) => [...queryKeys.teachers.details(), id],
  },
  
  // Fees
  fees: {
    all: () => ['fees'],
    lists: () => [...queryKeys.fees.all(), 'list'],
    list: (filters = {}) => {
      // Create stable query key by sorting and stringifying filters
      const stableFilters = Object.keys(filters)
        .sort()
        .reduce((acc, key) => {
          if (filters[key] !== '' && filters[key] != null) {
            acc[key] = filters[key];
          }
          return acc;
        }, {});
      return [...queryKeys.fees.lists(), stableFilters];
    },
    details: () => [...queryKeys.fees.all(), 'detail'],
    detail: (id) => [...queryKeys.fees.details(), id],
    studentFees: (studentId, filters = {}) => {
      const stableFilters = Object.keys(filters)
        .sort()
        .reduce((acc, key) => {
          if (filters[key] !== '' && filters[key] != null) {
            acc[key] = filters[key];
          }
          return acc;
        }, {});
      return [...queryKeys.fees.all(), 'student', studentId, stableFilters];
    },
  },
  
  // Attendance
  attendance: {
    all: () => ['attendance'],
    lists: () => [...queryKeys.attendance.all(), 'list'],
    list: (filters = {}) => {
      const stableFilters = Object.keys(filters)
        .sort()
        .reduce((acc, key) => {
          if (filters[key] !== '' && filters[key] != null) {
            acc[key] = filters[key];
          }
          return acc;
        }, {});
      return [...queryKeys.attendance.lists(), stableFilters];
    },
    student: (studentId, filters = {}) => {
      const stableFilters = Object.keys(filters)
        .sort()
        .reduce((acc, key) => {
          if (filters[key] !== '' && filters[key] != null) {
            acc[key] = filters[key];
          }
          return acc;
        }, {});
      return [...queryKeys.attendance.all(), 'student', studentId, stableFilters];
    },
  },
  
  // Dashboard
  dashboard: {
    all: () => ['dashboard'],
    stats: (role) => [...queryKeys.dashboard.all(), 'stats', role],
    charts: (role, period) => [...queryKeys.dashboard.all(), 'charts', role, period],
  },
  
  // Classes and Sections (filters)
  filters: {
    all: () => ['filters'],
    classes: (userType) => [...queryKeys.filters.all(), 'classes', userType],
    sections: (classId, userType) => [...queryKeys.filters.all(), 'sections', classId, userType],
  },
  
  // Salaries
  salaries: {
    all: () => ['salaries'],
    lists: () => [...queryKeys.salaries.all(), 'list'],
    list: (filters = {}) => {
      const stableFilters = Object.keys(filters)
        .sort()
        .reduce((acc, key) => {
          if (filters[key] !== '' && filters[key] != null) {
            acc[key] = filters[key];
          }
          return acc;
        }, {});
      return [...queryKeys.salaries.lists(), stableFilters];
    },
    details: () => [...queryKeys.salaries.all(), 'detail'],
    detail: (id) => [...queryKeys.salaries.details(), id],
  },
  
  // Admin Staff
  adminStaff: {
    all: () => ['adminStaff'],
    lists: () => [...queryKeys.adminStaff.all(), 'list'],
    list: (filters = {}) => {
      const stableFilters = Object.keys(filters)
        .sort()
        .reduce((acc, key) => {
          if (filters[key] !== '' && filters[key] != null) {
            acc[key] = filters[key];
          }
          return acc;
        }, {});
      return [...queryKeys.adminStaff.lists(), stableFilters];
    },
    details: () => [...queryKeys.adminStaff.all(), 'detail'],
    detail: (id) => [...queryKeys.adminStaff.details(), id],
  },
  
  // Support Staff
  supportStaff: {
    all: () => ['supportStaff'],
    lists: () => [...queryKeys.supportStaff.all(), 'list'],
    list: (filters = {}) => {
      const stableFilters = Object.keys(filters)
        .sort()
        .reduce((acc, key) => {
          if (filters[key] !== '' && filters[key] != null) {
            acc[key] = filters[key];
          }
          return acc;
        }, {});
      return [...queryKeys.supportStaff.lists(), stableFilters];
    },
    details: () => [...queryKeys.supportStaff.all(), 'detail'],
    detail: (id) => [...queryKeys.supportStaff.details(), id],
  },
  
  // Meetings
  meetings: {
    all: () => ['meetings'],
    lists: () => [...queryKeys.meetings.all(), 'list'],
    list: (filters = {}) => {
      const stableFilters = Object.keys(filters)
        .sort()
        .reduce((acc, key) => {
          if (filters[key] !== '' && filters[key] != null) {
            acc[key] = filters[key];
          }
          return acc;
        }, {});
      return [...queryKeys.meetings.lists(), stableFilters];
    },
    details: () => [...queryKeys.meetings.all(), 'detail'],
    detail: (id) => [...queryKeys.meetings.details(), id],
  },
  
  // Notifications
  notifications: {
    all: () => ['notifications'],
    lists: () => [...queryKeys.notifications.all(), 'list'],
    list: (filters = {}) => {
      const stableFilters = Object.keys(filters)
        .sort()
        .reduce((acc, key) => {
          if (filters[key] !== '' && filters[key] != null) {
            acc[key] = filters[key];
          }
          return acc;
        }, {});
      return [...queryKeys.notifications.lists(), stableFilters];
    },
    unread: () => [...queryKeys.notifications.all(), 'unread'],
  },
  
  // Events and Notices
  eventsNotices: {
    all: () => ['eventsNotices'],
    lists: () => [...queryKeys.eventsNotices.all(), 'list'],
    list: (filters = {}) => {
      const stableFilters = Object.keys(filters)
        .sort()
        .reduce((acc, key) => {
          if (filters[key] !== '' && filters[key] != null) {
            acc[key] = filters[key];
          }
          return acc;
        }, {});
      return [...queryKeys.eventsNotices.lists(), stableFilters];
    },
    details: () => [...queryKeys.eventsNotices.all(), 'detail'],
    detail: (id) => [...queryKeys.eventsNotices.details(), id],
  },
};

// Cache invalidation helpers
export const invalidateQueries = {
  // Invalidate all student-related queries
  students: () => queryClient.invalidateQueries({ queryKey: queryKeys.students.all() }),
  
  // Invalidate all teacher-related queries
  teachers: () => queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all() }),
  
  // Invalidate all fee-related queries
  fees: () => queryClient.invalidateQueries({ queryKey: queryKeys.fees.all() }),
  
  // Invalidate all attendance-related queries
  attendance: () => queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all() }),
  
  // Invalidate dashboard queries
  dashboard: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() }),
  
  // Invalidate filter queries
  filters: () => queryClient.invalidateQueries({ queryKey: queryKeys.filters.all() }),
  
  // Invalidate all queries (use sparingly)
  all: () => queryClient.invalidateQueries(),
};