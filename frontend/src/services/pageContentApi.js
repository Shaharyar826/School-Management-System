import axios from 'axios';

// About Us Content API

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

// Update about us content
export const updateAboutUsContent = async (contentData) => {
  try {
    const res = await axios.put('/api/page-content/about', contentData);
    return res.data.data;
  } catch (error) {
    console.error('Error updating about us content:', error);
    throw error;
  }
};

// Upload about us banner image
export const uploadAboutUsBannerImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('banner', imageFile);

    const res = await axios.post('/api/page-content/about/banner', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.data;
  } catch (error) {
    console.error('Error uploading about us banner image:', error);
    throw error;
  }
};

// Upload leadership team member photo
export const uploadLeadershipPhoto = async (imageFile, memberIndex) => {
  try {
    const formData = new FormData();
    formData.append('photo', imageFile);

    const res = await axios.post(`/api/page-content/about/leadership-photo/${memberIndex}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.data;
  } catch (error) {
    console.error('Error uploading leadership team member photo:', error);
    throw error;
  }
};

// Admissions Content API

// Get admissions content
// export const getAdmissionsContent = async () => {
//   try {
//     const res = await axios.get('/api/page-content/admissions');
//     return res.data.data;
//   } catch (error) {
//     console.error('Error fetching admissions content:', error);
//     throw error;
//   }
// };

// export const getAdmissionsContent = async () => {
//   try {
//     const response = await axios.get('/api/page-content/admissions');
//     return response.data.data;
//   } catch (error) {
//     if (error.response) {
//       // Server responded with error status
//       console.error('Server error:', error.response.data);
//       throw new Error(error.response.data.message || 'Failed to load admissions');
//     } else if (error.request) {
//       // No response received
//       console.error('No response:', error.request);
//       throw new Error('Network error - no response from server');
//     } else {
//       // Other errors
//       console.error('Error:', error.message);
//       throw new Error('Failed to fetch admissions content');
//     }
//   }
// };


// // // Update admissions content
// export const updateAdmissionsContent = async (contentData) => {
//   try {
//     const res = await axios.put('/api/page-content/admissions', contentData);
//     return res.data.data;
//   } catch (error) {
//     console.error('Error updating admissions content:', error);
//     throw error;
//   }
// };




export const getAdmissionsContent = async () => {
  try {
    const response = await axios.get('/api/page-content/admissions');
    return response.data.data;
  } catch (error) {
    if (error.response) {
      console.error('Server error:', error.response.data);
      throw new Error(error.response.data.message || 'Failed to load admissions');
    } else {
      console.error('Error:', error.message);
      throw new Error('Failed to fetch admissions content');
    }
  }
};

export const updateAdmissionsContent = async (contentData) => {
  try {
    const res = await axios.put('/api/page-content/admissions', contentData);
    return res.data.data;
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
};



// app.put('/api/page-content/admissions', async (req, res) => {
//   console.log('Received update:', req.body); // 🔍 Check kya data aaraha hai

//   try {
//     const updated = await AdmissionsPage.findOneAndUpdate(
//       { _id: 'your-document-id-here' }, // or { page: 'admissions' }
//       req.body,
//       { new: true, upsert: true } // upsert ensures doc is created if not found
//     );

//     res.json({ data: updated });
//   } catch (err) {
//     console.error('Update failed:', err);
//     res.status(500).json({ message: 'Update failed' });
//   }
// });



// Upload admissions file
export const uploadAdmissionsFile = async (file, title, description = '') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) {
      formData.append('description', description);
    }

    const res = await axios.post('/api/page-content/admissions/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.data;
  } catch (error) {
    console.error('Error uploading admissions file:', error);
    throw error;
  }
};

// Delete admissions file
export const deleteAdmissionsFile = async (fileId) => {
  try {
    const res = await axios.delete(`/api/page-content/admissions/file/${fileId}`);
    return res.data.data;
  } catch (error) {
    console.error('Error deleting admissions file:', error);
    throw error;
  }
};

// Academics Content API

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

// Update academics content
export const updateAcademicsContent = async (contentData) => {
  try {
    const res = await axios.put('/api/page-content/academics', contentData);
    return res.data.data;
  } catch (error) {
    console.error('Error updating academics content:', error);
    throw error;
  }
};

// Faculty Content API
export const getFacultyContent = async () => {
  try {
    const res = await axios.get('/api/page-content/faculty');
    return res.data.data;
  } catch (error) {
    console.error('Error fetching faculty content:', error);
    throw error;
  }
};

export const updateFacultyContent = async (contentData) => {
  try {
    const res = await axios.put('/api/page-content/faculty', contentData);
    return res.data.data;
  } catch (error) {
    console.error('Error updating faculty content:', error);
    throw error;
  }
};

export const uploadFacultyPhoto = async (formData) => {
  try {
    const res = await axios.post('/api/page-content/faculty/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error uploading faculty photo:', error);
    throw error;
  }
};
