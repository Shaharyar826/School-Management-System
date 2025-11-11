import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';
import FloatingPasswordInput from '../../components/common/FloatingPasswordInput';
import ImageUpload from '../../components/common/ImageUpload';

const AddTeacher = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
    'History', 'Geography', 'Computer Science', 'Physical Education',
    'Art', 'Music', 'Economics', 'Business Studies', 'Accounting',
    'Political Science', 'Sociology', 'Psychology', 'Environmental Science'
  ]);

  // Group subjects by category for better organization
  const subjectCategories = {
    'Science': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Environmental Science'],
    'Languages': ['English'],
    'Humanities': ['History', 'Geography', 'Political Science', 'Sociology', 'Psychology'],
    'Arts': ['Art', 'Music'],
    'Commerce': ['Economics', 'Business Studies', 'Accounting'],
    'Others': ['Physical Education']
  };

  const [userData, setUserData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'teacher',
    profileImage: ''
  });

  // State to track if email has been auto-generated
  const [emailGenerated, setEmailGenerated] = useState(false);

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [validateForm, setValidateForm] = useState(false);

  const [teacherData, setTeacherData] = useState({
    phoneNumber: '',
    qualification: '',
    subjects: [],
    classes: [],
    joiningDate: '',
    salary: '',
    dateOfBirth: '',
    gender: '',
    experience: ''
  });

  // Function to generate email from first and last name
  const generateEmail = (firstName, lastName) => {
    if (!firstName || !lastName) return '';

    // Convert to lowercase and remove spaces and special characters
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Create email in format tch[firstname][lastname]@schoolms.com
    return `tch${cleanFirstName}${cleanLastName}@schoolms.com`;
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
    if (file) {
      // When autoUpload is false, we get the preview URL and file
      setProfileImageFile(file);
      setUserData({
        ...userData,
        profileImage: url // Store the preview URL directly for validation
      });
    } else if (url) {
      // When autoUpload is true, we get the uploaded URL
      setUserData({
        ...userData,
        profileImage: url // Store the URL directly for validation
      });
    } else {
      setProfileImageFile(null);
      setUserData({
        ...userData,
        profileImage: null
      });
    }
  };

  const handleTeacherChange = (e) => {
    const { name, value } = e.target;

    if (name === 'subjects' || name === 'classes') {
      // Convert comma-separated string to array
      setTeacherData({
        ...teacherData,
        [name]: value.split(',').map(item => item.trim())
      });
    } else {
      setTeacherData({
        ...teacherData,
        [name]: value
      });
    }
  };

  // Fetch available classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get('/api/filters/classes?userType=student');
        if (res.data.success) {
          // Extract class values from the response
          const classes = res.data.data.map(cls => cls.value);
          setAvailableClasses(classes);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load available classes');
      }
    };

    fetchClasses();
  }, []);

  // Handle subject selection
  const handleSubjectSelection = (subject) => {
    const updatedSubjects = [...teacherData.subjects];

    if (updatedSubjects.includes(subject)) {
      // Remove subject if already selected
      const index = updatedSubjects.indexOf(subject);
      updatedSubjects.splice(index, 1);
    } else {
      // Add subject if not already selected
      updatedSubjects.push(subject);
    }

    setTeacherData({
      ...teacherData,
      subjects: updatedSubjects
    });
  };

  // Handle class selection
  const handleClassSelection = (cls) => {
    const updatedClasses = [...teacherData.classes];

    if (updatedClasses.includes(cls)) {
      // Remove class if already selected
      const index = updatedClasses.indexOf(cls);
      updatedClasses.splice(index, 1);
    } else {
      // Add class if not already selected
      updatedClasses.push(cls);
    }

    setTeacherData({
      ...teacherData,
      classes: updatedClasses
    });
  };

  // Handle select all classes
  const handleSelectAllClasses = () => {
    // If all classes are already selected, deselect all
    if (teacherData.classes.length === availableClasses.length) {
      setTeacherData({
        ...teacherData,
        classes: []
      });
    } else {
      // Otherwise, select all classes
      setTeacherData({
        ...teacherData,
        classes: [...availableClasses]
      });
    }
  };

  // Filter subjects based on search term
  const getFilteredSubjects = () => {
    if (!subjectSearchTerm) return availableSubjects;

    return availableSubjects.filter(subject =>
      subject.toLowerCase().includes(subjectSearchTerm.toLowerCase())
    );
  };

  // Get subjects by category
  const getSubjectsByCategory = (category) => {
    const filteredSubjects = getFilteredSubjects();
    return subjectCategories[category].filter(subject =>
      filteredSubjects.includes(subject)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidateForm(true);
    setError('');

    // Validate subjects and classes
    if (teacherData.subjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    if (teacherData.classes.length === 0) {
      setError('Please select at least one class');
      return;
    }

    // Check if profile image is selected
    const hasProfileImage = profileImageFile || userData.profileImage;

    if (!hasProfileImage) {
      setError('Please select a profile picture');
      return;
    }

    setLoading(true);

    try {
      // First, create the teacher without profile image
      const userDataWithoutImage = { ...userData };
      delete userDataWithoutImage.profileImage;

      const res = await axios.post('/api/teachers', {
        userData: userDataWithoutImage,
        teacherData
      });

      if (res.data.success) {
        const createdUser = res.data.data.user;

        // Now upload the profile picture for the created user
        if (profileImageFile && createdUser.id) {
          try {
            const formData = new FormData();
            formData.append('profileImage', profileImageFile);

            await axios.post(`/api/profile-image/upload/${createdUser.id}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
          } catch (imageErr) {
            console.error('Error uploading profile image:', imageErr);
            // Don't fail the entire operation if image upload fails
            setError('Teacher created successfully, but profile image upload failed. You can upload it later.');
          }
        }

        navigate('/teachers');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add teacher');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Teacher</h1>
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
                    placeholder="Enter last name"
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
                    <p className="mt-1 text-xs text-gray-500">Email is automatically generated based on teacher's name</p>
                  </div>

                  <FloatingPasswordInput
                    id="password"
                    name="password"
                    label="Password"
                    required
                    value={userData.password}
                    onChange={handleUserChange}
                    placeholder="Enter password"
                    autoComplete="new-password"
                  />

                  <ImageUpload
                    onImageSelect={handleProfileImageSelect}
                    label="Profile Picture"
                    required={true}
                    imageType="profile"
                    autoUpload={false}
                  />
                </div>
              </div>

              <div className="mt-5 md:mt-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Teacher Information</h3>
                <div className="mt-5 space-y-6">
                  {/* Employee ID is now auto-generated */}

                  <div className="floating-input-container">
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      required
                      className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                      value={teacherData.dateOfBirth}
                      onChange={handleTeacherChange}
                    />
                    <label
                      htmlFor="dateOfBirth"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${teacherData.dateOfBirth ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
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
                      value={teacherData.gender}
                      onChange={handleTeacherChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <label
                      htmlFor="gender"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${teacherData.gender ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                    >
                      Gender <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <FormInput
                    id="phoneNumber"
                    name="phoneNumber"
                    type="text"
                    label="Phone Number"
                    required
                    value={teacherData.phoneNumber}
                    onChange={handleTeacherChange}
                    placeholder="Enter phone number"
                  />

                  <FormInput
                    id="qualification"
                    name="qualification"
                    type="text"
                    label="Qualification"
                    required
                    value={teacherData.qualification}
                    onChange={handleTeacherChange}
                    placeholder="Enter qualification"
                  />

                  <FormInput
                    id="experience"
                    name="experience"
                    type="number"
                    label="Years of Experience"
                    required
                    min="0"
                    value={teacherData.experience}
                    onChange={handleTeacherChange}
                    placeholder="Enter years of experience"
                  />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">
                        Subjects <span className="text-red-500">*</span>
                      </label>
                      <span className="text-sm text-gray-500">
                        {teacherData.subjects.length} selected
                      </span>
                    </div>

                    {/* Search bar for subjects */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search subjects..."
                        value={subjectSearchTerm}
                        onChange={(e) => setSubjectSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Selected subjects */}
                    {teacherData.subjects.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Subjects:</h4>
                        <div className="flex flex-wrap gap-2">
                          {teacherData.subjects.map((subject) => (
                            <span
                              key={subject}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                            >
                              {subject}
                              <button
                                type="button"
                                className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none focus:bg-green-500 focus:text-white"
                                onClick={() => handleSubjectSelection(subject)}
                              >
                                <span className="sr-only">Remove {subject}</span>
                                <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subject categories */}
                    <div className="space-y-4 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                      {Object.keys(subjectCategories).map((category) => {
                        const subjectsInCategory = getSubjectsByCategory(category);
                        if (subjectsInCategory.length === 0) return null;

                        return (
                          <div key={category} className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">{category}</h4>
                            <div className="flex flex-wrap gap-2">
                              {subjectsInCategory.map((subject) => (
                                <button
                                  key={subject}
                                  type="button"
                                  onClick={() => handleSubjectSelection(subject)}
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    teacherData.subjects.includes(subject)
                                      ? 'bg-green-100 text-green-800 border border-green-300'
                                      : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                                  }`}
                                >
                                  {subject}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {teacherData.subjects.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">Please select at least one subject</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">
                        Classes <span className="text-red-500">*</span>
                      </label>
                      <span className="text-sm text-gray-500">
                        {teacherData.classes.length} selected
                      </span>
                    </div>

                    {/* Select All button */}
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handleSelectAllClasses}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {teacherData.classes.length === availableClasses.length ? 'Deselect All' : 'Select All Classes'}
                      </button>

                      {/* Display count of selected classes */}
                      {teacherData.classes.length > 0 && (
                        <span className="text-sm text-blue-600 font-medium">
                          {teacherData.classes.length} of {availableClasses.length} selected
                        </span>
                      )}
                    </div>

                    {/* Selected classes */}
                    {teacherData.classes.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Classes:</h4>
                        <div className="flex flex-wrap gap-2">
                          {teacherData.classes.sort().map((cls) => (
                            <span
                              key={cls}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                            >
                              Class {cls}
                              <button
                                type="button"
                                className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
                                onClick={() => handleClassSelection(cls)}
                              >
                                <span className="sr-only">Remove Class {cls}</span>
                                <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available classes */}
                    <div className="border border-gray-200 rounded-md p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Available Classes:</h4>
                      <div className="flex flex-wrap gap-2">
                        {availableClasses.sort().map((cls) => (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => handleClassSelection(cls)}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              teacherData.classes.includes(cls)
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            Class {cls}
                          </button>
                        ))}
                      </div>
                    </div>

                    {teacherData.classes.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">Please select at least one class</p>
                    )}
                  </div>

                  <div className="floating-input-container">
                    <input
                      type="date"
                      name="joiningDate"
                      id="joiningDate"
                      required
                      className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                      value={teacherData.joiningDate}
                      onChange={handleTeacherChange}
                    />
                    <label
                      htmlFor="joiningDate"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${teacherData.joiningDate ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                    >
                      Joining Date <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <FormInput
                    id="salary"
                    name="salary"
                    type="number"
                    label="Salary"
                    required
                    value={teacherData.salary}
                    onChange={handleTeacherChange}
                    placeholder="Enter salary amount"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigate('/teachers')}
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

export default AddTeacher;
