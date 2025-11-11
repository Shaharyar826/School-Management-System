import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminStaffApi } from '../services/api';
import { queryKeys, invalidateQueries } from '../config/queryClient';
import { toast } from 'react-toastify';

export const useAdminStaff = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.adminStaff.list(filters),
    queryFn: () => adminStaffApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data || [],
  });
};

export const useAdminStaffMember = (id) => {
  return useQuery({
    queryKey: queryKeys.adminStaff.detail(id),
    queryFn: () => adminStaffApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data,
  });
};

export const useCreateAdminStaff = () => {
  return useMutation({
    mutationFn: adminStaffApi.create,
    onSuccess: (data) => {
      invalidateQueries.adminStaff();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Admin staff created successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create admin staff');
    },
  });
};

export const useUpdateAdminStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => adminStaffApi.update(id, data),
    onSuccess: (data, variables) => {
      invalidateQueries.adminStaff();
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStaff.detail(variables.id) });
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Admin staff updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update admin staff');
    },
  });
};

export const useDeleteAdminStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminStaffApi.delete,
    onSuccess: (data, staffId) => {
      queryClient.removeQueries({ queryKey: queryKeys.adminStaff.detail(staffId) });
      invalidateQueries.adminStaff();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Admin staff deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete admin staff');
    },
  });
};