import axios from 'axios';

// Get all landing page data in a single request
export const getLandingPageData = async () => {
  try {
    const res = await axios.get('/api/public/landing-page');
    return res.data.data;
  } catch (error) {
    console.error('Error fetching landing page data:', error);
    throw error;
  }
};

// Get school settings
export const getSchoolSettings = async () => {
  try {
    console.log('Fetching school settings...');
    const res = await axios.get('/api/school-settings/public');
    console.log('School settings response:', res.status, res.statusText);

    if (res.data.data) {
      console.log('School settings data structure:', Object.keys(res.data.data));
      console.log('Contact info available:',
        Boolean(res.data.data.email && res.data.data.phone));
      console.log('Social media data available:',
        Boolean(res.data.data.socialMedia));
    } else {
      console.warn('School settings data not found in the response');
    }

    return res.data.data;
  } catch (error) {
    console.error('Error fetching school settings:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Get featured teachers
export const getFeaturedTeachers = async (limit = 6) => {
  try {
    const res = await axios.get(`/api/public/teachers?limit=${limit}`);
    return res.data.data;
  } catch (error) {
    console.error('Error fetching featured teachers:', error);
    throw error;
  }
};

// Get public events and notices
export const getPublicEventsNotices = async (limit = 5, type = 'all') => {
  try {
    const res = await axios.get(`/api/public/events-notices?limit=${limit}&type=${type}`);
    return res.data.data;
  } catch (error) {
    console.error('Error fetching public events and notices:', error);
    throw error;
  }
};

// Get school statistics
export const getSchoolStats = async () => {
  try {
    const res = await axios.get('/api/public/stats');
    return res.data.data;
  } catch (error) {
    console.error('Error fetching school statistics:', error);
    throw error;
  }
};

// Get all public content in a single request
export const getAllPublicContent = async () => {
  try {
    console.log('Fetching all public content...');
    const res = await axios.get('/api/public/all-content');
    console.log('Public content response:', res.status, res.statusText);
    console.log('Public content data structure:', Object.keys(res.data.data || {}));

    // Check if settings data is present
    if (res.data.data && res.data.data.settings) {
      console.log('Settings data received. Contact info available:',
        Boolean(res.data.data.settings.email && res.data.data.settings.phone));
      console.log('Social media data available:',
        Boolean(res.data.data.settings.socialMedia));
    } else {
      console.warn('Settings data not found in the response');
    }

    return res.data.data;
  } catch (error) {
    console.error('Error fetching all public content:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Get about us content
export const getAboutUsContent = async () => {
  try {
    const res = await axios.get('/api/page-content/about');
    return res.data.data;
  } catch (error) {
    console.error('Error fetching about us content:', error);
    throw error;
  }
};

// Get admissions content
export const getAdmissionsContent = async () => {
  try {
    const res = await axios.get('/api/page-content/admissions');
    return res.data.data;
  } catch (error) {
    console.error('Error fetching admissions content:', error);
    throw error;
  }
};

// Get academics content
export const getAcademicsContent = async () => {
  try {
    const res = await axios.get('/api/page-content/academics');
    return res.data.data;
  } catch (error) {
    console.error('Error fetching academics content:', error);
    throw error;
  }
};

// Get gallery images
export const getGalleryImages = async (page = 1, limit = 12) => {
  try {
    const res = await axios.get(`/api/gallery?page=${page}&limit=${limit}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    throw error;
  }
};
