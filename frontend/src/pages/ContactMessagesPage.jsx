import { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { formatDate } from '../utils/formatDate';
import { useContactMessages } from '../context/ContactMessageContext';

const ContactMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'read', 'unread'
  const modalRef = useRef(null);
  const { fetchUnreadCount } = useContactMessages();

  const fetchMessages = async (page = 1) => {
    try {
      setLoading(true);
      setError('');

      // Build query parameters based on filter
      let queryParams = `page=${page}&limit=10&sort=-createdAt`;

      if (filterStatus === 'read') {
        queryParams += '&isRead=true';
      } else if (filterStatus === 'unread') {
        queryParams += '&isRead=false';
      }

      const res = await axios.get(`http://localhost:5000/api/contact?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.data.success) {
        setMessages(res.data.data);
        setTotalPages(Math.ceil(res.data.total / 10));
        setTotalMessages(res.data.total);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Error fetching contact messages:', err);
      setError(`Failed to load contact messages. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filterStatus]);

  // Focus management effect
  useEffect(() => {
    if (isModalOpen) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';

      // Force focus to stay in the modal
      const handleFocus = () => {
        if (modalRef.current && !modalRef.current.contains(document.activeElement)) {
          modalRef.current.focus();
        }
      };

      // Set initial focus after a short delay
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);

      // Add event listener to keep focus in modal
      document.addEventListener('focusin', handleFocus);

      // Cleanup function
      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('focusin', handleFocus);
      };
    }
  }, [isModalOpen]);

  const handlePageChange = (page) => {
    fetchMessages(page);
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);

    // If message is not read, mark it as read
    if (!message.isRead) {
      markAsRead(message._id);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/contact/${id}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.data.success) {
        // Update the message in the list
        setMessages(messages.map(msg =>
          msg._id === id ? { ...msg, isRead: true, status: 'read' } : msg
        ));

        // Update selected message if it's open
        if (selectedMessage && selectedMessage._id === id) {
          setSelectedMessage({ ...selectedMessage, isRead: true, status: 'read' });
        }

        // Update the unread count in the context
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      setDeleteLoading(true);

      // Check if the message is unread before deleting
      const messageToDelete = messages.find(msg => msg._id === id);
      const wasUnread = messageToDelete && !messageToDelete.isRead;

      const res = await axios.delete(`http://localhost:5000/api/contact/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.data.success) {
        // Remove the message from the list
        setMessages(messages.filter(msg => msg._id !== id));

        // Close modal if the deleted message was selected
        if (selectedMessage && selectedMessage._id === id) {
          setIsModalOpen(false);
          setSelectedMessage(null);
        }

        // Update total count
        setTotalMessages(prev => prev - 1);

        // Recalculate total pages
        const newTotalPages = Math.ceil((totalMessages - 1) / 10);
        setTotalPages(newTotalPages);

        // If we deleted an unread message, update the unread count
        if (wasUnread) {
          fetchUnreadCount();
        }

        // If current page is now greater than total pages, go to last page
        if (currentPage > newTotalPages && newTotalPages > 0) {
          fetchMessages(newTotalPages);
        } else if (messages.length === 1 && currentPage > 1) {
          // If this was the last message on the page, go to previous page
          fetchMessages(currentPage - 1);
        } else if (messages.length > 1) {
          // Refresh current page
          fetchMessages(currentPage);
        }
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(`Failed to delete message. Error: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-school-navy-dark dark:text-white mb-4 sm:mb-0">
          Contact Messages
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label htmlFor="filter-status" className="mr-2 text-sm text-gray-600 dark:text-gray-300">
              Filter:
            </label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select rounded-md border-gray-300 dark:border-gray-600 text-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total: {totalMessages} message{totalMessages !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No contact messages found.</p>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Subject
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-50 dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {messages.map((message) => (
                    <tr
                      key={message._id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${!message.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          message.isRead
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {message.isRead ? 'Read' : 'New'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {message.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {message.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white truncate max-w-xs">
                          {message.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(message.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewMessage(message)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}

      {/* Message Detail Modal */}
      {isModalOpen && selectedMessage && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ cursor: 'auto' }}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Improved backdrop with blur effect */}
            <div
              className="fixed inset-0"
              aria-hidden="true"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(2px)' }}
              onClick={closeModal}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <motion.div
              ref={modalRef}
              tabIndex={0}
              className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ cursor: 'auto', position: 'relative', zIndex: 10000 }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  closeModal();
                }
              }}
            >
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    {/* Subject with icon */}
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white">
                        {selectedMessage.subject}
                      </h3>
                    </div>

                    <div className="mb-5 pb-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-semibold text-gray-800 dark:text-white">From:</span> <span className="font-bold ml-1">{selectedMessage.name}</span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(selectedMessage.createdAt)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold text-gray-800 dark:text-white">Email:</span> <span className="font-bold ml-1">{selectedMessage.email}</span>
                      </div>
                    </div>

                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                          </svg>
                          Message Content
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {selectedMessage.message ? selectedMessage.message.length : 0} characters
                        </span>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent w-1 rounded-l-md"></div>
                        <div
                          className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap p-5 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 min-h-[150px] shadow-inner pl-6"
                          style={{ userSelect: 'text', cursor: 'text' }}
                        >
                          {selectedMessage.message
                            ? <pre style={{ fontFamily: 'inherit', margin: 0, fontSize: '1rem', fontWeight: 500, userSelect: 'text', cursor: 'text' }}>{selectedMessage.message}</pre>
                            : <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 italic">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                No message content available
                              </div>
                          }
                        </div>
                      </div>
                    </div>

                    {/* Message details in a cleaner format */}
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                      <h4 className="text-sm font-medium mb-3 flex items-center text-gray-800 dark:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Message Details
                      </h4>
                      <div className="text-xs grid grid-cols-2 gap-2">
                        <div className="mb-2 col-span-2 sm:col-span-1">
                          <span className="font-semibold text-gray-800 dark:text-gray-100">Message ID:</span>
                          <span className="ml-1 text-gray-900 dark:text-white font-mono">{selectedMessage._id}</span>
                        </div>
                        <div className="mb-2 col-span-2 sm:col-span-1">
                          <span className="font-semibold text-gray-800 dark:text-gray-100">Status:</span>
                          <span className={`ml-1 font-medium ${selectedMessage.isRead ? 'text-green-600 dark:text-green-300' : 'text-yellow-600 dark:text-yellow-300'}`}>
                            {selectedMessage.status} {selectedMessage.isRead ? '(Read)' : '(Unread)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 sm:px-6 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                  <button
                    type="button"
                    className="mt-3 sm:mt-0 w-full inline-flex justify-center items-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-colors duration-200"
                    onClick={closeModal}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close
                  </button>

                  <button
                    type="button"
                    className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm transition-all duration-200"
                    onClick={() => handleDeleteMessage(selectedMessage._id)}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessagesPage;
