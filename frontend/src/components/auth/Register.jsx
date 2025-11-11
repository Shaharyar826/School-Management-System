import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import FormInput from '../common/FormInput';
import PasswordInput from '../common/PasswordInput';
import axios from 'axios';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // Default role
    subjects: [],
    classes: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Start with empty array and only populate with backend data
  const [availableClasses, setAvailableClasses] = useState([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('');
  const [classesLoading, setClassesLoading] = useState(false);

  // Define available subjects and categories
  const [availableSubjects] = useState([
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

  const { firstName, middleName, lastName, email, password, confirmPassword, role, subjects, classes } = formData;

  // Fetch available classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        console.log('Fetching available classes...');
        // Use the public endpoint that doesn't require authentication
        const res = await axios.get('/api/filters/public/classes');
        console.log('Classes API response:', res.data);
        console.log('Response status:', res.status);
        console.log('Response headers:', res.headers);

        if (res.data.success && res.data.data && res.data.data.length > 0) {
          // Extract class values from the response
          const classes = res.data.data.map(cls => cls.value);
          console.log('Extracted classes:', classes);
          setAvailableClasses(classes);
        } else {
          console.log('No classes found or API returned success: false');
          setAvailableClasses([]);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        // More detailed error logging
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response data:', err.response.data);
          console.error('Error response status:', err.response.status);
        } else if (err.request) {
          // The request was made but no response was received
          console.error('No response received:', err.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', err.message);
        }

        // Don't show error to user during registration as it's not critical
        console.log('Failed to load available classes');
        // Clear the classes array since we only want to show backend classes
        setAvailableClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle subject selection
  const handleSubjectSelection = (subject) => {
    const updatedSubjects = [...formData.subjects];

    if (updatedSubjects.includes(subject)) {
      // Remove subject if already selected
      const index = updatedSubjects.indexOf(subject);
      updatedSubjects.splice(index, 1);
    } else {
      // Add subject if not already selected
      updatedSubjects.push(subject);
    }

    setFormData({
      ...formData,
      subjects: updatedSubjects
    });
  };

  // Handle class selection
  const handleClassSelection = (cls) => {
    const updatedClasses = [...formData.classes];

    if (updatedClasses.includes(cls)) {
      // Remove class if already selected
      const index = updatedClasses.indexOf(cls);
      updatedClasses.splice(index, 1);
    } else {
      // Add class if not already selected
      updatedClasses.push(cls);
    }

    setFormData({
      ...formData,
      classes: updatedClasses
    });
  };

  // Filter subjects based on search term
  const filteredSubjects = Object.keys(subjectCategories).reduce((acc, category) => {
    const subjectsInCategory = subjectCategories[category].filter(subject =>
      subject.toLowerCase().includes(subjectSearchTerm.toLowerCase())
    );

    if (subjectsInCategory.length > 0) {
      acc[category] = subjectsInCategory;
    }

    return acc;
  }, {});

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate teacher-specific fields if role is teacher
    if (role === 'teacher') {
      if (formData.subjects.length === 0) {
        setError('Please select at least one subject');
        return;
      }

      // Only validate class selection if classes are available
      if (availableClasses.length > 0 && formData.classes.length === 0) {
        setError('Please select at least one class');
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = formData;

      // If not a teacher, remove teacher-specific fields
      if (role !== 'teacher') {
        delete registerData.subjects;
        delete registerData.classes;
      }

      const result = await register(registerData);

      if (result.success) {
        setSuccess(result.message || 'Registration successful! Redirecting to login...');

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <FormInput
              id="firstName"
              name="firstName"
              type="text"
              label="First Name"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={onChange}
              className="z-10"
            />

            <FormInput
              id="middleName"
              name="middleName"
              type="text"
              label="Middle Name (Optional)"
              autoComplete="additional-name"
              value={middleName}
              onChange={onChange}
              className="z-10"
            />

            <FormInput
              id="lastName"
              name="lastName"
              type="text"
              label="Last Name"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={onChange}
              className="z-10"
            />

            <FormInput
              id="email"
              name="email"
              type="email"
              label="Email address"
              autoComplete="email"
              required
              value={email}
              onChange={onChange}
              className="z-10"
            />

            <PasswordInput
              id="password"
              name="password"
              label="Password"
              autoComplete="new-password"
              required
              value={password}
              onChange={onChange}
              className="z-10"
            />

            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={onChange}
              className="z-10"
            />

            <div className="floating-input-container">
              <select
                id="role"
                name="role"
                required
                className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none z-10"
                value={role}
                onChange={onChange}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="accountant">Accountant</option>
                <option value="vice-principal">Vice Principal</option>
              </select>

              <label
                htmlFor="role"
                className={`absolute left-4 transition-all duration-200 pointer-events-none
                  ${role ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
              >
                Role <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Show subject and class selection only for teachers */}
            {role === 'teacher' && (
              <div className="space-y-4 mt-4 p-4 border border-gray-200 rounded-md">
                <h3 className="text-md font-medium text-gray-700">Teacher Information</h3>

                {/* Subject selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Subjects <span className="text-red-500">*</span>
                  </label>

                  {/* Subject search */}
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Search subjects..."
                      className="w-full px-3 py-2 border border-yellow-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                      value={subjectSearchTerm}
                      onChange={(e) => setSubjectSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Subject categories */}
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {Object.keys(filteredSubjects).map((category) => {
                      const subjectsInCategory = filteredSubjects[category];

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
                                  formData.subjects.includes(subject)
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

                  {formData.subjects.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">Please select at least one subject</p>
                  )}
                </div>

                {/* Class selection */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Classes <span className="text-red-500">*</span>
                  </label>

                  <div className="border border-gray-200 rounded-md p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Available Classes:</h4>
                    {classesLoading ? (
                      <div className="flex justify-center py-4">
                        <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="ml-2 text-sm text-gray-600">Loading classes...</span>
                      </div>
                    ) : (
                      availableClasses.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {availableClasses.sort((a, b) => Number(a) - Number(b)).map((cls) => (
                            <button
                              key={cls}
                              type="button"
                              onClick={() => handleClassSelection(cls)}
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                formData.classes.includes(cls)
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              Class {cls}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No classes available in the system.</p>
                          <p className="text-sm text-gray-500 mt-1">Please contact the administrator.</p>
                        </div>
                      )
                    )}
                  </div>

                  {availableClasses.length > 0 && formData.classes.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">Please select at least one class</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
