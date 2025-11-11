import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import PublicDataContext from '../context/PublicDataContext';
import { emitEvent, EVENT_TYPES } from '../utils/eventService';

const ContactPage = () => {
  const { schoolSettings, loading, error, refreshData, admissionsContent } = useContext(PublicDataContext);


  // Debug logging
  useEffect(() => {
    console.log('ContactPage - schoolSettings:', schoolSettings);
    console.log('ContactPage - loading:', loading);
    console.log('ContactPage - error:', error);

    if (!schoolSettings && !loading) {
      console.log('Attempting to refresh data...');
      refreshData();
    }
  }, [schoolSettings, loading, error, refreshData]);

  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset submission states
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');

    try {
      // Send form data to API
      const response = await axios.post('/api/contact', formData);

      if (response.data.success) {
        // Clear form on success
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        setSubmitSuccess(true);

        // Emit an event to notify that a new contact message was submitted
        emitEvent(EVENT_TYPES.NEW_CONTACT_MESSAGE, response.data.data);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitError(error.response?.data?.message || 'Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <Navbar />

      {/* Only show error state, remove loading indicator */}
      {error && !loading && (
        <div className="container mx-auto px-4 py-8 mt-24">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <button
              className="bg-school-yellow text-school-navy-dark px-4 py-2 rounded mt-2"
              onClick={refreshData}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="relative pt-24 pb-12 bg-school-navy">
        <div className="absolute inset-0 bg-gradient-to-r from-school-navy/90 to-school-navy-dark/90 z-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
            <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              We'd love to hear from you. Reach out to us with any questions or inquiries.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-school-navy-dark mb-6">Send Us a Message</h2>

                {/* Success Message */}
                {submitSuccess && (
                  <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                    <p className="font-medium">Thank you for your message!</p>
                    <p>We have received your inquiry and will get back to you soon.</p>
                  </div>
                )}

                {/* Error Message */}
                {submitError && (
                  <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    <p className="font-medium">Error</p>
                    <p>{submitError}</p>
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-yellow focus:border-school-yellow"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-yellow focus:border-school-yellow"
                        placeholder="Your email"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-yellow focus:border-school-yellow"
                      placeholder="Subject of your message"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-yellow focus:border-school-yellow"
                      placeholder="Your message"
                      required
                    ></textarea>
                  </div>
                  <motion.button
                    type="submit"
                    className={`px-6 py-3 bg-school-yellow text-school-navy-dark font-medium rounded-md hover:bg-school-yellow-dark transition-colors duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </motion.button>
                </form>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-school-navy-dark mb-6">Contact Information</h2>
                <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-6 h-6 text-school-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-school-navy-dark mb-1">Address</h3>
                      <p className="text-gray-600">
                        {schoolSettings?.address ? (
                          `${schoolSettings.address.street}, ${schoolSettings.address.city}, ${schoolSettings.address.state}, ${schoolSettings.address.country}`
                        ) : (
                          '123 Education Street, Tando Jam, Sindh, Pakistan'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-6 h-6 text-school-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-school-navy-dark mb-1">Phone</h3>
                      <p className="text-gray-600">{schoolSettings?.phone || '+92 123 456 7890'}</p>
                    </div>
                  </div>
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-6 h-6 text-school-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-school-navy-dark mb-1">Email</h3>
                      <p className="text-gray-600">{schoolSettings?.email || 'info@communityhs.edu.pk'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-6 h-6 text-school-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-school-navy-dark mb-1">Office Hours</h3>
                      <p className="text-gray-600">
                        {schoolSettings?.schoolHours?.weekdays || 'Monday - Friday: 8:00 AM - 3:00 PM'}<br />
                        {schoolSettings?.schoolHours?.weekend || 'Saturday: 8:00 AM - 12:00 PM'}<br />
                        {schoolSettings?.schoolHours?.closed || 'Sunday: Closed'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Media Section */}
                <h2 className="text-2xl font-bold text-school-navy-dark mb-6">Connect With Us</h2>
                <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
                  <div className="flex flex-wrap gap-4">
                    {/* Facebook */}
                    <a
                      href={schoolSettings?.socialMedia?.facebook || "https://facebook.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                    </a>

                    {/* Twitter */}
                    <a
                      href={schoolSettings?.socialMedia?.twitter || "https://twitter.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                      </svg>
                    </a>

                    {/* Instagram */}
                    <a
                      href={schoolSettings?.socialMedia?.instagram || "https://instagram.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.041 0 2.67.01 2.986.058 4.04.045.977.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058 2.67 0 2.987-.01 4.04-.058.977-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041 0-2.67-.01-2.986-.058-4.04-.045-.977-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.041-.058zm0 3.063a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 8.468a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666zm6.538-8.469a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
                      </svg>
                    </a>

                    {/* LinkedIn */}
                    <a
                      href={schoolSettings?.socialMedia?.linkedin || "https://linkedin.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-school-navy-dark mb-6">Find Us</h2>
                <div className="rounded-lg overflow-hidden shadow-md h-80 bg-gray-200">
                  {/* Placeholder for Google Map */}
                    {/* google map */}
                    <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.2714321749!2d68.52037057609!3d25.426136583799285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDI1JzMzLjciTiA2OMKwMzEnMjAuOSJF!5e0!3m2!1sen!2s!4v1715778654321!5m2!1sen!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      {/* <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-school-navy-dark mb-4">Frequently Asked Questions</h2>
              <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
              <p className="text-gray-600">Find answers to common questions about our school.</p>
            </div>

            <div className="space-y-6">
              <motion.div
                className="bg-white p-6 rounded-lg shadow-md"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold text-school-navy-dark mb-2">What are the school hours?</h3>
                <p className="text-gray-600">
                  {schoolSettings?.schoolHours?.weekdays || 'Monday - Friday: 8:00 AM - 3:00 PM'}.
                  {schoolSettings?.schoolHours?.weekend && ` ${schoolSettings.schoolHours.weekend}.`}
                  {schoolSettings?.schoolHours?.closed && ` ${schoolSettings.schoolHours.closed}.`}
                </p>
              </motion.div>

              <motion.div
                className="bg-white p-6 rounded-lg shadow-md"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold text-school-navy-dark mb-2">How can I apply for admission?</h3>
                <p className="text-gray-600">You can apply for admission by visiting our Admissions page, downloading the application form, and submitting it along with the required documents to our administrative office.</p>
              </motion.div>

              <motion.div
                className="bg-white p-6 rounded-lg shadow-md"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold text-school-navy-dark mb-2">What extracurricular activities do you offer?</h3>
                <p className="text-gray-600">We offer a wide range of extracurricular activities including sports (cricket, football, basketball), arts (music, drama, painting), and academic clubs (science, mathematics, debate).</p>
              </motion.div>

              <motion.div
                className="bg-white p-6 rounded-lg shadow-md"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold text-school-navy-dark mb-2">How can I check my child's academic progress?</h3>
                <p className="text-gray-600">Parents can check their child's academic progress through our online portal, parent-teacher meetings, and quarterly report cards.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div> */}
<div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-school-navy-dark mb-4">
                {admissionsContent?.faqSection?.title || 'Frequently Asked Questions'}
              </h2>
              <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
              <p className="text-gray-600">
                {admissionsContent?.faqSection?.subtitle || 'Find answers to common questions about our admissions process.'}
              </p>
            </div>

            <div className="space-y-6">
              {admissionsContent?.faqSection?.faqs?.length > 0 ? (
                admissionsContent.faqSection.faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    className="bg-white p-6 rounded-lg shadow-md"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-bold text-school-navy-dark mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </motion.div>
                ))
              ) : (
                <>
                  <motion.div
                    className="bg-white p-6 rounded-lg shadow-md"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-bold text-school-navy-dark mb-2">When can I apply for admission?</h3>
                    <p className="text-gray-600">Admissions are open throughout the year, but we recommend applying at least 2-3 months before the start of the academic year in August.</p>
                  </motion.div>

                  <motion.div
                    className="bg-white p-6 rounded-lg shadow-md"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-bold text-school-navy-dark mb-2">Is there an age requirement for admission?</h3>
                    <p className="text-gray-600">Yes, students must meet the minimum age requirement for their respective grade level as of August 31st of the academic year.</p>
                  </motion.div>

                  <motion.div
                    className="bg-white p-6 rounded-lg shadow-md"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-bold text-school-navy-dark mb-2">Are there any scholarships available?</h3>
                    <p className="text-gray-600">Yes, we offer merit-based and need-based scholarships. Please contact our admissions office for more information on eligibility criteria and application process.</p>
                  </motion.div>

                  <motion.div
                    className="bg-white p-6 rounded-lg shadow-md"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-bold text-school-navy-dark mb-2">What is the student-teacher ratio?</h3>
                    <p className="text-gray-600">We maintain a student-teacher ratio of 20:1 to ensure personalized attention and quality education for all students.</p>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>





      <Footer />
    </div>
  );
};

export default ContactPage;
