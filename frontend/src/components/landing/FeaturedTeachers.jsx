import { useContext } from 'react';
import { motion } from 'framer-motion';
import PublicDataContext from '../../context/PublicDataContext';
import CloudinaryImage from '../common/CloudinaryImage';

// Helper function to validate if a URL is accessible
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http') && !url.includes('undefined') && !url.includes('null');
};

// Helper function to get the correct image URL
const getTeacherImageUrl = (teacher) => {
  let imageUrl = null;

  // Check if image is a Cloudinary URL object (this is the main case from backend)
  if (teacher.image && typeof teacher.image === 'object' && teacher.image.url) {
    imageUrl = teacher.image.url;
  }
  // Check if image is a full URL string (fallback case)
  else if (teacher.image && typeof teacher.image === 'string' && teacher.image.startsWith('http')) {
    imageUrl = teacher.image;
  }
  // Check if profileImage is a Cloudinary URL object (alternative field)
  else if (teacher.profileImage && typeof teacher.profileImage === 'object' && teacher.profileImage.url) {
    imageUrl = teacher.profileImage.url;
  }

  // Validate the URL before returning it
  if (isValidImageUrl(imageUrl)) {
    return imageUrl;
  }

  // Fallback to avatar if no valid image URL found
  return generateAvatarUrl(teacher.name);
};

// Generate a fallback avatar URL
const generateAvatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=256`;
};

// Component to handle teacher image with error handling
const TeacherImage = ({ teacher }) => {
  const imageUrl = getTeacherImageUrl(teacher);
  const fallbackUrl = generateAvatarUrl(teacher.name);

  // Custom error component with teacher initials
  const errorComponent = (
    <div className="absolute inset-0 flex items-center justify-center bg-school-navy-light text-white text-xl font-bold">
      {teacher.name.split(' ').map(part => part[0]).join('').toUpperCase()}
    </div>
  );

  return (
    <CloudinaryImage
      src={imageUrl}
      alt={teacher.name}
      fallbackSrc={fallbackUrl}
      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
      placeholderClassName="absolute inset-0"
      errorClassName="absolute inset-0"
      errorComponent={errorComponent}
      onError={() => {
        // Silently handle image load errors - CloudinaryImage component will handle fallbacks
      }}
    />
  );
};

const FeaturedTeachers = () => {
  const { featuredTeachers, schoolSettings, loading } = useContext(PublicDataContext);

  // Don't render if the section is disabled in settings
  if (schoolSettings?.landingPage?.showTeacherSection === false) {
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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-school-navy-dark mb-4">Our Expert Teachers</h2>
          <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Our dedicated faculty members are experts in their fields and committed to providing the highest quality education.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-school-yellow"></div>
          </div>
        ) : featuredTeachers && featuredTeachers.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {featuredTeachers.map((teacher, index) => (
              <motion.div
                key={teacher.id || index}
                className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="relative pt-[100%] bg-school-navy-light">
                  <TeacherImage teacher={teacher} />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-school-navy-dark mb-2">{teacher.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">{teacher.qualification}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {teacher.subjects && teacher.subjects.map((subject, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-school-yellow-light text-school-navy-dark text-xs px-2 py-1 rounded-full"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold">Experience:</span> {teacher.experience} years
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center text-gray-500">
            <p>No teacher information available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedTeachers;
