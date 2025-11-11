import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import PublicDataContext from '../../context/PublicDataContext';
import AnimatedElement from '../common/AnimatedElement';
import CloudinaryImage from '../common/CloudinaryImage';

const Hero = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { schoolSettings, schoolStats, loading } = useContext(PublicDataContext);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-school-navy/80 to-school-navy-dark/90 z-5"></div>
        <CloudinaryImage
          src={schoolSettings?.landingPage?.heroImage?.url ||
               schoolSettings?.landingPage?.heroImage ||
               "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"}
          alt="School Building"
          fallbackSrc="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
          className="w-full h-full object-cover"
          placeholderClassName="w-full h-full"
          errorClassName="w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            variants={itemVariants}
          >
            {schoolSettings?.landingPage?.heroTitle ? (
              <span dangerouslySetInnerHTML={{
                __html: schoolSettings.landingPage.heroTitle.replace(
                  schoolSettings.schoolName,
                  `<span class="text-school-yellow">${schoolSettings.schoolName}</span>`
                )
              }} />
            ) : (
              <><span className="text-school-yellow">Community Based</span> High School</>
            )}
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-200 mb-8"
            variants={itemVariants}
          >
            {schoolSettings?.landingPage?.heroSubtitle ||
              "Empowering students with knowledge, skills, and values to excel in a rapidly changing world."}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            variants={itemVariants}
          >
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-8 py-3 rounded-md bg-school-yellow text-school-navy-dark font-medium hover:bg-school-yellow-dark transition-colors duration-200 transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-3 rounded-md bg-transparent border-2 border-white text-white font-medium hover:bg-white/10 transition-colors duration-200 transform hover:scale-105"
                >
                  Learn More
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-8 py-3 rounded-md bg-school-yellow text-school-navy-dark font-medium hover:bg-school-yellow-dark transition-colors duration-200 transform hover:scale-105"
                >
                  Login
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-3 rounded-md bg-transparent border-2 border-white text-white font-medium hover:bg-white/10 transition-colors duration-200 transform hover:scale-105"
                >
                  Learn More
                </Link>
              </>
            )}
          </motion.div>

          {schoolSettings?.landingPage?.showStatsSection !== false && (
            <motion.div
              className="mt-12"
              variants={itemVariants}
            >
              <div className="flex justify-center space-x-6">
                <AnimatedElement
                  type="card"
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center stats-counter"
                >
                  <h3 className="text-white font-bold text-lg mb-1">
                    {loading ? '...' :
                      schoolStats?.studentCount ?
                        (schoolStats.studentCount > 100 ? `${schoolStats.studentCount}+` : schoolStats.studentCount) :
                        '500+'}
                  </h3>
                  <p className="text-gray-300 text-sm">Students</p>
                </AnimatedElement>

                <AnimatedElement
                  type="card"
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center stats-counter"
                >
                  <h3 className="text-white font-bold text-lg mb-1">
                    {loading ? '...' :
                      schoolStats?.teacherCount ?
                        (schoolStats.teacherCount > 10 ? `${schoolStats.teacherCount}+` : schoolStats.teacherCount) :
                        '50+'}
                  </h3>
                  <p className="text-gray-300 text-sm">Teachers</p>
                </AnimatedElement>

                <AnimatedElement
                  type="card"
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center stats-counter"
                >
                  <h3 className="text-white font-bold text-lg mb-1">
                    {loading ? '...' :
                      schoolStats?.successRate ?
                        `${schoolStats.successRate}%` :
                        '95%'}
                  </h3>
                  <p className="text-gray-300 text-sm">Success Rate</p>
                </AnimatedElement>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Animated scroll indicator */}
      <AnimatedElement
        type="scrollIndicator"
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 scroll-indicator"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </AnimatedElement>
    </div>
  );
};

export default Hero;
