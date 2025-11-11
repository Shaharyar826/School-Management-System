import { useContext } from 'react';
import { motion } from 'framer-motion';
import PublicDataContext from '../../context/PublicDataContext';

const About = () => {
  const { schoolSettings, loading } = useContext(PublicDataContext);
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
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

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-bold text-school-navy-dark mb-4">
              {schoolSettings?.landingPage?.aboutTitle || "About Our School"}
            </h2>
            <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">
              Providing quality education since {schoolSettings?.establishedYear || "1995"}
            </p>
          </motion.div>

          <motion.div className="grid md:grid-cols-2 gap-8 items-center" variants={itemVariants}>
            <div className="relative">
              <motion.div
                className="absolute -top-4 -left-4 w-full h-full border-2 border-school-yellow rounded-lg"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                viewport={{ once: true }}
              ></motion.div>
              <motion.img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="School Building"
                className="rounded-lg shadow-lg relative z-1 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjEwMCIgeT0iMTAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzlDQTNBRiIvPgo8cmVjdCB4PSIxNTAiIHk9IjEzMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjI1MCIgeT0iMTMwIiB3aWR0aD0iNTAiIGhlaWdodD0iNzAiIGZpbGw9IiNGM0Y0RjYiLz4KPHJlY3QgeD0iMzUwIiB5PSIxMzAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI3MCIgZmlsbD0iI0YzRjRGNiIvPgo8cmVjdCB4PSI0NTAiIHk9IjEzMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjMwMCIgeT0iMzMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjE4IiBmb250LWZhbWlseT0iQXJpYWwiPlNjaG9vbCBCdWlsZGluZzwvdGV4dD4KPC9zdmc+Cg==';
                }}
              />
            </div>

            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold text-school-navy-dark mb-4">Our Mission</h3>
              <p className="text-gray-600 mb-6">
                {schoolSettings?.landingPage?.aboutContent ? (
                  schoolSettings.landingPage.aboutContent
                ) : (
                  <>
                    At {schoolSettings?.schoolName || "AI Based School"}, our mission is to provide a nurturing and inclusive learning environment
                    where students can develop their intellectual, social, and emotional capabilities. We strive to empower
                    our students with the knowledge, skills, and values necessary to become responsible global citizens.
                  </>
                )}
              </p>

              <h3 className="text-2xl font-bold text-school-navy-dark mb-4">Our Vision</h3>
              <p className="text-gray-600 mb-6">
                We envision a community of lifelong learners who are equipped to meet the challenges of a rapidly
                changing world. Our graduates will be critical thinkers, effective communicators, and ethical leaders
                who contribute positively to society.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <motion.div
                  className="bg-white p-4 rounded-lg shadow-md text-center"
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-school-yellow text-3xl font-bold mb-2">25+</div>
                  <div className="text-gray-600">Years of Excellence</div>
                </motion.div>
                <motion.div
                  className="bg-white p-4 rounded-lg shadow-md text-center"
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-school-yellow text-3xl font-bold mb-2">100%</div>
                  <div className="text-gray-600">Dedicated Faculty</div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-16 bg-white p-6 rounded-lg shadow-md"
            variants={itemVariants}
          >
            <h3 className="text-2xl font-bold text-school-navy-dark mb-4 text-center">Core Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <motion.div
                className="text-center p-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-16 h-16 bg-school-yellow-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-school-yellow-dark" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-school-navy-dark mb-2">Excellence</h4>
                <p className="text-gray-600">We strive for excellence in all aspects of education and personal development.</p>
              </motion.div>

              <motion.div
                className="text-center p-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-16 h-16 bg-school-yellow-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-school-yellow-dark" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-school-navy-dark mb-2">Integrity</h4>
                <p className="text-gray-600">We uphold the highest standards of honesty, ethics, and responsibility.</p>
              </motion.div>

              <motion.div
                className="text-center p-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-16 h-16 bg-school-yellow-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-school-yellow-dark" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-school-navy-dark mb-2">Innovation</h4>
                <p className="text-gray-600">We embrace creativity, critical thinking, and innovative approaches to learning.</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
