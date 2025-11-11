import { useQuery } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';

// Optimized query hook with client-side filtering and debounced search
export const useOptimizedListQuery = ({
  queryKey,
  queryFn,
  filters = {},
  clientFilters = [],
  staleTime = 5 * 60 * 1000,
  searchDebounceMs = 300,
  select
}) => {
  // Debounce search input to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search || '', searchDebounceMs);
  
  // Determine if we should use server-side filtering
  const shouldUseServerFilter = debouncedSearch && debouncedSearch.trim().length > 0;
  
  // Create server filters - only include search if present
  const serverFilters = shouldUseServerFilter ? { search: debouncedSearch } : {};
  
  return useQuery({
    queryKey: queryKey(serverFilters),
    queryFn: () => queryFn(serverFilters),
    staleTime,
    select: (data) => {
      let items = data?.data || [];
      
      // Apply custom select function first if provided
      if (select) {
        items = select(items);
      }
      
      // Apply client-side filters if not using server-side search
      if (!shouldUseServerFilter && clientFilters.length > 0) {
        clientFilters.forEach(filter => {
          if (filters[filter.key] && filters[filter.key] !== 'all') {
            items = items.filter(filter.filterFn(filters[filter.key]));
          }
        });
      }
      
      return items;
    },
  });
};

// Helper function to create stable filter objects
export const createStableFilters = (filters = {}) => {
  return Object.keys(filters)
    .sort()
    .reduce((acc, key) => {
      if (filters[key] !== '' && filters[key] != null) {
        acc[key] = filters[key];
      }
      return acc;
    }, {});
};