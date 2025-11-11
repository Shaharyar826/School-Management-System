import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportStaffApi } from '../services/api';
import { queryKeys, invalidateQueries } from '../config/queryClient';
import { toast } from 'react-toastify';

export const useSupportStaff = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.supportStaff.list(filters),
    queryFn: () => supportStaffApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data || [],
  });
};

export const useSupportStaffMember = (id) => {
  return useQuery({
    queryKey: queryKeys.supportStaff.detail(id),
    queryFn: () => supportStaffApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data,
  });
};

export const useCreateSupportStaff = () => {
  return useMutation({
    mutationFn: supportStaffApi.create,
    onSuccess: (data) => {
      invalidateQueries.supportStaff();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Support staff created successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create support staff');
    },
  });
};

export const useUpdateSupportStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => supportStaffApi.update(id, data),
    onSuccess: (data, variables) => {
      invalidateQueries.supportStaff();
      queryClient.invalidateQueries({ queryKey: queryKeys.supportStaff.detail(variables.id) });
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Support staff updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update support staff');
    },
  });
};

export const useDeleteSupportStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: supportStaffApi.delete,
    onSuccess: (data, staffId) => {
      queryClient.removeQueries({ queryKey: queryKeys.supportStaff.detail(staffId) });
      invalidateQueries.supportStaff();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Support staff deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete support staff');
    },
  });
};