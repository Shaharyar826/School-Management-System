import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import { toast } from 'react-toastify';

const MeetingsPage = () => {
  const { user } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancellingMeeting, setCancellingMeeting] = useState(null);

  useEffect(() => {
    fetchMeetings();
  }, [currentPage]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching meetings for page:', currentPage);
      const res = await axios.get(`/api/meetings/my-meetings?page=${currentPage}&limit=10&sort=-date`);

      console.log('Meetings response:', res.data);

      if (res.data.success) {
        setMeetings(res.data.data || []);

        // Calculate total pages
        if (res.data.pagination) {
          const totalItems = res.data.count;
          const itemsPerPage = 10;
          setTotalPages(Math.ceil(totalItems / itemsPerPage));
        }
      } else {
        setError(res.data.message || 'Failed to fetch meetings');
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);

      if (err.response) {
        setError(`Server error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`);
      } else if (err.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Failed to fetch meetings: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getParticipantsLabel = (participants) => {
    if (participants.includes('all')) {
      return 'All Users';
    }

    return participants.map(p => {
      switch (p) {
        case 'teachers': return 'Teachers';
        case 'students': return 'Students';
        case 'parents': return 'Parents';
        case 'admin-staff': return 'Admin Staff';
        case 'support-staff': return 'Support Staff';
        default: return p;
      }
    }).join(', ');
  };

  const getMeetingStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMeetingTimeStatus = (date, startTime, endTime) => {
    const now = new Date();
    const meetingDate = new Date(date);

    // Set meeting date hours based on start and end times
    const meetingStartDateTime = new Date(date);
    const meetingEndDateTime = new Date(date);

    if (startTime) {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      meetingStartDateTime.setHours(startHours, startMinutes, 0);
    }

    if (endTime) {
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      meetingEndDateTime.setHours(endHours, endMinutes, 0);
    } else {
      // Default to 1 hour meeting if no end time
      meetingEndDateTime.setHours(meetingStartDateTime.getHours() + 1, meetingStartDateTime.getMinutes(), 0);
    }

    // Check if meeting is in the past (ended)
    if (now > meetingEndDateTime) {
      return {
        status: 'past',
        message: 'Meeting has ended',
        className: 'bg-gray-100 text-gray-600'
      };
    }

    // Check if meeting is currently happening
    if (now >= meetingStartDateTime && now <= meetingEndDateTime) {
      return {
        status: 'ongoing',
        message: 'Meeting in progress',
        className: 'bg-green-100 text-green-600'
      };
    }

    // Check if meeting is today but hasn't started yet
    if (
      now.getDate() === meetingDate.getDate() &&
      now.getMonth() === meetingDate.getMonth() &&
      now.getFullYear() === meetingDate.getFullYear() &&
      now < meetingStartDateTime
    ) {
      // Calculate minutes until meeting starts
      const minutesUntilStart = Math.floor((meetingStartDateTime - now) / (1000 * 60));
      if (minutesUntilStart < 60) {
        return {
          status: 'soon',
          message: `Starting in ${minutesUntilStart} minute${minutesUntilStart !== 1 ? 's' : ''}`,
          className: 'bg-yellow-100 text-yellow-600'
        };
      } else {
        const hoursUntilStart = Math.floor(minutesUntilStart / 60);
        return {
          status: 'today',
          message: `Starting in ${hoursUntilStart} hour${hoursUntilStart !== 1 ? 's' : ''}`,
          className: 'bg-blue-100 text-blue-600'
        };
      }
    }

    // Check if meeting is tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (
      tomorrow.getDate() === meetingDate.getDate() &&
      tomorrow.getMonth() === meetingDate.getMonth() &&
      tomorrow.getFullYear() === meetingDate.getFullYear()
    ) {
      return {
        status: 'tomorrow',
        message: 'Meeting tomorrow',
        className: 'bg-indigo-100 text-indigo-600'
      };
    }

    // Check if meeting is upcoming (future date)
    if (now < meetingStartDateTime) {
      const daysUntil = Math.ceil((meetingDate - now) / (1000 * 60 * 60 * 24));
      return {
        status: 'upcoming',
        message: `In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
        className: 'bg-blue-100 text-blue-600'
      };
    }

    return {
      status: 'unknown',
      message: '',
      className: ''
    };
  };

  const isUpcoming = (date) => {
    return new Date(date) > new Date();
  };

  const handleCancelMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to cancel this meeting?')) {
      return;
    }

    try {
      setCancellingMeeting(meetingId);
      console.log('Cancelling meeting with ID:', meetingId);

      const res = await axios.put(`/api/meetings/${meetingId}/cancel`);

      if (res.data.success) {
        // Update the meeting in the state
        setMeetings(prevMeetings =>
          prevMeetings.map(meeting =>
            meeting._id === meetingId
              ? { ...meeting, status: 'cancelled' }
              : meeting
          )
        );

        toast.success('Meeting cancelled successfully');
      } else {
        toast.error(res.data.message || 'Failed to cancel meeting');
      }
    } catch (err) {
      console.error('Error cancelling meeting:', err);

      if (err.response) {
        toast.error(err.response.data.message || `Error: ${err.response.status}`);
      } else if (err.request) {
        toast.error('No response from server. Please check your connection.');
      } else {
        toast.error('Error: ' + err.message);
      }
    } finally {
      setCancellingMeeting(null);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Meetings</h1>

          {user && ['admin', 'principal'].includes(user.role) && (
            <Link
              to="/meetings/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Schedule Meeting
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        ) : error ? (
          <div className="mt-4 school-alert school-alert-error">
            <p>{error}</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="mt-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No meetings</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have any meetings scheduled.</p>

            {user && ['admin', 'principal'].includes(user.role) && (
              <div className="mt-6">
                <Link
                  to="/meetings/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Schedule a Meeting
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {meetings.map((meeting) => (
                <li
                  key={meeting._id}
                  className={`hover:bg-gray-50 ${isUpcoming(meeting.date) ? 'border-l-4 border-blue-500' : ''}`}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h4 className="text-sm font-medium text-blue-600">{meeting.title}</h4>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMeetingStatusColor(meeting.status)}`}>
                              {meeting.status}
                            </span>
                            {meeting.status !== 'cancelled' && (
                              <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMeetingTimeStatus(meeting.date, meeting.startTime, meeting.endTime).className}`}>
                                {getMeetingTimeStatus(meeting.date, meeting.startTime, meeting.endTime).message}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-900">
                            {meeting.description}
                          </div>
                          <div className="mt-2 text-xs text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <span className="font-semibold">Date:</span> {formatDate(meeting.date)}
                            </div>
                            <div>
                              <span className="font-semibold">Time:</span> {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                            </div>
                            <div>
                              <span className="font-semibold">Location:</span> {meeting.location}
                            </div>
                            <div>
                              <span className="font-semibold">Participants:</span> {getParticipantsLabel(meeting.participants)}
                            </div>
                            <div>
                              <span className="font-semibold">Organizer:</span> {meeting.organizer?.name || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {user && ['admin', 'principal'].includes(user.role) && (
                        <div className="flex space-x-2">
                          <Link
                            to={`/meetings/edit/${meeting._id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/history/Meeting/${meeting._id}`}
                            className="text-green-600 hover:text-green-800"
                          >
                            History
                          </Link>
                          <button
                            onClick={() => handleCancelMeeting(meeting._id)}
                            disabled={cancellingMeeting === meeting._id || meeting.status === 'cancelled'}
                            className={`text-red-600 hover:text-red-800 ${
                              (cancellingMeeting === meeting._id || meeting.status === 'cancelled')
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            {cancellingMeeting === meeting._id ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Cancelling...
                              </span>
                            ) : meeting.status === 'cancelled' ? (
                              'Cancelled'
                            ) : (
                              'Cancel'
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsPage;
