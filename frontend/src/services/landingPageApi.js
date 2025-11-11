import axios from 'axios';

// Active Teachers for Selection
export const getActiveTeachersForSelection = async () => {
  try {
    const res = await axios.get('/api/landing-page/active-teachers');
    return res.data.data;
  } catch (error) {
    console.error('Error fetching active teachers:', error);
    throw error;
  }
};

// Featured Teachers API
export const getFeaturedTeachers = async () => {
  try {
    const res = await axios.get('/api/landing-page/teachers');
    return res.data.data;
  } catch (error) {
    console.error('Error fetching featured teachers:', error);
    throw error;
  }
};

export const getFeaturedTeacher = async (id) => {
  try {
    const res = await axios.get(`/api/landing-page/teachers/${id}`);
    return res.data.data;
  } catch (error) {
    console.error('Error fetching featured teacher:', error);
    throw error;
  }
};

export const createFeaturedTeacher = async (teacherData) => {
  try {
    console.log('Creating featured teacher with data:', teacherData);

    // Handle file upload if image is provided
    if (teacherData.image && teacherData.image instanceof File) {
      const formData = new FormData();

      // Add all other fields to formData
      Object.keys(teacherData).forEach(key => {
        if (key === 'image') {
          formData.append('image', teacherData.image);
        } else if (key === 'subjects' && Array.isArray(teacherData.subjects)) {
          // Handle array of subjects
          if (teacherData.subjects.length > 0) {
            teacherData.subjects.forEach(subject => {
              formData.append('subjects[]', subject);
            });
          } else {
            formData.append('subjects', []);
          }
        } else {
          formData.append(key, teacherData[key]);
        }
      });

      console.log('Sending form data:', Object.fromEntries(formData.entries()));

      const res = await axios.post('/api/landing-page/teachers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Create teacher response:', res.data);
      return res.data.data;
    } else {
      // Regular JSON request if no image
      // Make sure to handle empty subjects array properly
      const dataToSend = { ...teacherData };
      if (!dataToSend.subjects || !Array.isArray(dataToSend.subjects)) {
        dataToSend.subjects = [];
      }

      console.log('Sending JSON data:', dataToSend);
      const res = await axios.post('/api/landing-page/teachers', dataToSend);
      console.log('Create teacher response:', res.data);
      return res.data.data;
    }
  } catch (error) {
    console.error('Error creating featured teacher:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

export const updateFeaturedTeacher = async (id, teacherData, silent = false) => {
  try {
    if (!silent) {
      console.log('Updating featured teacher with data:', teacherData);
    }

    // Handle file upload if image is provided
    if (teacherData.image && teacherData.image instanceof File) {
      const formData = new FormData();

      // Add all other fields to formData
      Object.keys(teacherData).forEach(key => {
        if (key === 'image') {
          formData.append('image', teacherData.image);
        } else if (key === 'subjects' && Array.isArray(teacherData.subjects)) {
          // Handle array of subjects
          if (teacherData.subjects.length > 0) {
            teacherData.subjects.forEach(subject => {
              formData.append('subjects[]', subject);
            });
          } else {
            formData.append('subjects', []);
          }
        } else {
          formData.append(key, teacherData[key]);
        }
      });

      if (!silent) {
        console.log('Sending form data:', Object.fromEntries(formData.entries()));
      }

      const res = await axios.put(`/api/landing-page/teachers/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!silent) {
        console.log('Update teacher response:', res.data);
      }
      return res.data.data;
    } else {
      // Regular JSON request if no image
      // Make sure to handle empty subjects array properly
      const dataToSend = { ...teacherData };
      if (!dataToSend.subjects || !Array.isArray(dataToSend.subjects)) {
        dataToSend.subjects = [];
      }

      if (!silent) {
        console.log('Sending JSON data:', dataToSend);
      }
      const res = await axios.put(`/api/landing-page/teachers/${id}`, dataToSend);
      if (!silent) {
        console.log('Update teacher response:', res.data);
      }
      return res.data.data;
    }
  } catch (error) {
    console.error('Error updating featured teacher:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

export const deleteFeaturedTeacher = async (id) => {
  try {
    const res = await axios.delete(`/api/landing-page/teachers/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting featured teacher:', error);
    throw error;
  }
};

// Landing Page Events API
export const getLandingPageEvents = async () => {
  try {
    const res = await axios.get('/api/landing-page/events');
    return res.data.data;
  } catch (error) {
    console.error('Error fetching landing page events:', error);
    throw error;
  }
};

export const getLandingPageEvent = async (id) => {
  try {
    const res = await axios.get(`/api/landing-page/events/${id}`);
    return res.data.data;
  } catch (error) {
    console.error('Error fetching landing page event:', error);
    throw error;
  }
};

export const createLandingPageEvent = async (eventData) => {
  try {
    // Handle file upload if image is provided
    if (eventData.image && eventData.image instanceof File) {
      const formData = new FormData();

      // Add all other fields to formData
      Object.keys(eventData).forEach(key => {
        if (key === 'image') {
          formData.append('image', eventData.image);
        } else {
          formData.append(key, eventData[key]);
        }
      });

      const res = await axios.post('/api/landing-page/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return res.data.data;
    } else {
      // Regular JSON request if no image
      const res = await axios.post('/api/landing-page/events', eventData);
      return res.data.data;
    }
  } catch (error) {
    console.error('Error creating landing page event:', error);
    throw error;
  }
};

export const updateLandingPageEvent = async (id, eventData) => {
  try {
    // Handle file upload if image is provided
    if (eventData.image && eventData.image instanceof File) {
      const formData = new FormData();

      // Add all other fields to formData
      Object.keys(eventData).forEach(key => {
        if (key === 'image') {
          formData.append('image', eventData.image);
        } else {
          formData.append(key, eventData[key]);
        }
      });

      const res = await axios.put(`/api/landing-page/events/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return res.data.data;
    } else {
      // Regular JSON request if no image
      const res = await axios.put(`/api/landing-page/events/${id}`, eventData);
      return res.data.data;
    }
  } catch (error) {
    console.error('Error updating landing page event:', error);
    throw error;
  }
};

export const deleteLandingPageEvent = async (id) => {
  try {
    const res = await axios.delete(`/api/landing-page/events/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting landing page event:', error);
    throw error;
  }
};

// Testimonials API
export const getTestimonials = async () => {
  try {
    const res = await axios.get('/api/landing-page/testimonials');
    return res.data.data;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    throw error;
  }
};

export const getTestimonial = async (id) => {
  try {
    const res = await axios.get(`/api/landing-page/testimonials/${id}`);
    return res.data.data;
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    throw error;
  }
};

export const createTestimonial = async (testimonialData) => {
  try {
    // Handle file upload if image is provided
    if (testimonialData.image && testimonialData.image instanceof File) {
      const formData = new FormData();

      // Add all other fields to formData
      Object.keys(testimonialData).forEach(key => {
        if (key === 'image') {
          formData.append('image', testimonialData.image);
        } else {
          formData.append(key, testimonialData[key]);
        }
      });

      const res = await axios.post('/api/landing-page/testimonials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return res.data.data;
    } else {
      // Regular JSON request if no image
      const res = await axios.post('/api/landing-page/testimonials', testimonialData);
      return res.data.data;
    }
  } catch (error) {
    console.error('Error creating testimonial:', error);
    throw error;
  }
};

export const updateTestimonial = async (id, testimonialData) => {
  try {
    // Handle file upload if image is provided
    if (testimonialData.image && testimonialData.image instanceof File) {
      const formData = new FormData();

      // Add all other fields to formData
      Object.keys(testimonialData).forEach(key => {
        if (key === 'image') {
          formData.append('image', testimonialData.image);
        } else {
          formData.append(key, testimonialData[key]);
        }
      });

      const res = await axios.put(`/api/landing-page/testimonials/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return res.data.data;
    } else {
      // Regular JSON request if no image
      const res = await axios.put(`/api/landing-page/testimonials/${id}`, testimonialData);
      return res.data.data;
    }
  } catch (error) {
    console.error('Error updating testimonial:', error);
    throw error;
  }
};

export const deleteTestimonial = async (id) => {
  try {
    const res = await axios.delete(`/api/landing-page/testimonials/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    throw error;
  }
};

// Get all landing page content (public)
export const getLandingPageContent = async () => {
  try {
    const res = await axios.get('/api/landing-page/content');
    return res.data.data;
  } catch (error) {
    console.error('Error fetching landing page content:', error);
    throw error;
  }
};
