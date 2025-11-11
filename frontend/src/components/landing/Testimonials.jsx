import { useContext } from 'react';
import { motion } from 'framer-motion';
import PublicDataContext from '../../context/PublicDataContext';
import CloudinaryImage from '../common/CloudinaryImage';

const Testimonials = () => {
  const { testimonials, schoolSettings, loading } = useContext(PublicDataContext);

  // Don't render if the section is disabled in settings
  if (schoolSettings?.landingPage?.showTestimonialsSection === false) {
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
          <h2 className="text-3xl md:text-4xl font-bold text-school-navy-dark mb-4">What People Say</h2>
          <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Hear from our students, parents, and community members about their experiences with our school.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-school-yellow"></div>
          </div>
        ) : testimonials && testimonials.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial._id || index}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-school-navy-light flex-shrink-0">
                      <CloudinaryImage
                        src={testimonial.image && testimonial.image !== 'default-avatar.jpg' && testimonial.image.startsWith('http')
                          ? testimonial.image
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=0D8ABC&color=fff&size=128`}
                        alt={testimonial.name}
                        fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=0D8ABC&color=fff&size=128`}
                        className="w-full h-full object-cover"
                        placeholderClassName="w-full h-full"
                        errorClassName="w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-school-navy-dark">{testimonial.name}</h3>
                      <p className="text-gray-500 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="text-school-yellow text-4xl absolute -top-2 -left-1 opacity-20">"</div>
                    <p className="text-gray-600 italic relative z-10 pl-4">
                      {testimonial.quote}
                    </p>
                    <div className="text-school-yellow text-4xl absolute -bottom-5 -right-1 opacity-20">"</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center text-gray-500">
            <p>No testimonials available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
