import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import ImageUpload from '../../components/common/ImageUpload';
import FloatingLabelInput from '../../components/common/FloatingLabelInput';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    profileImage: '',
    userId: id // Always set userId from params for editing
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [emailGenerated, setEmailGenerated] = useState(false);

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
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/students/${id}`);

        if (res.data.success) {
          const student = res.data.data;

          // Set user data
          setUserData({
            name: student.user?.name || '',
            email: student.user?.email || '',
            profileImage: student.user?.profileImage || 'default-avatar.jpg',
            userId: student.user?._id || null // Store the user ID for profile image uploads
          });

          // Format date strings for input fields
          const formattedDateOfBirth = student.dateOfBirth ?
            new Date(student.dateOfBirth).toISOString().split('T')[0] : '';

          const formattedAdmissionDate = student.admissionDate ?
            new Date(student.admissionDate).toISOString().split('T')[0] : '';

          // Set student data
          setStudentData({
            rollNumber: student.rollNumber || '',
            dateOfBirth: formattedDateOfBirth,
            gender: student.gender || '',
            class: student.class || '',
            section: student.section || '',
            isActive: student.isActive !== undefined ? student.isActive : true,
            monthlyFee: student.monthlyFee || '',
            address: {
              street: student.address?.street || '',
              city: student.address?.city || '',
              state: student.address?.state || '',
              zipCode: student.address?.zipCode || '',
              country: student.address?.country || ''
            },
            parentInfo: {
              fatherName: student.parentInfo?.fatherName || '',
              motherName: student.parentInfo?.motherName || '',
              guardianName: student.parentInfo?.guardianName || '',
              contactNumber: student.parentInfo?.contactNumber || '',
              email: student.parentInfo?.email || '',
              occupation: student.parentInfo?.occupation || ''
            },
            admissionDate: formattedAdmissionDate
          });
        }
      } catch (err) {
        setError('Failed to fetch student details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  // Function to generate email from name
  const generateEmailFromName = (fullName) => {
    if (!fullName) return '';

    // Split the name and take first and last parts
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length < 2) return '';

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];

    // Convert to lowercase and remove spaces and special characters
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Create email in format std[firstname][lastname]@schoolms.com
    return `std${cleanFirstName}${cleanLastName}@schoolms.com`;
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;

    // Update the state with the new value
    const updatedUserData = {
      ...userData,
      [name]: value
    };

    // If name is changed and it's a student email format, auto-generate email
    if (name === 'name' && value && userData.email && userData.email.startsWith('std') && userData.email.endsWith('@schoolms.com')) {
      const generatedEmail = generateEmailFromName(value);
      if (generatedEmail) {
        updatedUserData.email = generatedEmail;
        setEmailGenerated(true);
      }
    }

    setUserData(updatedUserData);
  };

  const handleProfileImageSelect = (url, metadata) => {
    if (url) {
      setUserData({
        ...userData,
        profileImage: {
          url,
          metadata
        }
      });
    } else {
      setUserData({
        ...userData,
        profileImage: null
      });
    }
  };

  const handleStudentChange = (e) => {
    const { name, value } = e.target;

    if (name === 'isActive') {
      setStudentData({
        ...studentData,
        isActive: e.target.checked
      });
    } else if (name.includes('.')) {
      // Handle nested fields (address and parentInfo)
      const [parent, child] = name.split('.');
      setStudentData({
        ...studentData,
        [parent]: {
          ...studentData[parent],
          [child]: value
        }
      });
    } else {
      setStudentData({
        ...studentData,
        [name]: value
      });
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

      const res = await axios.put(`/api/students/${id}`, {
        userData,
        studentData
      });

      if (res.data.success) {
        navigate(`/students/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student');
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

  return (
    <div className="py-6 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Student</h1>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
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

        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 relative z-20">
          <form onSubmit={handleSubmit} className="relative z-30">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">User Information</h3>
                <div className="space-y-6">
                  <FloatingLabelInput
                    id="name"
                    name="name"
                    type="text"
                    label="Full Name"
                    value={userData.name}
                    onChange={handleUserChange}
                    required
                  />

                  <div className="relative">
                    <FloatingLabelInput
                      id="email"
                      name="email"
                      type="email"
                      label={userData.email && userData.email.startsWith('std') ? "Email (Auto-generated)" : "Email"}
                      value={userData.email}
                      onChange={handleUserChange}
                      required
                      readOnly={userData.email && userData.email.startsWith('std') && userData.email.endsWith('@schoolms.com')}
                      className={userData.email && userData.email.startsWith('std') && userData.email.endsWith('@schoolms.com') ? "bg-gray-100" : ""}
                    />
                    {emailGenerated && (
                      <div className="absolute right-0 top-0 mt-2 mr-2 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    {userData.email && userData.email.startsWith('std') && userData.email.endsWith('@schoolms.com') && (
                      <p className="mt-1 text-xs text-gray-500">Email is auto-generated based on student's name</p>
                    )}
                  </div>

                  <div>
                    <ImageUpload
                      onImageSelect={handleProfileImageSelect}
                      initialImage={userData.profileImage}
                      label="Profile Picture"
                      imageType="profile"
                      targetUserId={userData.userId}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={studentData.isActive}
                      onChange={handleStudentChange}
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active Status
                    </label>
                  </div>
                </div>

                <h3 className="text-lg font-medium leading-6 text-gray-900 mt-8 mb-6">Basic Information</h3>
                <div className="space-y-6">
                  <FloatingLabelInput
                    id="rollNumber"
                    name="rollNumber"
                    type="text"
                    label="Roll Number"
                    value={studentData.rollNumber}
                    onChange={handleStudentChange}
                    required
                  />

                  <FloatingLabelInput
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    label="Date of Birth"
                    value={studentData.dateOfBirth}
                    onChange={handleStudentChange}
                    required
                  />

                  <div className="floating-input-container relative">
                    <select
                      name="gender"
                      id="gender"
                      required
                      className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                      value={studentData.gender}
                      onChange={handleStudentChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <label
                      htmlFor="gender"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${studentData.gender
                          ? 'text-sm text-green-500 -top-2.5 bg-white dark:bg-[#1e293b] px-1'
                          : 'text-gray-500 top-3'}`}
                    >
                      Gender <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FloatingLabelInput
                      id="class"
                      name="class"
                      type="text"
                      label="Class"
                      value={studentData.class}
                      onChange={handleStudentChange}
                      required
                    />

                    <FloatingLabelInput
                      id="section"
                      name="section"
                      type="text"
                      label="Section"
                      value={studentData.section}
                      onChange={handleStudentChange}
                      required
                    />
                  </div>

                  <FloatingLabelInput
                    id="monthlyFee"
                    name="monthlyFee"
                    type="number"
                    label="Monthly Fee"
                    value={studentData.monthlyFee}
                    onChange={handleStudentChange}
                    required
                    min="0"
                    step="0.01"
                  />

                  <FloatingLabelInput
                    id="admissionDate"
                    name="admissionDate"
                    type="date"
                    label="Admission Date"
                    value={studentData.admissionDate}
                    onChange={handleStudentChange}
                    required
                  />
                </div>

                <h3 className="text-lg font-medium leading-6 text-gray-900 mt-8 mb-6">Address Information</h3>
                <div className="space-y-6">
                  <FloatingLabelInput
                    id="address.street"
                    name="address.street"
                    type="text"
                    label="Street"
                    value={studentData.address.street}
                    onChange={handleStudentChange}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FloatingLabelInput
                      id="address.city"
                      name="address.city"
                      type="text"
                      label="City"
                      value={studentData.address.city}
                      onChange={handleStudentChange}
                    />

                    <FloatingLabelInput
                      id="address.state"
                      name="address.state"
                      type="text"
                      label="State"
                      value={studentData.address.state}
                      onChange={handleStudentChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FloatingLabelInput
                      id="address.zipCode"
                      name="address.zipCode"
                      type="text"
                      label="Zip Code"
                      value={studentData.address.zipCode}
                      onChange={handleStudentChange}
                    />

                    <FloatingLabelInput
                      id="address.country"
                      name="address.country"
                      type="text"
                      label="Country"
                      value={studentData.address.country}
                      onChange={handleStudentChange}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 md:mt-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Parent Information</h3>
                <div className="space-y-6">
                  <FloatingLabelInput
                    id="parentInfo.fatherName"
                    name="parentInfo.fatherName"
                    type="text"
                    label="Father's Name"
                    value={studentData.parentInfo.fatherName}
                    onChange={handleStudentChange}
                    required
                  />

                  <FloatingLabelInput
                    id="parentInfo.motherName"
                    name="parentInfo.motherName"
                    type="text"
                    label="Mother's Name"
                    value={studentData.parentInfo.motherName}
                    onChange={handleStudentChange}
                    required
                  />

                  <FloatingLabelInput
                    id="parentInfo.guardianName"
                    name="parentInfo.guardianName"
                    type="text"
                    label="Guardian's Name (if applicable)"
                    value={studentData.parentInfo.guardianName}
                    onChange={handleStudentChange}
                  />

                  <FloatingLabelInput
                    id="parentInfo.contactNumber"
                    name="parentInfo.contactNumber"
                    type="text"
                    label="Contact Number"
                    value={studentData.parentInfo.contactNumber}
                    onChange={handleStudentChange}
                    required
                  />

                  <FloatingLabelInput
                    id="parentInfo.email"
                    name="parentInfo.email"
                    type="email"
                    label="Email"
                    value={studentData.parentInfo.email}
                    onChange={handleStudentChange}
                  />

                  <FloatingLabelInput
                    id="parentInfo.occupation"
                    name="parentInfo.occupation"
                    type="text"
                    label="Occupation"
                    value={studentData.parentInfo.occupation}
                    onChange={handleStudentChange}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigate(`/students/${id}`)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudent;
