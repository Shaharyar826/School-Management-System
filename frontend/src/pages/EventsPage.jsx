import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { getEventsPageContent } from '../services/eventsPageContentApi';
import CloudinaryImage from '../components/common/CloudinaryImage';

const EventsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState({ events: [], news: [], calendar: [] });
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await getEventsPageContent();
      setContent(data);
    } catch (err) {
      setError('Failed to load events page content.');
    }
    setLoading(false);
  };

  const events = Array.isArray(content.events) ? content.events.filter(e => e.isActive) : [];
  const news = Array.isArray(content.news) ? content.news.filter(n => n.isActive) : [];
  const calendar = Array.isArray(content.calendar) ? content.calendar.filter(c => c.isActive) : [];
  const categories = ['All', ...Array.from(new Set(events.map(event => event.category || 'Other')))]
  const filteredEvents = selectedCategory === 'All' ? events : events.filter(event => (event.category) === selectedCategory);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-school-yellow"></div></div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;

  return (
    <div className="events-page">
      <Navbar />
      {/* Page Header */}
      <div className="relative pt-24 pb-12 bg-school-navy">
        <div className="absolute inset-0 bg-gradient-to-r from-school-navy/90 to-school-navy-dark/90 z-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <motion.div className="text-center py-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-bold text-white mb-4">Events & News</h1>
            <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">Stay updated with the latest events, activities, and news from our school community.</p>
          </motion.div>
        </div>
      </div>
      {/* Latest News Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-16">
            <h2 className="text-3xl font-bold text-school-navy-dark mb-8 text-center">Latest News</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {news.map((newsItem, idx) => (
                <motion.div key={idx} className="bg-gray-50 rounded-lg shadow-md overflow-hidden" whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} transition={{ duration: 0.2 }}>
                  <div className="h-48 overflow-hidden">
                    <CloudinaryImage src={newsItem.image} alt={newsItem.title} fallbackSrc="https://via.placeholder.com/400x200?text=News" className="w-full h-full object-cover" placeholderClassName="w-full h-full" errorClassName="w-full h-full" />
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-gray-500 mb-2">{newsItem.date && new Date(newsItem.date).toLocaleDateString()}</div>
                    <h3 className="text-xl font-bold text-school-navy-dark mb-3">{newsItem.title}</h3>
                    <p className="text-gray-600 mb-4">{newsItem.summary}</p>
                    <motion.button className="text-school-yellow-dark font-medium hover:text-school-yellow transition-colors duration-200" whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>Read More →</motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          {/* Upcoming Events Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <h2 className="text-3xl font-bold text-school-navy-dark mb-8 text-center">Upcoming Events</h2>
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center mb-8 gap-2">
              {categories.map((category) => (
                <motion.button key={category} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedCategory === category ? 'bg-school-yellow text-school-navy-dark' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} onClick={() => setSelectedCategory(category)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>{category}</motion.button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.length === 0 ? <div className="col-span-full text-center text-gray-400">No events found.</div> : filteredEvents.map((event, idx) => (
                <motion.div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200" whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} transition={{ duration: 0.2 }} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="h-48 overflow-hidden relative">
                    <CloudinaryImage src={event.image} alt={event.title} fallbackSrc="https://via.placeholder.com/400x200?text=Event" className="w-full h-full object-cover" placeholderClassName="w-full h-full" errorClassName="w-full h-full" />
                    <div className="absolute top-0 right-0 bg-school-yellow text-school-navy-dark px-3 py-1 m-2 rounded-full text-xs font-medium">{event.category || 'Other'}</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-school-navy-dark mb-2">{event.title}</h3>
                    <div className="flex items-center text-gray-500 text-sm mb-1">{event.date && <span>{new Date(event.date).toLocaleDateString()}</span>}</div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">{event.time && <span>{event.time}</span>}</div>
                    <div className="flex items-center text-gray-500 text-sm mb-3">{event.location && <span>{event.location}</span>}</div>
                    <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                    <motion.button className="px-4 py-2 bg-school-yellow text-school-navy-dark rounded-md font-medium hover:bg-school-yellow-dark transition-colors duration-200" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>View Details</motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      {/* Calendar Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true, amount: 0.2 }}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-school-navy-dark mb-4">Academic Calendar</h2>
              <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
              <p className="text-gray-600">Important dates for the academic year</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-school-navy-dark mb-4">First Semester</h3>
                  <ul className="space-y-4">
                    {calendar.filter(c => c.semester === 'First').map((item, idx) => (
                      <li className="flex" key={idx}>
                        <div className="flex-shrink-0 w-20 font-medium text-school-yellow-dark">{item.date}</div>
                        <div className="flex-grow">{item.title}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-school-navy-dark mb-4">Second Semester</h3>
                  <ul className="space-y-4">
                    {calendar.filter(c => c.semester === 'Second').map((item, idx) => (
                      <li className="flex" key={idx}>
                        <div className="flex-shrink-0 w-20 font-medium text-school-yellow-dark">{item.date}</div>
                        <div className="flex-grow">{item.title}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventsPage;
