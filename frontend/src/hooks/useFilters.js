import { useQuery } from '@tanstack/react-query';
import { filtersApi } from '../services/api';
import { queryKeys } from '../config/queryClient';

// Get classes for filtering
export const useClasses = (userType = 'student') => {
  return useQuery({
    queryKey: queryKeys.filters.classes(userType),
    queryFn: () => filtersApi.getClasses(userType),
    staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
    select: (data) => data?.data || [],
  });
};

// Get sections for a specific class
export const useSections = (classId, userType = 'student') => {
  return useQuery({
    queryKey: queryKeys.filters.sections(classId, userType),
    queryFn: () => filtersApi.getSections(classId, userType),
    enabled: !!classId && classId !== 'all',
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => data?.data || [],
  });
};