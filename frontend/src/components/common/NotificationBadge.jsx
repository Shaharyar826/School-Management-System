import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import pollingService from '../../services/pollingService';

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Handle polling data updates
  const handlePollingUpdate = useCallback((data, error) => {
    if (error) {
      console.error('Error from notification polling service:', error);
      setLoading(false);
      return;
    }

    if (data && data.success) {
      setUnreadCount(data.count);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    // Subscribe to polling service instead of creating our own interval
    const unsubscribe = pollingService.subscribe('/api/notifications/unread-count', handlePollingUpdate, 60000);

    return () => {
      unsubscribe(); // Unsubscribe from polling service
    };
  }, [handlePollingUpdate]);

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      console.log('Fetching unread notification count');
      const res = await axios.get('/api/notifications/unread-count');

      console.log('Unread notification response:', res.data);

      if (res.data.success) {
        setUnreadCount(res.data.count);
      } else {
        console.error('Failed to fetch unread count:', res.data.message);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
      // Don't show any error UI in the badge, just log it
      // This prevents UI disruption for a non-critical feature
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link to="/notifications" className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-gray-400 hover:text-school-yellow transition-colors duration-200"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBadge;
