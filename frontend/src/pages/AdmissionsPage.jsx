import { useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import PublicDataContext from '../context/PublicDataContext';
import PageLoader from '../components/common/PageLoader';

const AdmissionsPage = () => {
  const { loading, admissionsContent, schoolSettings } = useContext(PublicDataContext);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Helper function to render documents section
  const renderDocumentsSection = () => {
    if (!admissionsContent?.requiredDocuments?.documentsList?.length) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No documents list has been configured yet. Please update the admissions content in the dashboard.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <ul className="list-disc pl-6 space-y-2 text-gray-600">
        {admissionsContent.requiredDocuments.documentsList.map((doc, index) => (
          <li key={index}>{doc.text}</li>
        ))}
      </ul>
    );
  };

  // Helper function to render fees section
  const renderFeesSection = () => {
    if (!admissionsContent?.feeStructure?.fees?.length) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No fee structure has been configured yet. Please update the admissions content in the dashboard.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-school-navy text-white">
                <th className="py-3 px-4 text-left">Fee Type</th>
                <th className="py-3 px-4 text-left">Amount (PKR)</th>
                <th className="py-3 px-4 text-left">Frequency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admissionsContent.feeStructure.fees.map((fee, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-3 px-4 font-medium">{fee.feeType}</td>
                  <td className="py-3 px-4">{fee.amount}</td>
                  <td className="py-3 px-4">{fee.frequency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {admissionsContent.feeStructure.disclaimer && (
          <p className="text-sm text-gray-500 mt-4">
            {admissionsContent.feeStructure.disclaimer}
          </p>
        )}
      </>
    );
  };

  // Function to handle direct file download
  const handleDownloadFile = async (fileUrl, fileName) => {
    try {
      // Fetch the file as a blob
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'download.pdf';
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  // Helper function to render downloadable files
  const renderDownloadableFiles = () => {
    if (!admissionsContent?.downloadableFiles?.length) {
      return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                No downloadable files have been uploaded yet. Please add files in the dashboard.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {admissionsContent.downloadableFiles.filter(file => file.file && file.file.startsWith('http')).map((file, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-school-navy-dark">{file.title}</h4>
              {file.description && <p className="text-sm text-gray-600 mt-1">{file.description}</p>}
            </div>
            <button
              onClick={() => handleDownloadFile(file.file, file.title || 'application-form.pdf')}
              className="px-4 py-2 bg-school-yellow text-school-navy-dark rounded-md hover:bg-school-yellow-dark transition-colors duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <PageLoader skeletonType="content" showSkeleton={true}>
      <div className="admissions-page">
        <Navbar />

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
            <h1 className="text-4xl font-bold text-white mb-4">
              {admissionsContent?.headerSection?.title || 'Admissions'}
            </h1>
            <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              {admissionsContent?.headerSection?.subtitle || 'Join our community of learners and begin your educational journey with us.'}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Main Content Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: admissionsContent?.mainContent || 'Content loading...' }}></div>
            </motion.div>

            {/* Admission Criteria Section */}
            {admissionsContent?.admissionCriteria && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, amount: 0.2 }}
                className="mb-12"
              >
                <h2 className="text-3xl font-bold text-school-navy-dark mb-6">
                  {admissionsContent.admissionCriteria.title || 'Admission Criteria'}
                </h2>
                <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: admissionsContent.admissionCriteria.content || 'Admission criteria content goes here.' }}></div>
              </motion.div>
            )}

            {/* Application Process Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-school-navy-dark mb-6">
                {admissionsContent?.applicationProcess?.title || 'Application Process'}
              </h2>
              <div className="text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: admissionsContent?.applicationProcess?.content || 'Our application process description goes here.' }}></div>

              {admissionsContent?.applicationProcess?.steps?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {admissionsContent.applicationProcess.steps.map((step, index) => (
                    <motion.div
                      key={index}
                      className="bg-gray-50 p-6 rounded-lg shadow-md text-center"
                      whileHover={{ y: -5, scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-12 h-12 bg-school-yellow-light rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-school-yellow-dark font-bold text-xl">{step.stepNumber}</span>
                      </div>
                      <h3 className="text-xl font-bold text-school-navy-dark mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        No application steps have been configured yet. Please update the admissions content in the dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Required Documents Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-school-navy-dark mb-6">
                {admissionsContent?.requiredDocuments?.title || 'Required Documents'}
              </h2>
              <div className="text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: admissionsContent?.requiredDocuments?.content || 'Please ensure you have all required documents ready.' }}></div>
              {renderDocumentsSection()}
            </motion.div>

            {/* Fee Structure Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-school-navy-dark mb-6">
                {admissionsContent?.feeStructure?.title || 'Fee Structure'}
              </h2>
              <div className="text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: admissionsContent?.feeStructure?.content || 'Our current fee structure is listed below.' }}></div>
              {renderFeesSection()}
            </motion.div>

            {/* Apply Now Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-school-navy-dark mb-6">
                {admissionsContent?.applyNow?.title || 'Apply Now'}
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="text-gray-600 mb-6" dangerouslySetInnerHTML={{ __html: admissionsContent?.applyNow?.content || 'Ready to begin your application process?' }}></div>

                {/* Downloadable Files */}
                <h3 className="text-xl font-semibold text-school-navy-dark mb-4">Application Materials</h3>
                {renderDownloadableFiles()}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  {admissionsContent?.downloadableFiles?.length > 0 && admissionsContent.downloadableFiles[0].file?.startsWith('http') && (
                    <motion.button
                      onClick={() => handleDownloadFile(
                        admissionsContent.downloadableFiles[0].file,
                        admissionsContent.downloadableFiles[0].title || 'application-form.pdf'
                      )}
                      className="px-6 py-3 bg-school-yellow text-school-navy-dark font-medium rounded-md hover:bg-school-yellow-dark transition-colors duration-200 text-center flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {admissionsContent?.applyNow?.primaryButtonText || 'Download Application Form'}
                    </motion.button>
                  )}
                  <motion.a
                    href="/contact"
                    className="px-6 py-3 bg-school-navy text-white font-medium rounded-md hover:bg-school-navy-dark transition-colors duration-200 text-center flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {admissionsContent?.applyNow?.secondaryButtonText || 'Contact Admissions Office'}
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
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
    </PageLoader>
  );
};

export default AdmissionsPage;