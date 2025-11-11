import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import axios from '../config/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CloudinaryImage from '../components/common/CloudinaryImage';

const FacultyPage = () => {
  const [faculty, setFaculty] = useState({ leadership: [], departmentHeads: [], teachingStaff: [], departments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchFaculty = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/page-content/faculty');
        setFaculty(res.data.data || { leadership: [], departmentHeads: [], teachingStaff: [], departments: [] });
      } catch {
        setFaculty({ leadership: [], departmentHeads: [], teachingStaff: [], departments: [] });
      }
      setLoading(false);
    };
    fetchFaculty();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="faculty-page">
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
            <h1 className="text-4xl font-bold text-white mb-4">Our Faculty</h1>
            <div className="w-20 h-1 bg-school-yellow mx-auto mb-6"></div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Meet our dedicated team of educators who are committed to providing quality education.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-school-navy-dark mb-6 text-center">Leadership Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {faculty.leadership.length === 0 && <div className="text-gray-400">No leadership team members found.</div>}
              {faculty.leadership.map((member, idx) => (
                <motion.div
                  key={member._id || idx}
                  className="bg-gray-50 rounded-lg shadow-md overflow-hidden"
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3">
                      <CloudinaryImage
                        src={member.image?.url || member.image}
                        alt={member.name}
                        fallbackSrc={`https://via.placeholder.com/200x300?text=${member.name?.split(' ').join('+') || 'Photo'}`}
                        className="w-full h-full object-cover"
                        style={{ minHeight: '200px' }}
                        placeholderClassName="w-full h-full"
                        errorClassName="w-full h-full"
                      />
                    </div>
                    <div className="sm:w-2/3 p-6">
                      <h3 className="text-xl font-bold text-school-navy-dark mb-1">{member.name}</h3>
                      <p className="text-school-yellow-dark font-medium mb-3">{member.designation}</p>
                      <div className="space-y-2 text-gray-600">
                        <p><span className="font-medium">Department:</span> {member.department}</p>
                        <p><span className="font-medium">Qualification:</span> {member.qualification}</p>
                        <p><span className="font-medium">Experience:</span> {member.experience} years</p>
                        <p><span className="font-medium">Bio:</span> {member.bio}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-school-navy-dark mb-6 text-center">Department Heads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {faculty.departmentHeads.length === 0 && <div className="text-gray-400">No department heads found.</div>}
              {faculty.departmentHeads.map((member, idx) => (
                <motion.div
                  key={member._id || idx}
                  className="bg-gray-50 rounded-lg shadow-md overflow-hidden max-w-xs mx-auto"
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="aspect-[3/4] w-full max-w-xs mx-auto flex items-center justify-center overflow-hidden bg-gray-100 rounded-t-lg">
                    <CloudinaryImage
                      src={member.image?.url || member.image}
                      alt={member.name}
                      fallbackSrc={`https://via.placeholder.com/300x400?text=${member.name?.split(' ').join('+') || 'Photo'}`}
                      className="w-full h-full object-cover object-center"
                      placeholderClassName="w-full h-full object-cover object-center"
                      errorClassName="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-school-navy-dark mb-1">{member.name}</h3>
                    <p className="text-school-yellow-dark font-medium mb-3">{member.designation}</p>
                    <div className="space-y-2 text-gray-600">
                      <p><span className="font-medium">Department:</span> {member.department}</p>
                      <p><span className="font-medium">Qualification:</span> {member.qualification}</p>
                      <p><span className="font-medium">Experience:</span> {member.experience} years</p>
                      <p><span className="font-medium">Bio:</span> {member.bio}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-school-navy-dark mb-6 text-center">Teaching Staff</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {faculty.teachingStaff.length === 0 && <div className="text-gray-400">No teaching staff found.</div>}
              {faculty.teachingStaff.map((member, idx) => (
                <motion.div
                  key={member._id || idx}
                  className="bg-gray-50 rounded-lg shadow-md overflow-hidden max-w-xs mx-auto"
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="aspect-[3/4] w-full max-w-xs mx-auto flex items-center justify-center overflow-hidden bg-gray-100 rounded-t-lg">
                    <CloudinaryImage
                      src={member.image?.url || member.image}
                      alt={member.name}
                      fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTgwQzE3Mi4wOTEgMTgwIDE5MCAxNjIuMDkxIDE5MCAxNDBDMTkwIDExNy45MDkgMTcyLjA9MSAxMDAgMTUwIDEwMEMxMjcuOTA5IDEwMCAxMTAgMTE3LjkwOSAxMTAgMTQwQzExMCAxNjIuMDkxIDEyNy45MDkgMTgwIDE1MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik04MCAzMDBDODAgMjY4LjY1NCAxMDUuNjU0IDI0MyAxMzcgMjQzSDE2M0MxOTQuMzQ2IDI0MyAyMjAgMjY4LjY1NCAyMjAgMzAwVjM0MEg4MFYzMDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMzY1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiPkZhY3VsdHk8L3RleHQ+Cjwvc3ZnPgo="
                      className="w-full h-full object-cover object-center"
                      placeholderClassName="w-full h-full object-cover object-center"
                      errorClassName="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-school-navy-dark mb-1">{member.name}</h3>
                    <p className="text-school-yellow-dark font-medium mb-3">{member.designation}</p>
                    <div className="space-y-2 text-gray-600">
                      <p><span className="font-medium">Department:</span> {member.department}</p>
                      <p><span className="font-medium">Qualification:</span> {member.qualification}</p>
                      <p><span className="font-medium">Experience:</span> {member.experience} years</p>
                      <p><span className="font-medium">Bio:</span> {member.bio}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-school-navy-dark mb-6 text-center">Our Departments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {faculty.departments.map((department, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-50 rounded-lg shadow-md p-6 text-center"
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-16 h-16 bg-school-yellow-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-school-yellow-dark font-bold text-xl">{department.name?.charAt(0)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-school-navy-dark mb-2">{department.name}</h3>
                  {department.description && (
                    <p className="text-gray-600 mb-2">{department.description}</p>
                  )}
                  {/* <p className="text-gray-600">
                    Our {department.name} department is committed to providing excellent education and fostering a love for learning.
                  </p> */}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Join Our Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12">
                <h2 className="text-3xl font-bold text-school-navy-dark mb-4">Join Our Team</h2>
                <p className="text-gray-600 mb-6">
                  We are always looking for talented and passionate educators to join our team. If you are interested in making a difference in students' lives, we'd love to hear from you.
                </p>
                <motion.a
                  href="/contact"
                  className="inline-block px-6 py-3 bg-school-yellow text-school-navy-dark font-medium rounded-md hover:bg-school-yellow-dark transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Current Openings
                </motion.a>
              </div>
              <div className="hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                  alt="School Building"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTAgMTgwQzI3Mi4wOTEgMTgwIDI5MCAxNjIuMDkxIDI5MCAxNDBDMjkwIDExNy45MDkgMjcyLjA9MSAxMDAgMjUwIDEwMEMyMjcuOTA5IDEwMCAyMTAgMTE3LjkwOSAyMTAgMTQwQzIxMCAxNjIuMDkxIDIyNy45MDkgMTgwIDI1MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xODAgMzAwQzE4MCAyNjguNjU0IDIwNS42NTQgMjQzIDIzNyAyNDNIMjYzQzI5NC4zNDYgMjQzIDMyMCAyNjguNjU0IDMyMCAzMDBWMzQwSDE4MFYzMDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjMwMCIgeT0iMjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjE4IiBmb250LWZhbWlseT0iQXJpYWwiPkpvaW4gT3VyIFRlYW08L3RleHQ+Cjwvc3ZnPgo=';
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FacultyPage;
