import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '../services/api';
import { queryKeys, invalidateQueries } from '../config/queryClient';
import { toast } from 'react-toastify';
import { useDebounce } from './useDebounce';

// Get all students with client-side filtering for better caching
export const useStudents = (filters = {}) => {
  // Use a single cache key for all students to enable client-side filtering
  const cacheKey = ['students', 'all'];
  
  return useQuery({
    queryKey: cacheKey,
    queryFn: () => studentsApi.getAll({ viewAll: true, limit: 1000 }), // Fetch all students
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache for better performance
    select: (data) => {
      let students = data?.data || [];
      
      // Apply client-side filters
      if (filters.class && filters.class !== 'all') {
        students = students.filter(student => student.class === filters.class);
      }
      if (filters.section && filters.section !== 'all') {
        students = students.filter(student => student.section === filters.section);
      }
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim();
        students = students.filter(student => 
          student.user?.name?.toLowerCase().includes(searchTerm) ||
          student.rollNumber?.toLowerCase().includes(searchTerm) ||
          student.class?.toLowerCase().includes(searchTerm) ||
          student.section?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply pagination client-side
      const page = filters.page || 1;
      const limit = filters.limit || 25;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedStudents = students.slice(startIndex, endIndex);
      
      return {
        students: paginatedStudents,
        totalCount: students.length,
        allStudents: students, // Include all filtered students for other operations
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(students.length / limit)
        }
      };
    },
  });
};

// Get single student by ID
export const useStudent = (id) => {
  return useQuery({
    queryKey: queryKeys.students.detail(id),
    queryFn: () => studentsApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes - individual student data is more stable
    select: (data) => data?.data,
  });
};

// Get students with pagination (for components that need pagination info)
export const useStudentsPaginated = (filters = {}) => {
  return useStudents(filters);
};

// Get all students without pagination (for dropdowns, etc.)
export const useAllStudents = () => {
  return useQuery({
    queryKey: ['students', 'all'],
    queryFn: () => studentsApi.getAll({ viewAll: true, limit: 1000 }),
    staleTime: 10 * 60 * 1000,
    select: (data) => data?.data || [],
  });
};

// Create student mutation
export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: studentsApi.create,
    onSuccess: (data) => {
      // Invalidate and refetch students list
      invalidateQueries.students();
      invalidateQueries.dashboard();
      invalidateQueries.filters();
      
      toast.success(data?.message || 'Student created successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create student');
    },
  });
};

// Update student mutation
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => studentsApi.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate students list and specific student detail
      invalidateQueries.students();
      queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(variables.id) });
      invalidateQueries.dashboard();
      
      toast.success(data?.message || 'Student updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update student');
    },
  });
};

// Delete student mutation
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: studentsApi.delete,
    onSuccess: (data, studentId) => {
      // Remove student from cache and invalidate lists
      queryClient.removeQueries({ queryKey: queryKeys.students.detail(studentId) });
      invalidateQueries.students();
      invalidateQueries.dashboard();
      invalidateQueries.fees(); // Student deletion affects fees
      
      toast.success(data?.message || 'Student deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete student');
    },
  });
};

// Optimistic update helper for student data
export const useOptimisticStudentUpdate = () => {
  const queryClient = useQueryClient();
  
  return (studentId, updatedData) => {
    queryClient.setQueryData(
      queryKeys.students.detail(studentId),
      (oldData) => ({
        ...oldData,
        data: { ...oldData?.data, ...updatedData }
      })
    );
  };
};