import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';
import { listenEvent, EVENT_TYPES } from '../utils/eventService';
import pollingService from '../services/pollingService';

// Create the context
const ContactMessageContext = createContext();

// Custom hook to use the contact message context
export const useContactMessages = () => useContext(ContactMessageContext);

// Provider component
export const ContactMessageProvider = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch unread contact message count
  const fetchUnreadCount = useCallback(async () => {
    // Only fetch if user is authenticated and is admin or principal
    if (!isAuthenticated || !user || !['admin', 'principal'].includes(user.role)) {
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get('/api/contact/unread-count', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.data.success) {
        console.log('Unread contact message count:', res.data.count);
        setUnreadCount(res.data.count);
      } else {
        console.error('Failed to fetch unread contact message count:', res.data.message);
      }
    } catch (error) {
      console.error('Error fetching unread contact message count:', error);
      setError('Failed to fetch unread contact message count');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Handle polling data updates
  const handlePollingUpdate = useCallback((data, error) => {
    if (error) {
      console.error('Error from polling service:', error);
      setError('Failed to fetch unread contact message count');
      setLoading(false);
      return;
    }

    if (data && data.success) {
      console.log('Unread contact message count from polling:', data.count);
      setUnreadCount(data.count);
      setError(null);
    } else {
      console.error('Failed to fetch unread contact message count from polling:', data?.message);
    }
    setLoading(false);
  }, []);

  // Mark a message as read and update the unread count
  const markMessageAsRead = useCallback(async (messageId) => {
    try {
      const res = await axios.put(`/api/contact/${messageId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.data.success) {
        // Decrement the unread count if it's greater than 0
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }, []);

  // Initial fetch and set up polling
  useEffect(() => {
    if (isAuthenticated && user && ['admin', 'principal'].includes(user.role)) {
      // Initial fetch
      fetchUnreadCount();

      // Subscribe to polling service instead of creating our own interval
      const unsubscribe = pollingService.subscribe('/api/contact/unread-count', handlePollingUpdate, 60000);

      // Set up event listener for new contact messages
      const removeListener = listenEvent(EVENT_TYPES.NEW_CONTACT_MESSAGE, () => {
        console.log('New contact message event received, updating unread count');
        // Force refresh through polling service
        pollingService.refresh('/api/contact/unread-count');
      });

      return () => {
        unsubscribe(); // Unsubscribe from polling service
        removeListener(); // Clean up event listener
      };
    } else {
      // Reset count if user is not authorized
      setUnreadCount(0);
    }
  }, [isAuthenticated, user, fetchUnreadCount, handlePollingUpdate]);

  // Value to be provided by the context
  const contextValue = {
    unreadCount,
    loading,
    error,
    fetchUnreadCount,
    markMessageAsRead
  };

  return (
    <ContactMessageContext.Provider value={contextValue}>
      {children}
    </ContactMessageContext.Provider>
  );
};

export default ContactMessageContext;
