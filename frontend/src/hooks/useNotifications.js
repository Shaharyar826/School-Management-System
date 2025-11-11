import { useQuery, useMutation } from '@tanstack/react-query';
import { notificationsApi } from '../services/api';
import { queryKeys, invalidateQueries } from '../config/queryClient';
import { toast } from 'react-toastify';

export const useNotifications = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () => notificationsApi.getAll(filters),
    staleTime: 1 * 60 * 1000, // 1 minute - notifications are time-sensitive
    select: (data) => data?.data || [],
  });
};

export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: () => notificationsApi.getUnread(),
    staleTime: 30 * 1000, // 30 seconds - very fresh data needed
    select: (data) => data?.data || [],
  });
};

export const useMarkNotificationAsRead = () => {
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      invalidateQueries.notifications();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to mark notification as read');
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: (data) => {
      invalidateQueries.notifications();
      toast.success(data?.message || 'All notifications marked as read');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to mark all notifications as read');
    },
  });
};