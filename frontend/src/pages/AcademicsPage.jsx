// import { useEffect, useContext } from 'react';
// import { motion } from 'framer-motion';
// import Navbar from '../components/landing/Navbar';
// import Footer from '../components/landing/Footer';
// import PublicDataContext from '../context/PublicDataContext';
// import LoadingSpinner from '../components/common/LoadingSpinner';

// const AcademicsPage = () => {
//   const { loading, academicsContent } = useContext(PublicDataContext);

//   // Scroll to top when component mounts
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   if (loading || !academicsContent) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <div className="academics-page">
//       <Navbar />

//       {/* Page Header */}
//       <div className="relative pt-24 pb-12 bg-school-navy">
//         <div className="absolute inset-0 bg-gradient-to-r from-school-navy/90 to-school-navy-dark/90 z-10"></div>
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
//           <motion.div
//             className="text-center py-12"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <h1 className="text-4xl font-bold text-white mb-4">Academics</h1>
//             <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
//             <p className="text-xl text-gray-200 max-w-3xl mx-auto">
//               Discover our comprehensive curriculum and educational approach.
//             </p>
//           </motion.div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="py-16 bg-white">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="max-w-4xl mx-auto">
//             {/* Main Content from CMS */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//               className="mb-16"
//             >
//               <div dangerouslySetInnerHTML={{ __html: academicsContent.mainContent }} />
//             </motion.div>
//             {/* Curriculum Section from CMS */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.3 }}
//               className="mb-16"
//             >
//               <h2 className="text-3xl font-bold text-school-navy-dark mb-6">{academicsContent.curriculum.title}</h2>
//               <div dangerouslySetInnerHTML={{ __html: academicsContent.curriculum.content }} />
//             </motion.div>
//             {/* Subjects Offered Section from CMS */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.35 }}
//               className="mb-16"
//             >
//               <h2 className="text-3xl font-bold text-school-navy-dark mb-6">{academicsContent.subjectsOffered.title}</h2>
//               <div dangerouslySetInnerHTML={{ __html: academicsContent.subjectsOffered.content }} />
//             </motion.div>
//             {/* Academic Calendar Section from CMS */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.4 }}
//               className="mb-16"
//             >
//               <h2 className="text-3xl font-bold text-school-navy-dark mb-6">{academicsContent.academicCalendar.title}</h2>
//               <div dangerouslySetInnerHTML={{ __html: academicsContent.academicCalendar.content }} />
//             </motion.div>
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default AcademicsPage;



import { useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import PublicDataContext from '../context/PublicDataContext';
import PageLoader from '../components/common/PageLoader';

const AcademicsPage = () => {
  const { loading, academicsContent } = useContext(PublicDataContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    philosophyTitle,
    philosophyIntro,
    approachList = [],
    goalsList = [],
    curriculumTitle,
    curriculumIntro,
    primaryLevel = {},
    middleLevel = {},
    highSchoolLevel = {},
    assessmentTitle,
    assessmentIntro,
    assessmentMethods = [],
    gradingTable = [],
    supportTitle,
    supportIntro,
    supportServices = [],
    learningResources = [],
  } = academicsContent || {};

  return (
    <PageLoader skeletonType="content" showSkeleton={true}>
      <div className="academics-page">
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
            <h1 className="text-4xl font-bold text-white mb-4">Academics</h1>
            <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Discover our comprehensive curriculum and educational approach.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">

            {/* Philosophy Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-school-navy-dark mb-6">{philosophyTitle || 'Our Educational Philosophy'}</h2>
              <div className="text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: philosophyIntro }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-school-navy-dark mb-3">Our Approach</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    {approachList.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-school-navy-dark mb-3">Our Goals</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    {goalsList.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Curriculum Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-school-navy-dark mb-6">{curriculumTitle || 'Curriculum'}</h2>
              <div className="text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: curriculumIntro }} />

              {/* Primary Level */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-school-navy-dark mb-3">{primaryLevel.title || 'Primary Level (Grades 1-5)'}</h3>
                <div className="text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: primaryLevel.intro }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-school-navy mb-2">Core Subjects:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      {(primaryLevel.coreSubjects || []).map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-school-navy mb-2">Additional Subjects:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      {(primaryLevel.additionalSubjects || []).map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Middle Level */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-school-navy-dark mb-3">{middleLevel.title || 'Middle Level (Grades 6-8)'}</h3>
                <div className="text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: middleLevel.intro }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-school-navy mb-2">Core Subjects:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      {(middleLevel.coreSubjects || []).map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-school-navy mb-2">Additional Subjects:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      {(middleLevel.additionalSubjects || []).map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* High School Level */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-school-navy-dark mb-3">{highSchoolLevel.title || 'High School Level (Grades 9-10)'}</h3>
                <div className="text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: highSchoolLevel.intro }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-school-navy mb-2">Science Stream:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      {(highSchoolLevel.scienceStream || []).map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-school-navy mb-2">Arts Stream:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      {(highSchoolLevel.artsStream || []).map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Assessment & Grading Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-school-navy-dark mb-6">{assessmentTitle || 'Assessment & Grading'}</h2>
              <div className="text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: assessmentIntro }} />

              <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-school-navy-dark mb-3">Assessment Methods</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  {assessmentMethods.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-school-navy-dark mb-3">Grading System</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-school-navy text-white">
                        <th className="py-3 px-4 text-left">Percentage Range</th>
                        <th className="py-3 px-4 text-left">Grade</th>
                        <th className="py-3 px-4 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {gradingTable.map((row, idx) => (
                        <tr key={idx}>
                          <td className="py-3 px-4">{row.range}</td>
                          <td className="py-3 px-4 font-medium">{row.grade}</td>
                          <td className="py-3 px-4">{row.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>

            {/* Academic Support Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-school-navy-dark mb-6">{supportTitle || 'Academic Support'}</h2>
              <div className="text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: supportIntro }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-school-navy-dark mb-3">Support Services</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    {supportServices.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-school-navy-dark mb-3">Learning Resources</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    {learningResources.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

        <Footer />
      </div>
    </PageLoader>
  );
};

export default AcademicsPage;