import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feesApi } from '../services/api';
import { queryKeys, invalidateQueries } from '../config/queryClient';
import { toast } from 'react-toastify';

// Get all fees with client-side filtering for better caching
export const useFees = (filters = {}) => {
  // Use a single cache key for all fees to enable client-side filtering
  const cacheKey = ['fees', 'all'];
  
  return useQuery({
    queryKey: cacheKey,
    queryFn: () => feesApi.getAll({}), // Fetch all fees without server-side filters
    staleTime: 5 * 60 * 1000, // 5 minutes - longer cache for better performance
    select: (data) => {
      let fees = data?.data || [];
      
      // Apply client-side filters
      if (filters.class && filters.class !== 'all') {
        fees = fees.filter(fee => fee.student?.class === filters.class);
      }
      if (filters.section && filters.section !== 'all') {
        fees = fees.filter(fee => fee.student?.section === filters.section);
      }
      if (filters.feeType && filters.feeType !== 'all') {
        fees = fees.filter(fee => fee.feeType === filters.feeType);
      }
      if (filters.status && filters.status !== 'all') {
        fees = fees.filter(fee => fee.status === filters.status);
      }
      if (filters.month && filters.year) {
        fees = fees.filter(fee => {
          const feeDate = new Date(fee.dueDate);
          return feeDate.getMonth() + 1 === filters.month && feeDate.getFullYear() === filters.year;
        });
      }
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim();
        fees = fees.filter(fee => 
          fee.student?.user?.name?.toLowerCase().includes(searchTerm) ||
          fee.student?.rollNumber?.toLowerCase().includes(searchTerm) ||
          fee.description?.toLowerCase().includes(searchTerm)
        );
      }
      
      return fees;
    },
  });
};

// Get single fee by ID
export const useFee = (id) => {
  return useQuery({
    queryKey: queryKeys.fees.detail(id),
    queryFn: () => feesApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data,
  });
};

// Get student fees
export const useStudentFees = (studentId, filters = {}) => {
  return useQuery({
    queryKey: queryKeys.fees.studentFees(studentId, filters),
    queryFn: () => feesApi.getStudentFees(studentId, filters),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data?.data || [],
  });
};



// Create fee mutation
export const useCreateFee = () => {
  return useMutation({
    mutationFn: feesApi.create,
    onSuccess: (data) => {
      invalidateQueries.fees();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Fee record created successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create fee record');
    },
  });
};

// Update fee mutation
export const useUpdateFee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => feesApi.update(id, data),
    onSuccess: (data, variables) => {
      invalidateQueries.fees();
      queryClient.invalidateQueries({ queryKey: queryKeys.fees.detail(variables.id) });
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Fee record updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update fee record');
    },
  });
};

// Process fee payment mutation
export const useProcessFeePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => feesApi.processPayment(id, data),
    onSuccess: (data, variables) => {
      invalidateQueries.fees();
      queryClient.invalidateQueries({ queryKey: queryKeys.fees.detail(variables.id) });
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Fee payment processed successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to process fee payment');
    },
  });
};

// Generate monthly fees mutation
export const useGenerateMonthlyFees = () => {
  return useMutation({
    mutationFn: feesApi.generateMonthly,
    onSuccess: (data) => {
      invalidateQueries.fees();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Monthly fees generated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to generate monthly fees');
    },
  });
};

// Cleanup orphaned fees mutation
export const useCleanupOrphanedFees = () => {
  return useMutation({
    mutationFn: feesApi.cleanupOrphaned,
    onSuccess: (data) => {
      invalidateQueries.fees();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Orphaned fees cleaned up successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to cleanup orphaned fees');
    },
  });
};

// Delete fee mutation
export const useDeleteFee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: feesApi.delete,
    onSuccess: (data, feeId) => {
      queryClient.removeQueries({ queryKey: queryKeys.fees.detail(feeId) });
      invalidateQueries.fees();
      invalidateQueries.dashboard();
      toast.success(data?.message || 'Fee record deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete fee record');
    },
  });
};