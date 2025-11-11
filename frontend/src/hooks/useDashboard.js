import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/api';
import { queryKeys } from '../config/queryClient';

// Get dashboard statistics
export const useDashboardStats = (role) => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(role),
    queryFn: () => dashboardApi.getStats(role),
    enabled: !!role,
    staleTime: 3 * 60 * 1000, // 3 minutes - dashboard data is relatively stable
    select: (data) => data?.data,
  });
};

// Get dashboard charts data
export const useDashboardCharts = (role, period = 'month') => {
  return useQuery({
    queryKey: queryKeys.dashboard.charts(role, period),
    queryFn: () => dashboardApi.getCharts(role, period),
    enabled: !!role,
    staleTime: 5 * 60 * 1000, // 5 minutes - chart data is more stable
    select: (data) => data?.data,
  });
};