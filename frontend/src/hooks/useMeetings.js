import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingsApi } from '../services/api';
import { queryKeys, invalidateQueries } from '../config/queryClient';
import { toast } from 'react-toastify';

export const useMeetings = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.meetings.list(filters),
    queryFn: () => meetingsApi.getAll(filters),
    staleTime: 3 * 60 * 1000,
    select: (data) => data?.data || [],
  });
};

export const useMeeting = (id) => {
  return useQuery({
    queryKey: queryKeys.meetings.detail(id),
    queryFn: () => meetingsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data,
  });
};

export const useCreateMeeting = () => {
  return useMutation({
    mutationFn: meetingsApi.create,
    onSuccess: (data) => {
      invalidateQueries.meetings();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Meeting created successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create meeting');
    },
  });
};

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => meetingsApi.update(id, data),
    onSuccess: (data, variables) => {
      invalidateQueries.meetings();
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.detail(variables.id) });
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Meeting updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update meeting');
    },
  });
};

export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: meetingsApi.delete,
    onSuccess: (data, meetingId) => {
      queryClient.removeQueries({ queryKey: queryKeys.meetings.detail(meetingId) });
      invalidateQueries.meetings();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Meeting deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete meeting');
    },
  });
};