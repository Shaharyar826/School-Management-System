import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { formatDate } from '../../utils/formatDate';
import { useContactMessages } from '../../context/ContactMessageContext';

const ContactMessageModal = ({ isOpen, onClose, messageId, onDelete }) => {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [rawData, setRawData] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const modalRef = useRef(null);
  const { fetchUnreadCount } = useContactMessages();

  useEffect(() => {
    if (isOpen && messageId) {
      fetchMessage();
    }
  }, [isOpen, messageId]);

  // Focus management effect
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  const fetchMessage = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching message with ID:', messageId);
      // Ensure we're using the correct API endpoint with the full URL
      const res = await axios.get(`http://localhost:5000/api/contact/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Message response:', res.data);
      setRawData(res.data);

      if (res.data.success && res.data.data) {
        const messageData = res.data.data;

        // Log detailed message information for debugging
        console.log('Message details:', {
          id: messageData._id,
          subject: messageData.subject,
          from: messageData.name,
          email: messageData.email,
          status: messageData.status,
          isRead: messageData.isRead,
          messageContent: messageData.message,
          messageLength: messageData.message ? messageData.message.length : 0,
          createdAt: messageData.createdAt
        });

        setMessage(messageData);

        // Mark as read if not already read
        if (!messageData.isRead) {
          markAsRead(messageId);
        }
      } else {
        console.error('Invalid message data format:', res.data);
        setError('The message data is not in the expected format');
      }
    } catch (err) {
      console.error('Error fetching contact message:', err);
      setError(`Failed to load message details. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/contact/${id}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update the unread count in the context
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);

      const res = await axios.delete(`http://localhost:5000/api/contact/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.data.success) {
        if (typeof onDelete === 'function') {
          onDelete(messageId);
        }
        onClose();
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(`Failed to delete message. Error: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ cursor: 'auto' }}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Improved backdrop with blur effect */}
        <div
          className="fixed inset-0"
          aria-hidden="true"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
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
              onClose();
            }
          }}
        >
          {loading ? (
            <div className="bg-white dark:bg-gray-800 p-8 flex flex-col justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Loading message...</p>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 p-6">
              <div className="flex items-center justify-center mb-4 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-medium">Error</span>
              </div>
              <div className="text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">{error}</div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          ) : message ? (
            <>
              <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    {/* Subject with icon */}
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white">
                        {message.subject}
                      </h3>
                    </div>

                    <div className="mb-5 pb-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-semibold">From:</span> <span className="font-bold ml-1">{message.name}</span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(message.createdAt)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold">Email:</span> <span className="font-bold ml-1">{message.email}</span>
                      </div>
                    </div>

                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base text-gray-800 dark:text-white font-semibold flex items-center" style={{ color: 'var(--text-secondary, #1f2937)' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          Message Content
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {message.message ? message.message.length : 0} characters
                        </span>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent w-1 rounded-l-md"></div>
                        <div
                          className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap p-5 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 min-h-[150px] shadow-inner pl-6"
                          style={{ userSelect: 'text', cursor: 'text' }}
                        >
                          {message.message
                            ? <pre style={{ fontFamily: 'inherit', margin: 0, fontSize: '1rem', fontWeight: 500, userSelect: 'text', cursor: 'text' }}>{message.message}</pre>
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

                    {/* Debug information toggle button */}
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowDebug(!showDebug)}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center px-3 py-1 rounded-full transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        {showDebug ? 'Hide Details' : 'Show Details'}
                      </button>
                    </div>

                    {/* Debug information - will be removed in production */}
                    {showDebug && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                      >
                        <h4 className="text-sm font-medium mb-3 flex items-center text-gray-800 dark:text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Message Details
                        </h4>
                        <div className="text-xs overflow-auto max-h-40 grid grid-cols-2 gap-2">
                          <div className="mb-2 col-span-2 sm:col-span-1">
                            <span className="font-semibold text-gray-800 dark:text-gray-100">Message ID:</span>
                            <span className="ml-1 text-gray-900 dark:text-white font-mono">{message._id}</span>
                          </div>
                          <div className="mb-2 col-span-2 sm:col-span-1">
                            <span className="font-semibold text-gray-800 dark:text-gray-100">Status:</span>
                            <span className={`ml-1 font-medium ${message.isRead ? 'text-green-600 dark:text-green-300' : 'text-yellow-600 dark:text-yellow-300'}`}>
                              {message.status} {message.isRead ? '(Read)' : '(Unread)'}
                            </span>
                          </div>
                          <div className="mb-2 col-span-2">
                            <span className="font-semibold text-gray-800 dark:text-gray-100">Created:</span>
                            <span className="ml-1 text-gray-900 dark:text-white">{formatDate(message.createdAt)}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 sm:px-6 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                  <button
                    type="button"
                    className="mt-3 sm:mt-0 w-full inline-flex justify-center items-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-colors duration-200"
                    onClick={onClose}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close
                  </button>

                  <button
                    type="button"
                    className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm transition-all duration-200"
                    onClick={handleDelete}
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
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6">
              <div className="text-center text-gray-500 dark:text-gray-400">
                Message not found
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ContactMessageModal;
