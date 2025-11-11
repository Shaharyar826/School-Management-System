import { useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import About from '../components/landing/About';
import FeaturedTeachers from '../components/landing/FeaturedTeachers';
import EventsNotices from '../components/landing/EventsNotices';
import Testimonials from '../components/landing/Testimonials';
import Footer from '../components/landing/Footer';
import PublicDataContext from '../context/PublicDataContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LandingPage = () => {
  const { schoolSettings, schoolStats, loading, initialLoad, error } = useContext(PublicDataContext);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show loading state
  if (loading || initialLoad) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <div className="w-20 h-20 bg-school-yellow rounded-full flex items-center justify-center mx-auto shadow-lg mb-4">
              <svg
                className="w-10 h-10 text-school-navy-dark"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white" style={{ color: 'var(--text-primary, #111827)' }}>
              School Management System
            </h2>
          </div>

          <div className="mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-school-yellow mx-auto"></div>
          </div>

          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900 dark:text-white" style={{ color: 'var(--text-primary, #111827)' }}>
              Loading dynamic content from server...
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300" style={{ color: 'var(--text-secondary, #374151)' }}>
              Please wait while we fetch the latest content...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Content
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-school-yellow hover:bg-school-orange text-school-navy-dark font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <About />
      <FeaturedTeachers />
      <EventsNotices />
      <Testimonials />

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-school-navy-dark mb-4">Why Choose Us</h2>
            <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              We provide a nurturing environment where students can excel academically and develop personally.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              className="bg-gray-50 rounded-lg p-6 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="w-14 h-14 bg-school-yellow-light rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-school-yellow-dark" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-school-navy-dark mb-3">Quality Education</h3>
              <p className="text-gray-600">
                Our curriculum is designed to provide a comprehensive education that prepares students for future academic and professional success.
              </p>
            </motion.div>

            <motion.div
              className="bg-gray-50 rounded-lg p-6 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="w-14 h-14 bg-school-yellow-light rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-school-yellow-dark" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-school-navy-dark mb-3">Experienced Faculty</h3>
              <p className="text-gray-600">
                Our teachers are highly qualified professionals who are dedicated to helping students achieve their full potential.
              </p>
            </motion.div>

            <motion.div
              className="bg-gray-50 rounded-lg p-6 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="w-14 h-14 bg-school-yellow-light rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-school-yellow-dark" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-school-navy-dark mb-3">Supportive Community</h3>
              <p className="text-gray-600">
                We foster a supportive and inclusive community where students feel valued, respected, and encouraged to participate.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {schoolSettings?.landingPage?.showStatsSection !== false && (
        <section className="py-16 bg-school-navy text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="text-4xl font-bold text-school-yellow mb-2">
                  {loading ? '...' :
                    schoolStats?.studentCount ?
                      (schoolStats.studentCount > 100 ? `${schoolStats.studentCount}+` : schoolStats.studentCount) :
                      '500+'}
                </div>
                <div className="text-gray-300">Students</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="text-4xl font-bold text-school-yellow mb-2">
                  {loading ? '...' :
                    schoolStats?.teacherCount ?
                      (schoolStats.teacherCount > 10 ? `${schoolStats.teacherCount}+` : schoolStats.teacherCount) :
                      '50+'}
                </div>
                <div className="text-gray-300">Teachers</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="text-4xl font-bold text-school-yellow mb-2">
                  {schoolSettings?.establishedYear ?
                    `${new Date().getFullYear() - schoolSettings.establishedYear}+` :
                    '25+'}
                </div>
                <div className="text-gray-300">Years of Excellence</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="text-4xl font-bold text-school-yellow mb-2">
                  {loading ? '...' :
                    schoolStats?.successRate ?
                      `${schoolStats.successRate}%` :
                      '95%'}
                </div>
                <div className="text-gray-300">Success Rate</div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-white rounded-lg shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-school-navy-dark mb-4">Ready to Join Our School?</h2>
                <p className="text-gray-600 mb-6">
                  Take the first step towards a bright future. Apply for admission or contact us to learn more about our programs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.a
                    href="/admissions"
                    className="px-6 py-3 bg-school-yellow text-school-navy-dark font-medium rounded-md hover:bg-school-yellow-dark transition-colors duration-200 text-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Apply Now
                  </motion.a>
                  <motion.a
                    href="/contact"
                    className="px-6 py-3 bg-transparent border border-school-navy text-school-navy-dark font-medium rounded-md hover:bg-school-navy hover:text-white transition-colors duration-200 text-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Contact Us
                  </motion.a>
                </div>
              </div>
              <div className="hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                  alt="Students"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/600x400?text=Students';
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
