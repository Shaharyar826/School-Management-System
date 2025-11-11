import { useContactMessages } from '../../context/ContactMessageContext';
import { useEffect } from 'react';

const ContactMessageBadge = () => {
  const { unreadCount } = useContactMessages();

  // Log when the badge renders with a new count
  useEffect(() => {
    console.log('ContactMessageBadge rendering with unread count:', unreadCount);
  }, [unreadCount]);

  // Only render the badge if there are unread messages
  if (unreadCount <= 0) {
    return null;
  }

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
};

export default ContactMessageBadge;
