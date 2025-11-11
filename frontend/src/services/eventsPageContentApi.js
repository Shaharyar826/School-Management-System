import axios from 'axios';

export const getEventsPageContent = async () => {
  const res = await axios.get('/api/events-page-content');
  return res.data.data;
};

export const updateEventsPageContent = async (content) => {
  const res = await axios.put('/api/events-page-content', content);
  return res.data.data;
};

export const updateEventsPageSection = async (section, items) => {
  const res = await axios.patch('/api/events-page-content/section', { section, items });
  return res.data.data;
};

export const uploadEventsPageImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await axios.post('/api/events-page-content/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.url;
}; 