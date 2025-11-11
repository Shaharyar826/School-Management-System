import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';
import ImageUpload from '../../components/common/ImageUpload';

const EditTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    name: '',
    email: '',
    profileImage: '',
    userId: id // Always set userId from params for editing
  });

  const [profileImageFile, setProfileImageFile] = useState(null);

  const [teacherData, setTeacherData] = useState({
    employeeId: '',
    phoneNumber: '',
    qualification: '',
    subjects: [],
    classes: [],
    joiningDate: '',
    salary: '',
    dateOfBirth: '',
    gender: '',
    experience: '',
    isActive: true,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch data for EditTeacher component');
        console.log('User role:', user?.role);
        console.log('User ID:', user?.id);

        let teacherRes;

        // If user is a teacher, use the profile endpoint
        if (user && user.role === 'teacher') {
          console.log('Fetching teacher profile using profile endpoint');
          teacherRes = await axios.get('/api/teachers/profile');
        } else {
          // For admin and principal, use the regular endpoint
          console.log('Fetching teacher profile using ID endpoint:', id);
          teacherRes = await axios.get(`/api/teachers/${id}`);
        }

        console.log('Teacher profile API response:', teacherRes.data);

        // Always set default classes first to ensure we have something to show
        const defaultClasses = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
        console.log('Setting default classes:', defaultClasses);
        setAvailableClasses(defaultClasses);

        // Fetch available classes
        console.log('Fetching available classes');
        try {
          const classesRes = await axios.get('/api/filters/public/classes');
          console.log('Classes API response:', classesRes.data);

          if (classesRes.data.success && classesRes.data.data.length > 0) {
            const classes = classesRes.data.data.map(cls => cls.value);
            console.log('Available classes from API:', classes);

            // Only update if we got actual classes
            if (classes.length > 0) {
              setAvailableClasses(classes);
            }
          }
        } catch (classErr) {
          console.error('Error fetching classes:', classErr);
          // Keep the default classes we set earlier
        }

        if (teacherRes.data.success) {
          const teacher = teacherRes.data.data;
          console.log('Teacher data:', teacher);

          // Set user data
          setUserData({
            name: teacher.user?.name || '',
            email: teacher.user?.email || '',
            profileImage: teacher.user?.profileImage || 'default-avatar.jpg',
            userId: teacher.user?._id || null // Store the user ID for profile image uploads
          });

          // Format date strings for input fields
          const formattedDateOfBirth = teacher.dateOfBirth ?
            new Date(teacher.dateOfBirth).toISOString().split('T')[0] : '';

          const formattedJoiningDate = teacher.joiningDate ?
            new Date(teacher.joiningDate).toISOString().split('T')[0] : '';

          // Filter out 'Not assigned' from teacher's classes
          let teacherClasses = teacher.classes || [];
          teacherClasses = teacherClasses.filter(cls => cls !== 'Not assigned');
          console.log('Filtered teacher classes:', teacherClasses);

          // Set teacher data
          setTeacherData({
            employeeId: teacher.employeeId || '',
            phoneNumber: teacher.phoneNumber || '',
            qualification: teacher.qualification || '',
            subjects: teacher.subjects?.filter(subj => subj !== 'Not assigned') || [],
            classes: teacherClasses,
            joiningDate: formattedJoiningDate,
            salary: teacher.salary || '',
            dateOfBirth: formattedDateOfBirth,
            gender: teacher.gender || '',
            experience: teacher.experience || '',
            isActive: teacher.isActive !== undefined ? teacher.isActive : true,
            address: {
              street: teacher.address?.street || '',
              city: teacher.address?.city || '',
              state: teacher.address?.state || '',
              zipCode: teacher.address?.zipCode || '',
              country: teacher.address?.country || ''
            }
          });
        }
      } catch (err) {
        setError('Failed to fetch teacher details');
        console.error('Error in fetchData:', err);

        // Set default classes even if there's an error
        const defaultClasses = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
        setAvailableClasses(defaultClasses);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleUserChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
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

  const handleTeacherChange = (e) => {
    const { name, value } = e.target;

    if (name === 'isActive') {
      setTeacherData({
        ...teacherData,
        isActive: e.target.checked
      });
    } else if (name.includes('.')) {
      // Handle nested address fields
      const [parent, child] = name.split('.');
      setTeacherData({
        ...teacherData,
        [parent]: {
          ...teacherData[parent],
          [child]: value
        }
      });
    } else {
      setTeacherData({
        ...teacherData,
        [name]: value
      });
    }
  };

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
    // Get the classes to work with (either availableClasses or default 1-12)
    const classesToUse = availableClasses && availableClasses.length > 0
      ? availableClasses
      : Array.from({ length: 12 }, (_, i) => (i + 1).toString());

    console.log('Classes to use for Select All:', classesToUse);

    // If all classes are already selected, deselect all
    if (teacherData.classes.length === classesToUse.length) {
      console.log('Deselecting all classes');
      setTeacherData({
        ...teacherData,
        classes: []
      });
    } else {
      // Otherwise, select all classes
      console.log('Selecting all classes');
      setTeacherData({
        ...teacherData,
        classes: [...classesToUse]
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
    setSaving(true);
    setError('');

    // Validate subjects and classes
    if (teacherData.subjects.length === 0) {
      setError('Please select at least one subject');
      setSaving(false);
      return;
    }

    if (teacherData.classes.length === 0) {
      setError('Please select at least one class');
      setSaving(false);
      return;
    }

    try {
      // Create a copy of the teacher data for submission
      const submissionData = {
        ...teacherData
      };

      // If subjects or classes are empty, add 'Not assigned'
      if (submissionData.subjects.length === 0) {
        submissionData.subjects = ['Not assigned'];
      }

      if (submissionData.classes.length === 0) {
        submissionData.classes = ['Not assigned'];
      }

      // If a new profile image was selected, update userData with the new image
      if (profileImageFile && typeof profileImageFile === 'string') {
        userData.profileImage = profileImageFile;
      }

      let res;

      // If user is a teacher, use the profile endpoint
      if (user && user.role === 'teacher') {
        res = await axios.put('/api/teachers/profile', {
          userData,
          teacherData: submissionData
        });
      } else {
        // For admin and principal, use the regular endpoint
        res = await axios.put(`/api/teachers/${id}`, {
          userData,
          teacherData: submissionData
        });
      }

      if (res.data.success) {
        // If teacher is editing their own profile, navigate to their profile
        if (user && user.role === 'teacher') {
          // For teachers, we need to get their ID from the response
          const teacherId = res.data.data.teacher?._id || id;
          navigate(`/teachers/${teacherId}`);
        } else {
          navigate(`/teachers/${id}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update teacher');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Ensure availableClasses is always populated
  useEffect(() => {
    if (!availableClasses || availableClasses.length === 0) {
      console.log('No available classes found, setting default classes');
      const defaultClasses = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
      setAvailableClasses(defaultClasses);
    }
  }, [availableClasses]);

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
          <h1 className="text-2xl font-semibold text-gray-900">Edit Teacher</h1>
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
                    id="name"
                    name="name"
                    type="text"
                    label="Full Name"
                    required
                    value={userData.name}
                    onChange={handleUserChange}
                    placeholder="Enter full name"
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
                    <p className="mt-1 text-xs text-gray-500">Email is automatically generated based on teacher's name</p>
                  </div>

                  <ImageUpload
                    onImageSelect={handleProfileImageSelect}
                    initialImage={userData.profileImage}
                    label="Profile Picture"
                    imageType="profile"
                    targetUserId={userData.userId}
                  />

                  {/* Only show Active Status checkbox for admin and principal */}
                  {user && (user.role === 'admin' || user.role === 'principal') && (
                    <div className="flex items-center">
                      <input
                        id="isActive"
                        name="isActive"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={teacherData.isActive}
                        onChange={handleTeacherChange}
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        Active Status
                      </label>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-medium leading-6 text-gray-900 mt-8">Address Information</h3>
                <div className="mt-5 space-y-6">
                  <FormInput
                    id="address.street"
                    name="address.street"
                    type="text"
                    label="Street Address"
                    value={teacherData.address.street}
                    onChange={handleTeacherChange}
                    placeholder="Enter street address"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      id="address.city"
                      name="address.city"
                      type="text"
                      label="City"
                      value={teacherData.address.city}
                      onChange={handleTeacherChange}
                      placeholder="Enter city"
                    />

                    <FormInput
                      id="address.state"
                      name="address.state"
                      type="text"
                      label="State / Province"
                      value={teacherData.address.state}
                      onChange={handleTeacherChange}
                      placeholder="Enter state/province"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      id="address.zipCode"
                      name="address.zipCode"
                      type="text"
                      label="ZIP / Postal Code"
                      value={teacherData.address.zipCode}
                      onChange={handleTeacherChange}
                      placeholder="Enter ZIP/postal code"
                    />

                    <FormInput
                      id="address.country"
                      name="address.country"
                      type="text"
                      label="Country"
                      value={teacherData.address.country}
                      onChange={handleTeacherChange}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 md:mt-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Teacher Information</h3>
                <div className="mt-5 space-y-6">
                  <FormInput
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    label="Employee ID (Auto-generated)"
                    required
                    value={teacherData.employeeId}
                    onChange={handleTeacherChange}
                    readOnly={true} // Make read-only for all users
                    className="bg-gray-100"
                  />

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
                        {teacherData.classes.length >= (availableClasses?.length || 12) ? 'Deselect All' : 'Select All Classes'}
                      </button>

                      {/* Display count of selected classes */}
                      {teacherData.classes.length > 0 && (
                        <span className="text-sm text-blue-600 font-medium">
                          {teacherData.classes.length} of {availableClasses?.length || 12} selected
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
                        {availableClasses && availableClasses.length > 0 ? (
                          availableClasses.sort().map((cls) => (
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
                          ))
                        ) : (
                          // Fallback default classes if availableClasses is empty
                          Array.from({ length: 12 }, (_, i) => {
                            const cls = (i + 1).toString();
                            return (
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
                            );
                          })
                        )}
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

                  {/* Only show Salary field for admin and principal */}
                  {user && (user.role === 'admin' || user.role === 'principal') && (
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
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  if (user && user.role === 'teacher') {
                    // For teachers, navigate to their profile
                    navigate('/teachers');
                  } else {
                    navigate(`/teachers/${id}`);
                  }
                }}
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

export default EditTeacher;
