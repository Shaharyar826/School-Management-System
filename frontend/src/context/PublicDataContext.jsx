import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { getLandingPageData, getAllPublicContent } from '../services/publicApi';
import { getLandingPageContent } from '../services/landingPageApi';

const PublicDataContext = createContext();

export const PublicDataProvider = ({ children }) => {
  // Loading states
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Content states
  const [schoolSettings, setSchoolSettings] = useState(null);
  const [featuredTeachers, setFeaturedTeachers] = useState([]);
  const [eventsNotices, setEventsNotices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [schoolStats, setSchoolStats] = useState(null);
  const [aboutUsContent, setAboutUsContent] = useState(null);
  const [admissionsContent, setAdmissionsContent] = useState(null);
  const [academicsContent, setAcademicsContent] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  // Section-specific loading states
  const [sectionLoading, setSectionLoading] = useState({
    settings: true,
    teachers: true,
    events: true,
    testimonials: true,
    stats: true,
    aboutUs: true,
    admissions: true,
    academics: true,
    gallery: true
  });

  // Cache and retry management
  const cacheRef = useRef({});
  const lastFetchRef = useRef(null);
  const maxRetries = 3;
  const cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Check if cache is valid
  const isCacheValid = useCallback((cacheKey) => {
    const cached = cacheRef.current[cacheKey];
    if (!cached) return false;
    return Date.now() - cached.timestamp < cacheTimeout;
  }, [cacheTimeout]);

  // Set cache data
  const setCacheData = useCallback((cacheKey, data) => {
    cacheRef.current[cacheKey] = {
      data,
      timestamp: Date.now()
    };
  }, []);

  // Get cache data
  const getCacheData = useCallback((cacheKey) => {
    const cached = cacheRef.current[cacheKey];
    return cached ? cached.data : null;
  }, []);

  // Update section loading state
  const updateSectionLoading = useCallback((section, isLoading) => {
    setSectionLoading(prev => ({
      ...prev,
      [section]: isLoading
    }));
  }, []);

  // Retry mechanism with exponential backoff
  const retryWithBackoff = useCallback(async (fn, retries = 0) => {
    try {
      return await fn();
    } catch (error) {
      if (retries < maxRetries) {
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay}ms... (attempt ${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retries + 1);
      }
      throw error;
    }
  }, [maxRetries]);

  // Fetch all public data
  const fetchPublicData = useCallback(async (forceRefresh = false) => {
    const startTime = Date.now();
    const minLoadingTime = 1500; // Minimum 1.5 seconds to show loading state

    try {
      // Check if we should use cache
      if (!forceRefresh && isCacheValid('allContent')) {
        const cachedData = getCacheData('allContent');
        if (cachedData) {
          console.log('Using cached public data');

          // Still show loading for minimum time even with cache
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

          if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
          }

          setSchoolSettings(cachedData.settings);
          setAboutUsContent(cachedData.aboutUs);
          setAdmissionsContent(cachedData.admissions);
          setAcademicsContent(cachedData.academics);
          setFeaturedTeachers(cachedData.teachers || []);
          setEventsNotices(cachedData.events || []);
          setGalleryImages(cachedData.gallery || []);
          setTestimonials(cachedData.testimonials || []);
          setSchoolStats(cachedData.stats);

          // Set all sections as loaded
          setSectionLoading({
            settings: false,
            teachers: false,
            events: false,
            testimonials: false,
            stats: false,
            aboutUs: false,
            admissions: false,
            academics: false,
            gallery: false
          });

          setLoading(false);
          setInitialLoad(false);
          return;
        }
      }

      setLoading(true);
      setError(null);
      lastFetchRef.current = Date.now();

      console.log('Fetching fresh public data...');

      // Use retry mechanism for the API call
      const allContent = await retryWithBackoff(() => getAllPublicContent());

      if (allContent) {
        // Cache the successful response
        setCacheData('allContent', allContent);

        // Process the data with section loading updates
        setSchoolSettings(allContent.settings);
        updateSectionLoading('settings', false);

        setAboutUsContent(allContent.aboutUs);
        updateSectionLoading('aboutUs', false);

        setAdmissionsContent(allContent.admissions);
        updateSectionLoading('admissions', false);

        setAcademicsContent(allContent.academics);
        updateSectionLoading('academics', false);

        // Process teacher images to ensure they're in the correct format
        const processedTeachers = (allContent.teachers || []).map(teacher => {
          // If image is a Cloudinary URL (starts with http), use it directly
          if (teacher.image && typeof teacher.image === 'string' && teacher.image.startsWith('http')) {
            return teacher;
          }

          // If profileImage is an object with a URL, use that
          if (teacher.profileImage && typeof teacher.profileImage === 'object' && teacher.profileImage.url) {
            return {
              ...teacher,
              image: teacher.profileImage.url
            };
          }

          return teacher;
        });

        setFeaturedTeachers(processedTeachers);
        updateSectionLoading('teachers', false);

        setEventsNotices(allContent.events || []);
        updateSectionLoading('events', false);

        setGalleryImages(allContent.gallery || []);
        updateSectionLoading('gallery', false);

        setTestimonials(allContent.testimonials || []);
        updateSectionLoading('testimonials', false);

        // Use real-time stats if available
        if (allContent.stats) {
          setSchoolStats(allContent.stats);
        } else {
          // Fallback to settings stats
          const stats = {
            studentCount: allContent.settings?.landingPage?.stats?.studentCount || 0,
            teacherCount: allContent.settings?.landingPage?.stats?.teacherCount || 0,
            classesCount: allContent.settings?.landingPage?.stats?.classesCount || 0,
            successRate: allContent.settings?.landingPage?.stats?.successRate || 95
          };
          setSchoolStats(stats);
        }
        updateSectionLoading('stats', false);

        setRetryCount(0); // Reset retry count on success
      } else {
        // If the combined endpoint fails, fall back to the landing page data
        const data = await getLandingPageData();

        setSchoolSettings(data.settings);
        setFeaturedTeachers(data.teachers || []);
        setEventsNotices(data.eventsNotices || []);
        setTestimonials(data.testimonials || []);
        setSchoolStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching public data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load data. Please try again later.';
      console.error('Error details:', errorMessage);
      setError(errorMessage);
      setRetryCount(prev => prev + 1);

      // Try to get minimal data for the landing page as final fallback
      try {
        console.log('Attempting to fetch fallback data from landing page API');
        const data = await getLandingPageData();
        console.log('Fallback data received:', data);

        setSchoolSettings(data.settings);
        updateSectionLoading('settings', false);

        setFeaturedTeachers(data.teachers || []);
        updateSectionLoading('teachers', false);

        setEventsNotices(data.eventsNotices || []);
        updateSectionLoading('events', false);

        setTestimonials(data.testimonials || []);
        updateSectionLoading('testimonials', false);

        setSchoolStats(data.stats);
        updateSectionLoading('stats', false);
      } catch (fallbackErr) {
        console.error('Error fetching fallback data:', fallbackErr);
        const fallbackErrorMessage = fallbackErr.response?.data?.message || fallbackErr.message || 'Failed to load fallback data.';
        console.error('Fallback error details:', fallbackErrorMessage);
        setError(prevError => `${prevError}. Additionally, fallback data could not be loaded: ${fallbackErrorMessage}`);
      }
    } finally {
      // Ensure minimum loading time has passed
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      setLoading(false);
      setInitialLoad(false);
    }
  }, [isCacheValid, getCacheData, setCacheData, updateSectionLoading, retryWithBackoff]);

  // Initial data fetch
  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);

  return (
    <PublicDataContext.Provider
      value={{
        // Loading states
        loading,
        initialLoad,
        sectionLoading,
        error,
        retryCount,

        // Content data
        schoolSettings,
        featuredTeachers,
        eventsNotices,
        testimonials,
        schoolStats,
        aboutUsContent,
        admissionsContent,
        academicsContent,
        galleryImages,

        // Actions
        refreshData: fetchPublicData,
        forceRefresh: () => fetchPublicData(true),

        // Cache utilities
        isCacheValid: (key) => isCacheValid(key),
        clearCache: () => { cacheRef.current = {}; }
      }}
    >
      {children}
    </PublicDataContext.Provider>
  );
};

export default PublicDataContext;
