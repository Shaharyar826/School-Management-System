import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';

const NoticeForm = ({ notice = null, onSuccess, onCancel }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: notice?.type || 'notice',
    priority: 'medium',
    targetAudience: ['all'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    eventTime: '',
    location: '',
    isActive: true
  });

  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState('');
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If editing an existing notice, populate the form
  useEffect(() => {
    if (notice) {
      const formattedStartDate = notice.startDate
        ? new Date(notice.startDate).toISOString().split('T')[0]
        : '';

      const formattedEndDate = notice.endDate
        ? new Date(notice.endDate).toISOString().split('T')[0]
        : '';

      setFormData({
        title: notice.title || '',
        content: notice.content || '',
        type: notice.type || 'notice',
        priority: notice.priority || 'medium',
        targetAudience: notice.targetAudience || ['all'],
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        eventTime: notice.eventTime || '',
        location: notice.location || '',
        isActive: notice.isActive !== undefined ? notice.isActive : true
      });

      // Set attachment preview if exists
      if (notice.attachmentFile && notice.attachmentFile.startsWith('http')) {
        setAttachmentPreview(notice.attachmentFile);
      }
    }
  }, [notice]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'targetAudience') {
      // Handle multi-select for target audience
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData({ ...formData, [name]: selectedOptions });
    } else if (type === 'file') {
      // Handle file upload
      if (e.target.files && e.target.files[0]) {
        setAttachmentFile(e.target.files[0]);

        // Create preview URL for images
        const fileType = e.target.files[0].type;
        if (fileType.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            setAttachmentPreview(reader.result);
          };
          reader.readAsDataURL(e.target.files[0]);
        } else {
          // For non-image files (like PDFs), just show the filename
          setAttachmentPreview(e.target.files[0].name);
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create form data for file upload
      const formDataToSend = new FormData();

      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'targetAudience') {
          // Handle array values
          formData[key].forEach(value => {
            formDataToSend.append(`${key}[]`, value);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add the file if selected
      if (attachmentFile) {
        formDataToSend.append('attachmentFile', attachmentFile);
      }

      let response;

      if (notice && notice._id) {
        // Update existing notice - don't send createdBy field
        response = await axios.put(`/api/events-notices/${notice._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new notice - add user ID for new notices only
        formDataToSend.append('createdBy', user.id);
        response = await axios.post('/api/events-notices', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (response.data.success) {
        onSuccess(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event/notice');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {notice && notice._id ?
            (formData.type === 'event' ? 'Edit Event' : 'Edit Notice') :
            (formData.type === 'event' ? 'Create New Event' : 'Create New Notice')
          }
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {notice && notice._id ?
            (formData.type === 'event' ? 'Update the event details' : 'Update the notice details') :
            (formData.type === 'event' ? 'Fill in the details to create a new event' : 'Fill in the details to create a new notice')
          }
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200">
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <FormInput
                id="title"
                name="title"
                type="text"
                label="Title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder={formData.type === 'event' ? "Enter event title" : "Enter notice title"}
              />
            </div>

            <div className="sm:col-span-3">
              <div className="floating-input-container">
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                >
                  <option value="notice">Notice</option>
                  <option value="event">Event</option>
                </select>
                <label
                  htmlFor="type"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none
                    ${formData.type ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                >
                  Type
                </label>
              </div>
            </div>

            <div className="sm:col-span-6">
              <div className="floating-input-container">
                <textarea
                  id="content"
                  name="content"
                  rows={4}
                  required
                  value={formData.content}
                  onChange={handleChange}
                  className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                  placeholder=" "
                />
                <label
                  htmlFor="content"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none
                    ${formData.content ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                >
                  Content <span className="text-red-500">*</span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-3">
              <div className="floating-input-container">
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <label
                  htmlFor="priority"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none
                    ${formData.priority ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                >
                  Priority
                </label>
              </div>
            </div>

            <div className="sm:col-span-3">
              <div className="floating-input-container">
                <select
                  id="targetAudience"
                  name="targetAudience"
                  multiple
                  value={formData.targetAudience}
                  onChange={handleChange}
                  className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                >
                  <option value="all">All</option>
                  <option value="teachers">Teachers</option>
                  <option value="students">Students</option>
                  <option value="parents">Parents</option>
                  <option value="staff">Staff</option>
                </select>
                <label
                  htmlFor="targetAudience"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none
                    ${formData.targetAudience.length > 0 ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                >
                  Target Audience
                </label>
                <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </div>

            <div className="sm:col-span-3">
              <div className="floating-input-container">
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                />
                <label
                  htmlFor="startDate"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none
                    ${formData.startDate ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                >
                  Start Date
                </label>
              </div>
            </div>

            <div className="sm:col-span-3">
              <div className="floating-input-container">
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                />
                <label
                  htmlFor="endDate"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none
                    ${formData.endDate ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                >
                  End Date
                </label>
              </div>
            </div>

            {formData.type === 'event' && (
              <>
                <div className="sm:col-span-3">
                  <div className="floating-input-container">
                    <input
                      type="text"
                      name="eventTime"
                      id="eventTime"
                      value={formData.eventTime}
                      onChange={handleChange}
                      placeholder="e.g., 10:00 AM - 12:00 PM"
                      className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    />
                    <label
                      htmlFor="eventTime"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${formData.eventTime ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                    >
                      Event Time
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <div className="floating-input-container">
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., School Auditorium"
                      className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    />
                    <label
                      htmlFor="location"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${formData.location ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                    >
                      Location
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="sm:col-span-6">
              <div className="floating-input-container">
                <input
                  type="file"
                  name="attachmentFile"
                  id="attachmentFile"
                  ref={fileInputRef}
                  onChange={handleChange}
                  className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                  accept="image/jpeg,image/png,image/gif,application/pdf"
                />
                <label
                  htmlFor="attachmentFile"
                  className="absolute left-4 transition-all duration-200 pointer-events-none text-sm text-green-500 -top-2.5 bg-white px-1"
                >
                  {formData.type === 'event' ? 'Event Image/Attachment (Optional)' : 'Attachment (Optional)'}
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Upload images (JPEG, PNG, GIF) or PDF files (max 10MB)
                </p>
              </div>

              {attachmentPreview && (
                <div className="mt-2 relative">
                  {attachmentPreview.startsWith('data:image') || attachmentPreview.startsWith('http') ? (
                    <div className="relative">
                      <img
                        src={attachmentPreview}
                        alt="Preview"
                        className="h-32 w-auto object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveAttachment}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700 truncate">{typeof attachmentPreview === 'string' ? attachmentPreview.split('/').pop() : attachmentPreview}</span>
                      <button
                        type="button"
                        onClick={handleRemoveAttachment}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="sm:col-span-6">
              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeForm;
