import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsNoticesApi } from '../services/api';
import { queryKeys, invalidateQueries } from '../config/queryClient';
import { toast } from 'react-toastify';

export const useEventsNotices = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.eventsNotices.list(filters),
    queryFn: () => eventsNoticesApi.getAll(filters),
    staleTime: 3 * 60 * 1000,
    select: (data) => data?.data || [],
  });
};

export const useEventNotice = (id) => {
  return useQuery({
    queryKey: queryKeys.eventsNotices.detail(id),
    queryFn: () => eventsNoticesApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data,
  });
};

export const useCreateEventNotice = () => {
  return useMutation({
    mutationFn: eventsNoticesApi.create,
    onSuccess: (data) => {
      invalidateQueries.eventsNotices();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Event/Notice created successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create event/notice');
    },
  });
};

export const useUpdateEventNotice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => eventsNoticesApi.update(id, data),
    onSuccess: (data, variables) => {
      invalidateQueries.eventsNotices();
      queryClient.invalidateQueries({ queryKey: queryKeys.eventsNotices.detail(variables.id) });
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Event/Notice updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update event/notice');
    },
  });
};

export const useDeleteEventNotice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventsNoticesApi.delete,
    onSuccess: (data, eventNoticeId) => {
      queryClient.removeQueries({ queryKey: queryKeys.eventsNotices.detail(eventNoticeId) });
      invalidateQueries.eventsNotices();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Event/Notice deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete event/notice');
    },
  });
};