import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salariesApi } from '../services/api';
import { queryKeys, invalidateQueries } from '../config/queryClient';
import { toast } from 'react-toastify';

// Get all salaries with optional filters
export const useSalaries = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.salaries.list(filters),
    queryFn: () => salariesApi.getAll(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    select: (data) => data?.data || [],
  });
};

// Get single salary by ID
export const useSalary = (id) => {
  return useQuery({
    queryKey: queryKeys.salaries.detail(id),
    queryFn: () => salariesApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data,
  });
};

// Create salary mutation
export const useCreateSalary = () => {
  return useMutation({
    mutationFn: salariesApi.create,
    onSuccess: (data) => {
      invalidateQueries.salaries();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Salary record created successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create salary record');
    },
  });
};

// Update salary mutation
export const useUpdateSalary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => salariesApi.update(id, data),
    onSuccess: (data, variables) => {
      invalidateQueries.salaries();
      queryClient.invalidateQueries({ queryKey: queryKeys.salaries.detail(variables.id) });
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Salary record updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update salary record');
    },
  });
};

// Process salary payment mutation
export const useProcessSalaryPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => salariesApi.processPayment(id, data),
    onSuccess: (data, variables) => {
      invalidateQueries.salaries();
      queryClient.invalidateQueries({ queryKey: queryKeys.salaries.detail(variables.id) });
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Salary payment processed successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to process salary payment');
    },
  });
};

// Delete salary mutation
export const useDeleteSalary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: salariesApi.delete,
    onSuccess: (data, salaryId) => {
      queryClient.removeQueries({ queryKey: queryKeys.salaries.detail(salaryId) });
      invalidateQueries.salaries();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Salary record deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete salary record');
    },
  });
};