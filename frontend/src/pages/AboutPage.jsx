import { useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import PublicDataContext from '../context/PublicDataContext';
import PageLoader from '../components/common/PageLoader';
// Fallback images for About Us page
const FALLBACK_IMAGES = {
  BANNER: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=600&q=80',
  AVATAR: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&h=128&q=80'
};

const AboutPage = () => {
  const { loading, aboutUsContent, schoolSettings } = useContext(PublicDataContext);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageLoader skeletonType="about" showSkeleton={true}>
      <div className="about-page">
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
            <h1 className="text-4xl font-bold text-white mb-4">About Us</h1>
            <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Learn about our history, mission, vision, and the values that guide us.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-school-navy-dark mb-6">Our Story</h2>
            <div className="text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: aboutUsContent?.mainContent || 'Content loading...' }}></div>

            <div className="my-12">
              <img
                src={aboutUsContent?.bannerImage && aboutUsContent.bannerImage.startsWith('http') ? aboutUsContent.bannerImage : FALLBACK_IMAGES.BANNER}
                alt="School History"
                className="w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_IMAGES.BANNER;
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-school-navy-dark mb-4">{aboutUsContent?.vision?.title || 'Our Vision'}</h3>
                <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: aboutUsContent?.vision?.content || 'Vision content loading...' }}></div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-school-navy-dark mb-4">{aboutUsContent?.mission?.title || 'Our Mission'}</h3>
                <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: aboutUsContent?.mission?.content || 'Mission content loading...' }}></div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-school-navy-dark mb-6">{aboutUsContent?.leadership?.title || 'Our Leadership'}</h2>
            <div className="text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: aboutUsContent?.leadership?.description || 'Our school is led by a team of dedicated educators and administrators who are committed to maintaining high standards of education and fostering a positive learning environment.' }}></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
              {aboutUsContent?.leadership?.team && aboutUsContent.leadership.team.length > 0 ? (
                aboutUsContent.leadership.team.map((member, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-md">
                    {member.photo && member.photo.startsWith('http') ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGES.AVATAR;
                        }}
                      />
                    ) : (
                      <div className="w-32 h-32 bg-school-navy-light rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-16 h-16 text-school-navy" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-school-navy-dark text-center mb-2">{member.name}</h3>
                    <p className="text-school-yellow-dark text-center mb-4">{member.position}</p>
                    <p className="text-gray-600 text-center">{member.description}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                    <img
                      src={schoolSettings?.principalImage && schoolSettings.principalImage.startsWith('http') ? schoolSettings.principalImage : FALLBACK_IMAGES.AVATAR}
                      alt="Principal"
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGES.AVATAR;
                      }}
                    />
                    <h3 className="text-xl font-bold text-school-navy-dark text-center mb-2">{schoolSettings?.principalName || 'School Principal'}</h3>
                    <p className="text-school-yellow-dark text-center mb-4">Principal</p>
                    <p className="text-gray-600 text-center">
                      With years of experience in education, our principal leads the institution with vision and dedication.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                    <img
                      src={schoolSettings?.viceImage && schoolSettings.viceImage.startsWith('http') ? schoolSettings.viceImage : FALLBACK_IMAGES.AVATAR}
                      alt="Vice Principal"
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGES.AVATAR;
                      }}
                    />
                    <h3 className="text-xl font-bold text-school-navy-dark text-center mb-2">{schoolSettings?.vicePrincipalName || 'Vice Principal'}</h3>
                    <p className="text-school-yellow-dark text-center mb-4">Vice Principal</p>
                    <p className="text-gray-600 text-center">
                      Our vice principal oversees academic programs and ensures that our curriculum meets the highest standards.
                    </p>
                  </div>
                </>
              )}
            </div>

            <h2 className="text-3xl font-bold text-school-navy-dark mb-6">{aboutUsContent?.values?.title || 'Our Values'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              {aboutUsContent?.values?.items && aboutUsContent.values.items.length > 0 ? (
                aboutUsContent.values.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
                    <div className="w-16 h-16 bg-school-yellow-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-school-yellow-dark" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-school-navy-dark mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
                    <div className="w-16 h-16 bg-school-yellow-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-school-yellow-dark" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-school-navy-dark mb-2">Excellence</h3>
                    <p className="text-gray-600">We strive for excellence in all aspects of education and personal development.</p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
                    <div className="w-16 h-16 bg-school-yellow-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-school-yellow-dark" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-school-navy-dark mb-2">Integrity</h3>
                    <p className="text-gray-600">We uphold the highest standards of honesty, ethics, and responsibility.</p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
                    <div className="w-16 h-16 bg-school-yellow-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-school-yellow-dark" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-school-navy-dark mb-2">Innovation</h3>
                    <p className="text-gray-600">We embrace creativity, critical thinking, and innovative approaches to learning.</p>
                  </div>
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

export default AboutPage;
