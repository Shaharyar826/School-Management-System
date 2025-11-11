import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import FormInput from '../common/FormInput';
import FloatingPasswordInput from '../common/FloatingPasswordInput';
import ImageUpload from '../common/ImageUpload';

const AddStudent = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [userData, setUserData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    profileImage: ''
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [validateForm, setValidateForm] = useState(false);
  const [emailGenerated, setEmailGenerated] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  const [studentData, setStudentData] = useState({
    rollNumber: '',
    dateOfBirth: '',
    gender: '',
    class: '',
    section: '',
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
    admissionDate: new Date().toISOString().split('T')[0]
  });

  // Function to generate email from first and last name
  const generateEmail = (firstName, lastName) => {
    if (!firstName || !lastName) return '';

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

    // If first name or last name is changed, auto-generate email
    if ((name === 'firstName' || name === 'lastName') && updatedUserData.firstName && updatedUserData.lastName) {
      const generatedEmail = generateEmail(updatedUserData.firstName, updatedUserData.lastName);
      updatedUserData.email = generatedEmail;
      setEmailGenerated(true);
    }

    setUserData(updatedUserData);
  };

  const handleProfileImageSelect = (url, metadata, file) => {
    console.log('handleProfileImageSelect called:', { url, metadata, file });

    if (file) {
      // When autoUpload is false, we only get the file - this is what we want!
      console.log('Setting profileImageFile to file');
      setProfileImageFile(file);
    } else {
      console.log('Clearing profile image');
      setProfileImageFile(null);
    }
  };

  const handleStudentChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
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
    setValidateForm(true);
    setError('');

    // Check if profile image file is selected
    if (!profileImageFile) {
      setError('Please select a profile picture');
      return;
    }

    setLoading(true);
    setUploadStatus('');
    setUploadProgress(0);

    try {
      // First, create the student WITHOUT profile image
      const userDataWithoutImage = { ...userData };
      delete userDataWithoutImage.profileImage;

      console.log('Creating student without image:', { userData: userDataWithoutImage, studentData });

      const res = await axios.post('/api/students', {
        userData: userDataWithoutImage,
        studentData
      });

      if (res.data.success) {
        const createdUser = res.data.data.user;

        // Now upload the profile picture for the created user
        if (profileImageFile && createdUser.id) {
          try {
            console.log('Starting profile image upload...');
            setUploadStatus('Uploading profile image...');
            setUploadProgress(0);

            // Add a small delay to ensure the UI updates
            await new Promise(resolve => setTimeout(resolve, 100));

            const formData = new FormData();
            formData.append('profileImage', profileImageFile);

            console.log('Uploading profile image for user:', createdUser.id);

            await axios.post(`/api/profile-image/upload/${createdUser.id}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              },
              onUploadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log('Upload progress:', progress + '%');
                setUploadProgress(progress);
              }
            });

            setUploadStatus('Profile image uploaded successfully!');
            setUploadProgress(100);
            console.log('Profile image uploaded successfully');

            // Keep the success message visible for a moment
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (imageErr) {
            console.error('Error uploading profile image:', imageErr);
            setUploadStatus('Profile image upload failed');
            // Don't fail the entire operation if image upload fails
            setError('Student created successfully, but profile image upload failed. You can upload it later.');
          }
        }

        alert('Student added successfully!');
        navigate('/students');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Student</h1>
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

        {uploadStatus && (
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-blue-700">{uploadStatus}</p>
                {uploadStatus.includes('Uploading') && (
                  <div className="mt-2">
                    <div className="bg-blue-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-600 mt-1 font-medium">{uploadProgress}%</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 relative z-20">
          <form onSubmit={handleSubmit} className="relative z-30">
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">User Information</h3>
                <div className="mt-5 space-y-6">
                  <FormInput
                    id="firstName"
                    name="firstName"
                    type="text"
                    label="First Name"
                    required
                    value={userData.firstName}
                    onChange={handleUserChange}
                  />

                  <FormInput
                    id="middleName"
                    name="middleName"
                    type="text"
                    label="Middle Name (Optional)"
                    value={userData.middleName}
                    onChange={handleUserChange}
                  />

                  <FormInput
                    id="lastName"
                    name="lastName"
                    type="text"
                    label="Last Name"
                    required
                    value={userData.lastName}
                    onChange={handleUserChange}
                  />

                  <div className="relative">
                    <FormInput
                      id="email"
                      name="email"
                      type="email"
                      label="Email (Auto-generated)"
                      required
                      value={userData.email}
                      onChange={handleUserChange}
                      readOnly={true}
                      className="bg-gray-100"
                    />
                    {emailGenerated && (
                      <div className="absolute right-0 top-0 mt-2 mr-2 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Email is automatically generated based on student's name</p>
                  </div>

                  <FloatingPasswordInput
                    id="password"
                    name="password"
                    label="Password"
                    required
                    value={userData.password}
                    onChange={handleUserChange}
                    autoComplete="new-password"
                  />

                  <ImageUpload
                    onImageSelect={handleProfileImageSelect}
                    label="Profile Picture"
                    required={true}
                    imageType="profile"
                    autoUpload={false}
                    validateForm={validateForm}
                  />
                </div>

                <h3 className="text-lg font-medium leading-6 text-gray-900 mt-8">Basic Information</h3>
                <div className="mt-5 space-y-6">
                  <FormInput
                    id="rollNumber"
                    name="rollNumber"
                    type="text"
                    label="Roll Number"
                    required
                    value={studentData.rollNumber}
                    onChange={handleStudentChange}
                  />

                  <div className="floating-input-container">
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      required
                      className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                      value={studentData.dateOfBirth}
                      onChange={handleStudentChange}
                    />
                    <label
                      htmlFor="dateOfBirth"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${studentData.dateOfBirth ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                    >
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="floating-input-container">
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
                        ${studentData.gender ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                    >
                      Gender <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      id="class"
                      name="class"
                      type="text"
                      label="Class"
                      required
                      value={studentData.class}
                      onChange={handleStudentChange}
                    />

                    <FormInput
                      id="section"
                      name="section"
                      type="text"
                      label="Section"
                      required
                      value={studentData.section}
                      onChange={handleStudentChange}
                    />
                  </div>

                  <FormInput
                    id="monthlyFee"
                    name="monthlyFee"
                    type="number"
                    label="Monthly Fee"
                    required
                    min="0"
                    step="0.01"
                    value={studentData.monthlyFee}
                    onChange={handleStudentChange}
                  />

                  <div className="floating-input-container">
                    <input
                      type="date"
                      name="admissionDate"
                      id="admissionDate"
                      required
                      className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                      value={studentData.admissionDate}
                      onChange={handleStudentChange}
                    />
                    <label
                      htmlFor="admissionDate"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${studentData.admissionDate ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                    >
                      Admission Date <span className="text-red-500">*</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-5 md:mt-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Address Information</h3>
                <div className="mt-5 space-y-6">
                  <FormInput
                    id="address.street"
                    name="address.street"
                    type="text"
                    label="Street"
                    value={studentData.address.street}
                    onChange={handleStudentChange}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      id="address.city"
                      name="address.city"
                      type="text"
                      label="City"
                      value={studentData.address.city}
                      onChange={handleStudentChange}
                    />

                    <FormInput
                      id="address.state"
                      name="address.state"
                      type="text"
                      label="State"
                      value={studentData.address.state}
                      onChange={handleStudentChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      id="address.zipCode"
                      name="address.zipCode"
                      type="text"
                      label="Zip Code"
                      value={studentData.address.zipCode}
                      onChange={handleStudentChange}
                    />

                    <FormInput
                      id="address.country"
                      name="address.country"
                      type="text"
                      label="Country"
                      value={studentData.address.country}
                      onChange={handleStudentChange}
                    />
                  </div>
                </div>

                <h3 className="text-lg font-medium leading-6 text-gray-900 mt-8">Parent Information</h3>
                <div className="mt-5 space-y-6">
                  <FormInput
                    id="parentInfo.fatherName"
                    name="parentInfo.fatherName"
                    type="text"
                    label="Father's Name"
                    required
                    value={studentData.parentInfo.fatherName}
                    onChange={handleStudentChange}
                  />

                  <FormInput
                    id="parentInfo.motherName"
                    name="parentInfo.motherName"
                    type="text"
                    label="Mother's Name"
                    required
                    value={studentData.parentInfo.motherName}
                    onChange={handleStudentChange}
                  />

                  <FormInput
                    id="parentInfo.guardianName"
                    name="parentInfo.guardianName"
                    type="text"
                    label="Guardian's Name (if applicable)"
                    value={studentData.parentInfo.guardianName}
                    onChange={handleStudentChange}
                  />

                  <FormInput
                    id="parentInfo.contactNumber"
                    name="parentInfo.contactNumber"
                    type="text"
                    label="Contact Number"
                    required
                    value={studentData.parentInfo.contactNumber}
                    onChange={handleStudentChange}
                  />

                  <FormInput
                    id="parentInfo.email"
                    name="parentInfo.email"
                    type="email"
                    label="Email"
                    value={studentData.parentInfo.email}
                    onChange={handleStudentChange}
                  />

                  <FormInput
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
                onClick={() => navigate('/students')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;
