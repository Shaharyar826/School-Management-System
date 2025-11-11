import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teachersApi } from '../services/api';
import { queryKeys, invalidateQueries } from '../config/queryClient';
import { toast } from 'react-toastify';
import { useDebounce } from './useDebounce';

// Get all teachers with client-side filtering for better performance
export const useTeachers = (filters = {}) => {
  // Debounce search input to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search || '', 300);
  
  // For basic filters, use client-side filtering
  // Only use server-side filtering for search queries
  const shouldUseServerFilter = debouncedSearch && debouncedSearch.trim().length > 0;
  
  const serverFilters = shouldUseServerFilter ? { search: debouncedSearch } : {};
  
  return useQuery({
    queryKey: queryKeys.teachers.list(serverFilters),
    queryFn: () => teachersApi.getAll(serverFilters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      let teachers = data?.data || [];
      
      // Apply client-side filters if not using server-side search
      if (!shouldUseServerFilter) {
        if (filters.subject && filters.subject !== 'all') {
          teachers = teachers.filter(teacher => teacher.subjects?.includes(filters.subject));
        }
        if (filters.department && filters.department !== 'all') {
          teachers = teachers.filter(teacher => teacher.department === filters.department);
        }
      }
      
      return teachers;
    },
  });
};

// Get single teacher by ID
export const useTeacher = (id) => {
  return useQuery({
    queryKey: queryKeys.teachers.detail(id),
    queryFn: () => teachersApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes - individual teacher data is more stable
    select: (data) => data?.data,
  });
};

// Create teacher mutation
export const useCreateTeacher = () => {
  return useMutation({
    mutationFn: teachersApi.create,
    onSuccess: (data) => {
      invalidateQueries.teachers();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Teacher created successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create teacher');
    },
  });
};

// Update teacher mutation
export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => teachersApi.update(id, data),
    onSuccess: (data, variables) => {
      invalidateQueries.teachers();
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.detail(variables.id) });
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Teacher updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update teacher');
    },
  });
};

// Delete teacher mutation
export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teachersApi.delete,
    onSuccess: (data, teacherId) => {
      queryClient.removeQueries({ queryKey: queryKeys.teachers.detail(teacherId) });
      invalidateQueries.teachers();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Teacher deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete teacher');
    },
  });
};