import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import FormInput from '../common/FormInput';
import Spinner from '../common/Spinner';

const MeetingForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    participants: ['all'],
    status: 'scheduled'
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchMeeting();
    } else {
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        date: tomorrow.toISOString().split('T')[0]
      }));
    }
  }, [id]);

  const fetchMeeting = async () => {
    try {
      setFetchLoading(true);
      const res = await axios.get(`/api/meetings/${id}`);

      if (res.data.success) {
        const meeting = res.data.data;

        // Format date for input field
        const formattedDate = new Date(meeting.date).toISOString().split('T')[0];

        setFormData({
          title: meeting.title,
          description: meeting.description,
          date: formattedDate,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          location: meeting.location,
          participants: meeting.participants,
          status: meeting.status
        });
      }
    } catch (err) {
      setError('Failed to fetch meeting details');
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleParticipantsChange = (e) => {
    const { value, checked } = e.target;

    if (value === 'all' && checked) {
      // If 'all' is selected, clear other selections
      setFormData(prev => ({
        ...prev,
        participants: ['all']
      }));
    } else {
      setFormData(prev => {
        let updatedParticipants = [...prev.participants];

        if (checked) {
          // Add the value if it's checked
          if (value !== 'all') {
            // Remove 'all' if it exists
            updatedParticipants = updatedParticipants.filter(p => p !== 'all');
            updatedParticipants.push(value);
          }
        } else {
          // Remove the value if it's unchecked
          updatedParticipants = updatedParticipants.filter(p => p !== value);
        }

        // If no participants are selected, default to 'all'
        if (updatedParticipants.length === 0) {
          updatedParticipants = ['all'];
        }

        return {
          ...prev,
          participants: updatedParticipants
        };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validate form data
      if (!formData.title || !formData.description || !formData.date || !formData.startTime || !formData.endTime || !formData.location) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Log the form data being submitted
      console.log('Submitting meeting form data:', formData);

      let res;

      if (isEditMode) {
        console.log('Updating existing meeting with ID:', id);
        res = await axios.put(`/api/meetings/${id}`, formData);
      } else {
        console.log('Creating new meeting');
        res = await axios.post('/api/meetings', formData);
      }

      console.log('Server response:', res.data);

      if (res.data.success) {
        setSuccess(isEditMode ? 'Meeting updated successfully' : 'Meeting created successfully');

        // Redirect after a short delay
        setTimeout(() => {
          navigate('/meetings');
        }, 2000);
      } else {
        // Handle case where success is false but no error was thrown
        setError(res.data.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Error submitting meeting form:', err);

      // More detailed error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        setError(err.response.data.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEditMode ? 'Edit Meeting' : 'Schedule New Meeting'}
        </h1>

        {error && (
          <div className="mt-4 school-alert school-alert-error">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 school-alert school-alert-success">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6">
            <FormInput
              label="Title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter meeting title"
            />

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="mt-1 block w-full border border-school-yellow rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-school-yellow focus:border-school-yellow sm:text-sm"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Enter meeting description"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormInput
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Start Time"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />

                <FormInput
                  label="End Time"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <FormInput
              label="Location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Enter meeting location"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participants
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <input
                    id="all"
                    name="participants"
                    type="checkbox"
                    value="all"
                    checked={formData.participants.includes('all')}
                    onChange={handleParticipantsChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="all" className="ml-2 block text-sm text-gray-700">
                    All Users
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="teachers"
                    name="participants"
                    type="checkbox"
                    value="teachers"
                    checked={formData.participants.includes('teachers')}
                    onChange={handleParticipantsChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="teachers" className="ml-2 block text-sm text-gray-700">
                    Teachers
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="students"
                    name="participants"
                    type="checkbox"
                    value="students"
                    checked={formData.participants.includes('students')}
                    onChange={handleParticipantsChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="students" className="ml-2 block text-sm text-gray-700">
                    Students
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="parents"
                    name="participants"
                    type="checkbox"
                    value="parents"
                    checked={formData.participants.includes('parents')}
                    onChange={handleParticipantsChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="parents" className="ml-2 block text-sm text-gray-700">
                    Parents
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="admin-staff"
                    name="participants"
                    type="checkbox"
                    value="admin-staff"
                    checked={formData.participants.includes('admin-staff')}
                    onChange={handleParticipantsChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="admin-staff" className="ml-2 block text-sm text-gray-700">
                    Admin Staff
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="support-staff"
                    name="participants"
                    type="checkbox"
                    value="support-staff"
                    checked={formData.participants.includes('support-staff')}
                    onChange={handleParticipantsChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="support-staff" className="ml-2 block text-sm text-gray-700">
                    Support Staff
                  </label>
                </div>
              </div>
            </div>

            {isEditMode && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full border border-school-yellow rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-school-yellow focus:border-school-yellow sm:text-sm"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => navigate('/meetings')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Scheduling...'}
                  </>
                ) : (
                  <>{isEditMode ? 'Update Meeting' : 'Schedule Meeting'}</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingForm;
