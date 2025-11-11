import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import ImageUpload from '../common/ImageUpload';

const StudentProfileEdit = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);

  const [userData, setUserData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    name: '',
    email: '',
    profileImage: null
  });

  const [studentData, setStudentData] = useState({
    rollNumber: '',
    dateOfBirth: '',
    gender: '',
    class: '',
    section: '',
    isActive: true,
    monthlyFee: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    parentInfo: {
      fatherName: '',
      motherName: '',
      guardianName: '',
      contactNumber: '',
      email: '',
      occupation: ''
    },
    admissionDate: ''
  });

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        setLoading(true);
        // For students, the backend automatically filters by the logged-in user's ID
        // No need to pass any query parameters
        const res = await axios.get('/api/students');

        if (res.data.success && res.data.data.length > 0) {
          const studentProfile = res.data.data[0];
          setStudent(studentProfile);

          // Set user data
          const nameParts = studentProfile.user.name.split(' ');
          setUserData({
            firstName: nameParts[0] || '',
            middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '',
            lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
            name: studentProfile.user.name,
            email: studentProfile.user.email,
            profileImage: studentProfile.user.profileImage
          });

          // Set student data
          setStudentData({
            rollNumber: studentProfile.rollNumber || '',
            dateOfBirth: studentProfile.dateOfBirth ? new Date(studentProfile.dateOfBirth).toISOString().split('T')[0] : '',
            gender: studentProfile.gender || '',
            class: studentProfile.class || '',
            section: studentProfile.section || '',
            isActive: studentProfile.isActive !== undefined ? studentProfile.isActive : true,
            monthlyFee: studentProfile.monthlyFee || '',
            address: {
              street: studentProfile.address?.street || '',
              city: studentProfile.address?.city || '',
              state: studentProfile.address?.state || '',
              zipCode: studentProfile.address?.zipCode || '',
              country: studentProfile.address?.country || ''
            },
            parentInfo: {
              fatherName: studentProfile.parentInfo?.fatherName || '',
              motherName: studentProfile.parentInfo?.motherName || '',
              guardianName: studentProfile.parentInfo?.guardianName || '',
              contactNumber: studentProfile.parentInfo?.contactNumber || '',
              email: studentProfile.parentInfo?.email || '',
              occupation: studentProfile.parentInfo?.occupation || ''
            },
            admissionDate: studentProfile.admissionDate ? new Date(studentProfile.admissionDate).toISOString().split('T')[0] : ''
          });
        } else {
          setError('Student profile not found. Please contact your administrator.');
        }
      } catch (err) {
        console.error('Error fetching student profile:', err);
        if (err.response?.status === 403) {
          setError('Access denied. Please make sure you are logged in as a student.');
        } else if (err.response?.status === 404) {
          setError('Student profile not found. Please contact your administrator.');
        } else {
          setError('Failed to load student profile. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStudentProfile();
    }
  }, [user]);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update full name when first/middle/last name changes
    if (name === 'firstName' || name === 'middleName' || name === 'lastName') {
      const updatedUserData = { ...userData, [name]: value };
      const fullName = [
        updatedUserData.firstName,
        updatedUserData.middleName,
        updatedUserData.lastName
      ].filter(Boolean).join(' ');
      
      setUserData(prev => ({
        ...prev,
        [name]: value,
        name: fullName
      }));
    }
  };

  const handleStudentChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setStudentData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setStudentData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleProfileImageSelect = (url, metadata) => {
    if (url) {
      setUserData(prev => ({
        ...prev,
        profileImage: {
          url,
          metadata
        }
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        profileImage: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // If a new profile image was selected, update userData with the new image
      if (profileImageFile && typeof profileImageFile === 'string') {
        userData.profileImage = profileImageFile;
      }

      const res = await axios.put(`/api/students/${student._id}`, {
        userData,
        studentData
      });

      if (res.data.success) {
        navigate('/profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Edit My Profile</h1>
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update your personal details and profile picture.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={userData.firstName}
                      onChange={handleUserChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">
                      Middle name
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      id="middleName"
                      value={userData.middleName}
                      onChange={handleUserChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={userData.lastName}
                      onChange={handleUserChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={userData.email}
                      onChange={handleUserChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="col-span-6">
                    <ImageUpload
                      onImageSelect={handleProfileImageSelect}
                      initialImage={userData.profileImage}
                      label="Profile Picture"
                      imageType="profile"
                      targetUserId={user?.id}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfileEdit;
