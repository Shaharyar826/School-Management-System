import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const NoticeList = ({ limit = 5, showAddButton = false, onEditClick = null, filter = {}, isDashboard = false, notices: providedNotices = null }) => {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // If notices are provided as a prop, use them
    if (providedNotices) {
      setNotices(providedNotices);
      setLoading(false);
    } else {
      // Otherwise fetch from API
      fetchNotices();
    }
  }, [providedNotices, limit, filter]);

  const fetchNotices = async () => {
    // Skip fetching if notices are provided as props
    if (providedNotices) return;

    try {
      setLoading(true);

      // Build query parameters
      let queryParams = `limit=${limit}&sort=-createdAt`;

      // Add filter parameters if provided
      if (filter && Object.keys(filter).length > 0) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value) {
            queryParams += `&${key}=${value}`;
          }
        });
      }

      const res = await axios.get(`/api/events-notices?${queryParams}`);

      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch events and notices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get event/notice status based on dates
  const getDateStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (end && now > end) {
      return {
        status: 'expired',
        message: 'This item has expired',
        className: 'bg-gray-100 text-gray-600'
      };
    } else if (start > now) {
      const days = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
      return {
        status: 'upcoming',
        message: `Starting in ${days} day${days !== 1 ? 's' : ''}`,
        className: 'bg-blue-100 text-blue-600'
      };
    } else if (end && now >= start && now <= end) {
      return {
        status: 'active',
        message: 'Currently active',
        className: 'bg-green-100 text-green-600'
      };
    } else if (!end && now >= start) {
      return {
        status: 'active',
        message: 'Currently active',
        className: 'bg-green-100 text-green-600'
      };
    }

    return {
      status: 'unknown',
      message: '',
      className: ''
    };
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const res = await axios.delete(`/api/events-notices/${id}`);
        if (res.data.success) {
          fetchNotices();
        }
      } catch (err) {
        console.error('Error deleting item:', err);
      }
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-md ${isDashboard ? 'h-full' : ''}`}>
      {!isDashboard && (
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Events & Notices</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Latest events, updates and announcements
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={fetchNotices}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            {showAddButton && user && ['admin', 'principal'].includes(user.role) && (
              <Link
                to="/events-notices"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New
              </Link>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 mx-4">
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

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : notices.length === 0 ? (
        <div id="no-events-message" className="px-4 py-8 text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No events or notices found</p>
        </div>
      ) : (
        <ul className={`divide-y divide-gray-200 ${isDashboard ? 'max-h-[400px] overflow-y-auto' : ''}`}>
          {notices.map((notice) => (
            <li key={notice._id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${notice.type === 'event' ? 'border-l-4 border-green-500' : ''}`}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={isDashboard ? '' : 'ml-4'}>
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-blue-600">{notice.title}</h4>
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(notice.priority)}`}>
                          {notice.priority}
                        </span>
                        {notice.type === 'event' && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Event
                          </span>
                        )}
                        {/* Date status badge */}
                        {notice.startDate && (
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDateStatus(notice.startDate, notice.endDate).className}`}>
                            {getDateStatus(notice.startDate, notice.endDate).message}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-900">
                        {notice.content}
                      </div>

                      {/* Date information - visible for all notices and events */}
                      <div className="mt-2 text-xs text-gray-600 border-l-2 border-blue-200 pl-2">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">
                            {notice.startDate ? formatDate(notice.startDate) : 'No start date'}
                            {notice.endDate ? ` - ${formatDate(notice.endDate)}` : ''}
                          </span>
                        </div>
                      </div>

                      {notice.type === 'event' && (notice.eventTime || notice.location) && (
                        <div className="mt-1 text-xs text-gray-600">
                          {notice.eventTime && (
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{notice.eventTime}</span>
                            </div>
                          )}
                          {notice.location && (
                            <div className="flex items-center mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{notice.location}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {notice.attachmentFile && notice.attachmentFile.startsWith('http') && (
                        <div className="mt-2">
                          <a
                            href={notice.attachmentFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                          >
                            {notice.attachmentFile.toLowerCase().includes('.pdf') || notice.attachmentFile.toLowerCase().endsWith('.pdf') ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                            View Attachment
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-sm text-gray-500">
                    <div className="flex flex-col items-end">
                      <div>Posted: {formatDate(notice.createdAt)}</div>
                    </div>
                    <div className="mt-1">
                      By: {notice.createdBy?.name || 'Unknown'}
                    </div>

                    {user && ['admin', 'principal'].includes(user.role) && (
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => onEditClick ? onEditClick(notice) : null}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <Link
                          to={`/history/EventNotice/${notice._id}`}
                          className="text-green-600 hover:text-green-800"
                        >
                          History
                        </Link>
                        <button
                          onClick={() => handleDelete(notice._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NoticeList;
