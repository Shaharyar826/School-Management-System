import axios from 'axios';

// Get all gallery images
export const getGalleryImages = async (page = 1, limit = 12) => {
  try {
    const res = await axios.get(`/api/gallery?page=${page}&limit=${limit}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    throw error;
  }
};

// Get single gallery image
export const getGalleryImage = async (id) => {
  try {
    const res = await axios.get(`/api/gallery/${id}`);
    return res.data.data;
  } catch (error) {
    console.error('Error fetching gallery image:', error);
    throw error;
  }
};

// Create gallery image
export const createGalleryImage = async (imageData) => {
  try {
    const formData = new FormData();
    
    // Append file if it exists
    if (imageData.file) {
      formData.append('image', imageData.file);
    }
    
    // Append other data
    formData.append('title', imageData.title);
    if (imageData.eventTag) formData.append('eventTag', imageData.eventTag);
    if (imageData.date) formData.append('date', imageData.date);
    if (imageData.description) formData.append('description', imageData.description);
    if (imageData.displayOrder) formData.append('displayOrder', imageData.displayOrder);
    if (imageData.isActive !== undefined) formData.append('isActive', imageData.isActive);

    const res = await axios.post('/api/gallery', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.data;
  } catch (error) {
    console.error('Error creating gallery image:', error);
    throw error;
  }
};

// Update gallery image
export const updateGalleryImage = async (id, imageData) => {
  try {
    const formData = new FormData();
    
    // Append data
    if (imageData.title) formData.append('title', imageData.title);
    if (imageData.eventTag) formData.append('eventTag', imageData.eventTag);
    if (imageData.date) formData.append('date', imageData.date);
    if (imageData.description) formData.append('description', imageData.description);
    if (imageData.displayOrder) formData.append('displayOrder', imageData.displayOrder);
    if (imageData.isActive !== undefined) formData.append('isActive', imageData.isActive);
    if (imageData.imageUrl) formData.append('imageUrl', imageData.imageUrl);
    if (imageData.imageMetadata) formData.append('imageMetadata', JSON.stringify(imageData.imageMetadata));

    const res = await axios.put(`/api/gallery/${id}`, formData);
    return res.data.data;
  } catch (error) {
    console.error('Error updating gallery image:', error);
    throw error;
  }
};

// Delete gallery image
export const deleteGalleryImage = async (id) => {
  try {
    const res = await axios.delete(`/api/gallery/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    throw error;
  }
};
