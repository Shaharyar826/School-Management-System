import { useContext } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import PublicDataContext from '../../context/PublicDataContext';

const EventsNotices = () => {
  const { eventsNotices, schoolSettings, loading } = useContext(PublicDataContext);

  // Don't render if the section is disabled in settings
  if (schoolSettings?.landingPage?.showEventsSection === false) {
    return null;
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Function to get priority badge color
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
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-school-navy-dark mb-4">Events & Notices</h2>
          <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Stay updated with the latest events, announcements, and activities at our school.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-school-yellow"></div>
          </div>
        ) : eventsNotices && eventsNotices.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {eventsNotices.map((item) => (
              <motion.div
                key={item._id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                {/* Image display removed as it's not necessary */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                      {(item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Event')}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {formatDate(item.date || item.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-school-navy-dark mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{item.content || item.description}</p>

                  {(!item.type || item.type === 'event') && (
                    <div className="mt-4 space-y-2 text-sm text-gray-500">
                      {item.startDate && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <span>
                            {formatDate(item.startDate)}
                            {item.endDate && ` - ${formatDate(item.endDate)}`}
                          </span>
                        </div>
                      )}

                      {item.eventTime && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>{item.eventTime}</span>
                        </div>
                      )}

                      {item.location && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {item.attachmentFile && item.attachmentFile.startsWith('http') && (
                    <div className="mt-4">
                      <a
                        href={item.attachmentFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-school-navy hover:text-school-navy-dark text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                        </svg>
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center text-gray-500">
            <p>No events or notices available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsNotices;
