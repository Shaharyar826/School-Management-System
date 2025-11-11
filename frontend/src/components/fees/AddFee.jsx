import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';
import ReceiptUpload from './ReceiptUpload';

const AddFee = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [noStudentsMessage, setNoStudentsMessage] = useState('');
  const [showOtherFeeField, setShowOtherFeeField] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const [feeData, setFeeData] = useState({
    student: '',
    feeType: '',
    otherFeeType: '',
    amount: '',
    dueDate: '',
    status: 'unpaid',
    description: ''
  });

  // State for receipt upload and validation
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  // State to track if "Select All Students" is selected
  const [selectAllStudents, setSelectAllStudents] = useState(false);

  // State for tracking paid fee records
  const [paidFees, setPaidFees] = useState([]);
  const [loadingPaidFees, setLoadingPaidFees] = useState(false);

  // Check for pre-selected students from location state
  useEffect(() => {
    if (location.state) {
      const { selectedStudentIds, selectedStudentsData, selectedClass, selectedSection } = location.state;

      console.log('Location state received:', location.state);

      if (selectedStudentIds && selectedStudentIds.length > 0) {
        setSelectedStudentIds(selectedStudentIds);

        // If multiple students are selected, set selectAllStudents to true
        // This is critical for the batch processing to work correctly
        if (selectedStudentIds.length > 1) {
          console.log('Multiple students selected, setting selectAllStudents to true');
          setSelectAllStudents(true);

          // Set a flag in sessionStorage to indicate we're in multi-select mode
          sessionStorage.setItem('multiSelectMode', 'true');
          sessionStorage.setItem('selectedStudentCount', selectedStudentIds.length.toString());
        }
      }

      // Force set the class and section directly from URL state
      if (selectedClass) {
        // Set the class directly in the DOM
        const classSelect = document.getElementById('classFilter');
        if (classSelect) {
          classSelect.value = selectedClass;
        }

        // Set in state
        setSelectedClass(selectedClass);
        console.log('Setting selected class to:', selectedClass);
      }

      // We'll handle section in a separate useEffect to ensure class is set first

      // If we have detailed student data, we can use it to show student information
      if (selectedStudentsData && selectedStudentsData.length > 0) {
        console.log('Selected students data:', selectedStudentsData);

        // Store the student data in sessionStorage for persistence
        sessionStorage.setItem('selectedStudentsData', JSON.stringify(selectedStudentsData));

        // Extract class and section from the first student if not already set
        if (!selectedClass && selectedStudentsData[0].class) {
          setSelectedClass(selectedStudentsData[0].class);
        }

        if (!selectedSection && selectedStudentsData[0].section) {
          setSelectedSection(selectedStudentsData[0].section);
        }
      }
    }
  }, [location]);

  // Fetch available classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const res = await axios.get('/api/filters/classes?userType=student');

        if (res.data.success) {
          setClasses(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();

    // Cleanup function to run when component unmounts
    return () => {
      // Clean up session storage when component unmounts
      sessionStorage.removeItem('multiSelectMode');
      sessionStorage.removeItem('selectedStudentCount');
      sessionStorage.removeItem('selectedStudentsData');
    };
  }, []);

  // Fetch sections when class changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!selectedClass || selectedClass === 'all') {
        setSections([]);
        return;
      }

      try {
        setLoadingSections(true);
        const res = await axios.get(`/api/filters/sections?class=${selectedClass}&userType=student`);

        if (res.data.success) {
          setSections(res.data.data);
          console.log('Fetched sections for class', selectedClass, ':', res.data.data);

          // After sections are loaded, set the section from location state if it exists
          if (location.state?.selectedSection) {
            setSelectedSection(location.state.selectedSection);
            console.log('Setting section from location state:', location.state.selectedSection);

            // Also set the select element value directly
            setTimeout(() => {
              const sectionSelect = document.getElementById('sectionFilter');
              if (sectionSelect) {
                sectionSelect.value = location.state.selectedSection;
              }
            }, 100);
          }
        }
      } catch (err) {
        console.error('Error fetching sections:', err);
      } finally {
        setLoadingSections(false);
      }
    };

    fetchSections();

    // Don't reset section if it's coming from location state on first load
    if (!location.state?.selectedSection) {
      setSelectedSection('');
    }
  }, [selectedClass, location.state?.selectedSection]);

  // Call fetchPaidFees when student selection changes
  useEffect(() => {
    if (selectAllStudents || feeData.student || selectedStudentIds.length > 0) {
      fetchPaidFees();
    }
  }, [selectAllStudents, feeData.student, selectedStudentIds, students]);

  // Fetch students based on selected class and section
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) {
        setStudents([]);
        setNoStudentsMessage('');
        return;
      }

      try {
        setLoadingStudents(true);
        setNoStudentsMessage('');

        // Check if we're in multi-select mode from sessionStorage
        const multiSelectMode = sessionStorage.getItem('multiSelectMode') === 'true';
        const selectedStudentCount = parseInt(sessionStorage.getItem('selectedStudentCount') || '0');

        if (multiSelectMode) {
          console.log('Restoring multi-select mode from session storage');
          setSelectAllStudents(true);
        }

        // Build query parameters
        const params = new URLSearchParams();
        if (selectedClass !== 'all') {
          params.append('class', selectedClass);
        }
        if (selectedSection) {
          params.append('section', selectedSection);
        }

        console.log('Fetching students with params:', params.toString());
        const res = await axios.get(`/api/students?${params.toString()}`);

        if (res.data.success) {
          console.log('Fetched students:', res.data.data.length);

          if (res.data.data.length === 0) {
            setNoStudentsMessage('No students found for this class/section.');
          }
          setStudents(res.data.data);

          // Check if we have pending extracted data to process
          const pendingDataStr = sessionStorage.getItem('pendingExtractedData');
          if (pendingDataStr) {
            try {
              const pendingData = JSON.parse(pendingDataStr);

              // Check if the student is now in the list
              const student = res.data.data.find(s => s._id === pendingData.studentId);

              if (student) {
                // Clear the validation error and populate the form
                setValidationError('');
                populateFormWithExtractedData(pendingData, student);

                // Clear the pending data
                sessionStorage.removeItem('pendingExtractedData');
              }
            } catch (e) {
              console.error('Error processing pending extracted data:', e);
              sessionStorage.removeItem('pendingExtractedData');
            }
          }

          // If we have pre-selected student IDs, set the student field
          if (selectedStudentIds.length === 1) {
            const student = res.data.data.find(s => s._id === selectedStudentIds[0]);
            if (student) {
              setFeeData(prev => ({ ...prev, student: student._id }));
            }
          } else if (selectedStudentIds.length > 1 || multiSelectMode) {
            // For multiple students, set selectAllStudents to true
            setSelectAllStudents(true);

            // Log the selected students for debugging
            console.log('Multiple students selected:', selectedStudentIds.length || selectedStudentCount);

            // Try to restore selected students data from sessionStorage if available
            const storedStudentsData = sessionStorage.getItem('selectedStudentsData');
            if (storedStudentsData) {
              try {
                const parsedData = JSON.parse(storedStudentsData);
                console.log('Restored selected students data from session storage:', parsedData.length);
              } catch (e) {
                console.error('Error parsing stored students data:', e);
              }
            }

            // Check if all selected students are in the fetched list
            if (selectedStudentIds.length > 0) {
              const allFound = selectedStudentIds.every(id =>
                res.data.data.some(student => student._id === id)
              );

              if (!allFound) {
                console.warn('Some selected students were not found in the fetched list');
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setNoStudentsMessage('Error loading students. Please try again.');
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedClass, selectedSection, selectedStudentIds]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'classFilter') {
      setSelectedClass(value);
      // Reset student selection when class changes
      setFeeData({
        ...feeData,
        student: ''
      });
      setSelectAllStudents(false);
    } else if (name === 'sectionFilter') {
      setSelectedSection(value);
      // Reset student selection when section changes
      setFeeData({
        ...feeData,
        student: ''
      });
      setSelectAllStudents(false);
    } else if (name === 'student') {
      if (value === 'all') {
        // Handle "Select All Students" option
        setSelectAllStudents(true);
        setFeeData({
          ...feeData,
          student: ''  // Clear the actual student selection
        });
      } else {
        // Regular student selection
        setSelectAllStudents(false);
        setFeeData({
          ...feeData,
          [name]: value
        });
      }
    } else if (name === 'feeType') {
      // Check if "other" is selected to show the custom fee type field
      setShowOtherFeeField(value === 'other');
      setFeeData({
        ...feeData,
        [name]: value
      });
    } else {
      setFeeData({
        ...feeData,
        [name]: value
      });
    }
  };

  // Handle data extracted from receipt
  const handleDataExtracted = async (data) => {
    console.log('Extracted data received:', data);

    // Validate the extracted data
    if (!data || !data.studentId || !data.amount) {
      setValidationError('Incomplete data extracted from receipt. Please check the receipt and try again.');
      return;
    }

    setExtractedData(data);
    setIsValidating(true);
    setValidationError('');

    try {
      // First check if the student is in the current view
      const studentInCurrentView = students.find(s => s._id === data.studentId);

      if (studentInCurrentView) {
        // Student is in current view, use it directly
        console.log('Student found in current view:', studentInCurrentView);
        populateFormWithExtractedData(data, studentInCurrentView);
      } else {
        // Student not in current view, try to fetch it from the server
        try {
          console.log('Fetching student data for ID:', data.studentId);
          const res = await axios.get(`/api/students/${data.studentId}`);

          if (res.data.success) {
            const fetchedStudent = res.data.data;
            console.log('Student fetched successfully:', fetchedStudent);

            // Update the class and section filters to match the student's class
            setSelectedClass(fetchedStudent.class);
            setSelectedSection(fetchedStudent.section);

            // Wait for the students list to update with the new class/section
            // We'll set a flag to populate the form once the students are loaded
            sessionStorage.setItem('pendingExtractedData', JSON.stringify(data));

            // Show a message to the user
            setValidationError(`Student "${fetchedStudent.user?.name}" found in class ${fetchedStudent.class}${fetchedStudent.section}. Switching to the correct class...`);
          } else {
            setValidationError('Student not found in the system. Please select a student manually.');
          }
        } catch (err) {
          console.error('Error fetching student:', err);
          setValidationError('Error fetching student data. Please select a student manually.');
        }
      }
    } catch (err) {
      console.error('Error processing extracted data:', err);
      setValidationError('Error processing extracted data. Please fill the form manually.');
    }
  };

  // Helper function to populate the form with extracted data
  const populateFormWithExtractedData = (data, student) => {
    console.log('Populating form with data for student:', student.user?.name);

    // Populate the form with the extracted data
    setFeeData({
      student: data.studentId,
      feeType: data.feeType,
      amount: data.amount,
      dueDate: new Date(data.dueDate).toISOString().split('T')[0],
      status: 'unpaid',
      description: data.description || `Fee for ${student.user?.name} - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`
    });

    // If the fee type is "other", show the other fee field
    if (!['tuition', 'exam', 'transport', 'library', 'laboratory'].includes(data.feeType)) {
      setShowOtherFeeField(true);
      setFeeData(prev => ({
        ...prev,
        feeType: 'other',
        otherFeeType: data.feeType
      }));
    }

    // Log the populated data for debugging
    console.log('Form populated with data:', {
      studentId: data.studentId,
      studentName: student.user?.name,
      feeType: data.feeType,
      amount: data.amount,
      dueDate: new Date(data.dueDate).toISOString().split('T')[0]
    });
  };

  // Fetch paid fee records for selected students
  const fetchPaidFees = async () => {
    if ((!selectAllStudents && !feeData.student && selectedStudentIds.length === 0) || !students.length) {
      setPaidFees([]);
      return;
    }

    try {
      setLoadingPaidFees(true);

      // Determine which students to check
      let studentIdsToCheck = [];

      if (selectedStudentIds.length > 0) {
        // Use pre-selected student IDs
        studentIdsToCheck = selectedStudentIds;
      } else if (selectAllStudents) {
        // Use all students from the current view
        studentIdsToCheck = students.map(student => student._id);
      } else if (feeData.student) {
        // Use the single selected student
        studentIdsToCheck = [feeData.student];
      }

      if (studentIdsToCheck.length === 0) {
        setPaidFees([]);
        setLoadingPaidFees(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      params.append('status', 'paid');

      // Add student IDs to the query
      studentIdsToCheck.forEach(id => {
        params.append('studentId', id);
      });

      // Add a timestamp to prevent caching
      params.append('_t', Date.now());

      console.log('Fetching paid fees with params:', params.toString());

      const res = await axios.get(`/api/fees?${params.toString()}`);

      if (res.data.success) {
        console.log('Paid fees fetched successfully:', res.data.data);
        setPaidFees(res.data.data);
      } else {
        console.log('Failed to fetch paid fees:', res.data.message);
      }
    } catch (err) {
      console.error('Error fetching paid fees:', err);
    } finally {
      setLoadingPaidFees(false);
    }
  };

  // Handle validation response
  const handleValidation = (isValid) => {
    setIsValidating(false);

    if (!isValid) {
      // Reset the form data if the user rejects the extracted data
      setFeeData({
        student: '',
        feeType: '',
        otherFeeType: '',
        amount: '',
        dueDate: '',
        status: 'unpaid',
        description: ''
      });
      setExtractedData(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare the fee data
      let dataToSubmit = { ...feeData };

      // Handle "other" fee type
      if (feeData.feeType === 'other' && feeData.otherFeeType) {
        dataToSubmit.feeType = feeData.otherFeeType.toLowerCase();
      }

      // Remove otherFeeType field before submission
      delete dataToSubmit.otherFeeType;

      if (selectAllStudents || selectedStudentIds.length > 1) {
        // If "Select All Students" is selected or multiple students are selected,
        // create fee records for all selected students
        const successfulSubmissions = [];
        const failedSubmissions = [];

        // Determine which students to process
        let studentsToProcess = [];

        if (selectedStudentIds.length > 1) {
          // If we have specific student IDs selected, use those
          studentsToProcess = students.filter(student => selectedStudentIds.includes(student._id));
          console.log(`Processing ${studentsToProcess.length} specifically selected students`);
        } else if (selectAllStudents) {
          // Otherwise, if "Select All" is checked, use all students from the current class/section
          studentsToProcess = students;
          console.log(`Processing all ${studentsToProcess.length} students from the current view`);
        }

        // Try to restore from session storage if we don't have students to process
        if (studentsToProcess.length === 0) {
          const storedStudentsData = sessionStorage.getItem('selectedStudentsData');
          if (storedStudentsData) {
            try {
              const parsedData = JSON.parse(storedStudentsData);
              console.log('Using stored student data for processing:', parsedData.length);

              // Convert the stored data format to match what we need
              studentsToProcess = parsedData.map(student => ({
                _id: student.id,
                user: { name: student.name }
              }));
            } catch (e) {
              console.error('Error parsing stored students data:', e);
            }
          }
        }

        console.log(`Final count of students to process: ${studentsToProcess.length}`);

        // For each student in the list
        for (const student of studentsToProcess) {
          try {
            // Create a fee record for this student
            const feeDataForStudent = {
              ...dataToSubmit,
              student: student._id
            };

            console.log(`Adding fee for student: ${student.user?.name} (${student._id})`);
            const res = await axios.post('/api/fees', feeDataForStudent);

            if (res.data.success) {
              successfulSubmissions.push(student.user?.name || 'Unknown student');
            } else {
              failedSubmissions.push(student.user?.name || 'Unknown student');
            }
          } catch (studentErr) {
            failedSubmissions.push(student.user?.name || 'Unknown student');
            console.error(`Error creating fee for student ${student._id}:`, studentErr);
          }
        }

        // Clean up session storage
        sessionStorage.removeItem('multiSelectMode');
        sessionStorage.removeItem('selectedStudentCount');
        sessionStorage.removeItem('selectedStudentsData');

        // Navigate back to fees page with a success message
        if (failedSubmissions.length === 0) {
          navigate('/fees', {
            state: {
              message: `Successfully added fee records for all ${successfulSubmissions.length} students.`
            }
          });
        } else {
          navigate('/fees', {
            state: {
              message: `Added fee records for ${successfulSubmissions.length} students. Failed for ${failedSubmissions.length} students.`
            }
          });
        }
      } else {
        // Regular single student fee submission
        const res = await axios.post('/api/fees', dataToSubmit);

        if (res.data.success) {
          navigate('/fees');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add fee record');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Fee Record</h1>
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
          {/* Receipt Upload and View Receipts Section */}
          <div className="mb-6">
            {/* Receipt Upload Toggle */}
            <div className="flex items-center mb-4">
              <button
                type="button"
                onClick={() => setShowReceiptUpload(!showReceiptUpload)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {showReceiptUpload ? 'Hide Receipt Upload' : 'Upload Fee Receipt'}
              </button>
              <span className="ml-3 text-sm text-gray-500">
                {showReceiptUpload
                  ? 'Upload a fee receipt to automatically populate the form fields.'
                  : 'Have a fee receipt? Upload it to auto-fill this form.'}
              </span>
            </div>

            {/* View/Generate Receipts Button - More Prominent */}
            {loadingPaidFees ? (
              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-sm text-gray-700">Loading receipts...</span>
              </div>
            ) : (
              <div className={`p-3 ${paidFees.length > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border rounded-md flex justify-between items-center`}>
                <div className={`text-sm ${paidFees.length > 0 ? 'text-green-700' : 'text-gray-700'}`}>
                  {paidFees.length > 0 ? (
                    <>
                      <span className="font-medium">{paidFees.length}</span> paid fee records found with receipts available
                    </>
                  ) : (
                    <>
                      No paid fee records found for the selected student(s)
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // If only one student is selected, navigate to that student's receipts
                    if (feeData.student && !selectAllStudents) {
                      navigate(`/students/${feeData.student}/fee-receipts`);
                    } else if (selectedStudentIds.length === 1) {
                      navigate(`/students/${selectedStudentIds[0]}/fee-receipts`);
                    } else {
                      // For multiple students, navigate to the fees page with a filter for paid fees
                      navigate('/fees', {
                        state: {
                          statusFilter: 'paid',
                          message: 'Showing paid fee records with receipts'
                        }
                      });
                    }
                  }}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    paidFees.length > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                >
                  {paidFees.length > 0 ? 'View/Generate Receipts' : 'No Receipts Available'}
                </button>
              </div>
            )}
          </div>

          {/* Receipt Upload Component */}
          {showReceiptUpload && (
            <div className="mb-6">
              <ReceiptUpload
                onDataExtracted={handleDataExtracted}
                studentInfo={
                  feeData.student
                    ? {
                        id: feeData.student,
                        name: students.find(s => s._id === feeData.student)?.user?.name,
                        class: students.find(s => s._id === feeData.student)?.class,
                        section: students.find(s => s._id === feeData.student)?.section,
                        rollNumber: students.find(s => s._id === feeData.student)?.rollNumber
                      }
                    : null
                }
              />
            </div>
          )}

          {/* Validation UI */}
          {isValidating && extractedData && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 w-full">
                  <h3 className="text-sm font-medium text-yellow-800">Data Extracted from Receipt</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Please verify the extracted data:</p>

                    <div className="mt-3 bg-white p-4 rounded-md border border-yellow-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold text-gray-700">Student Information</p>
                          <div className="mt-1 flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                              {students.find(s => s._id === extractedData.studentId)?.user?.name?.charAt(0) || 'S'}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {students.find(s => s._id === extractedData.studentId)?.user?.name || 'Unknown Student'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(() => {
                                  const student = students.find(s => s._id === extractedData.studentId);
                                  return student ? `Class ${student.class} ${student.section} | Roll: ${student.rollNumber}` : 'Student details not available';
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="font-semibold text-gray-700">Fee Details</p>
                          <div className="mt-1">
                            <div className="flex justify-between py-1 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Fee Type:</span>
                              <span className="text-sm font-medium">{extractedData.feeType.charAt(0).toUpperCase() + extractedData.feeType.slice(1)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Amount:</span>
                              <span className="text-sm font-medium">₹{extractedData.amount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Due Date:</span>
                              <span className="text-sm font-medium">{new Date(extractedData.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            {extractedData.description && (
                              <div className="flex justify-between py-1">
                                <span className="text-sm text-gray-600">Description:</span>
                                <span className="text-sm font-medium">{extractedData.description}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleValidation(false)}
                      className="mr-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      No, I'll Enter Manually
                    </button>
                    <button
                      type="button"
                      onClick={() => handleValidation(true)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Yes, Use This Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {validationError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{validationError}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative z-30">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Class Filter Dropdown */}
              <div className="sm:col-span-3">
                <div className="floating-input-container">
                  <select
                    id="classFilter"
                    name="classFilter"
                    required
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={selectedClass}
                    onChange={handleChange}
                    disabled={loadingClasses}
                  >
                    <option value="">Select Class</option>
                    <option value="all">All Classes</option>
                    {classes.map((classItem) => (
                      <option key={classItem.value} value={classItem.value}>
                        {classItem.label}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="classFilter"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${selectedClass ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Class <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              {/* Section Filter Dropdown */}
              <div className="sm:col-span-3">
                <div className="floating-input-container">
                  <select
                    id="sectionFilter"
                    name="sectionFilter"
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={selectedSection}
                    onChange={handleChange}
                    disabled={loadingSections || !selectedClass || selectedClass === 'all' || sections.length === 0}
                  >
                    <option value="">All Sections</option>
                    {sections.map((section) => (
                      <option key={section.value} value={section.value}>
                        {section.label}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="sectionFilter"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${selectedSection ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Section
                  </label>
                </div>
              </div>

              {/* Student Dropdown */}
              <div className="sm:col-span-6">
                <div className="floating-input-container">
                  <select
                    id="student"
                    name="student"
                    required={!selectAllStudents && selectedStudentIds.length === 0}
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={selectAllStudents ? 'all' : feeData.student}
                    onChange={handleChange}
                    disabled={loadingStudents || !selectedClass}
                  >
                    <option value="">Select Student</option>
                    {students.length > 0 && (
                      <option value="all">
                        All Students in
                        {selectedClass === 'all'
                          ? ' All Classes'
                          : selectedSection
                            ? ` Class ${selectedClass} Section ${selectedSection}`
                            : ` Class ${selectedClass}`}
                      </option>
                    )}
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.user?.name} - {student.rollNumber} (Section {student.section})
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="student"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${(feeData.student || selectAllStudents) ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Student <span className="text-red-500">*</span>
                  </label>
                </div>
                {noStudentsMessage && (
                  <p className="mt-2 text-sm text-red-500">{noStudentsMessage}</p>
                )}
                {selectAllStudents && (
                  <p className="mt-2 text-sm text-blue-500 font-bold">
                    {selectedStudentIds.length > 1 ? (
                      <>
                        Fee will be added for {selectedStudentIds.length} selected students in
                        {selectedClass === 'all'
                          ? ' all classes'
                          : selectedSection
                            ? ` class ${selectedClass} section ${selectedSection}`
                            : ` class ${selectedClass}`}.
                      </>
                    ) : (
                      <>
                        Fee will be added for all {students.length} students in
                        {selectedClass === 'all'
                          ? ' all classes'
                          : selectedSection
                            ? ` class ${selectedClass} section ${selectedSection}`
                            : ` class ${selectedClass}`}.
                      </>
                    )}
                  </p>
                )}
                {selectedStudentIds.length > 1 && !selectAllStudents && (
                  <p className="mt-2 text-sm text-blue-500 font-bold">
                    Fee will be added for {selectedStudentIds.length} selected students
                    {selectedClass ? ` from class ${selectedClass}` : ''}
                    {selectedSection ? ` section ${selectedSection}` : ''}.
                  </p>
                )}
              </div>

              <div className="sm:col-span-3">
                <div className="floating-input-container">
                  <select
                    id="feeType"
                    name="feeType"
                    required
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={feeData.feeType}
                    onChange={handleChange}
                  >
                    <option value="">Select Fee Type</option>
                    <option value="all">All Types</option>
                    <option value="tuition">Tuition Fee</option>
                    <option value="exam">Examination Fee</option>
                    <option value="transport">Transport Fee</option>
                    <option value="library">Library Fee</option>
                    <option value="laboratory">Laboratory Fee</option>
                    <option value="other">Other</option>
                  </select>
                  <label
                    htmlFor="feeType"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${feeData.feeType ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Fee Type <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              {/* Other Fee Type Field (conditionally rendered) */}
              {showOtherFeeField && (
                <div className="sm:col-span-3">
                  <FormInput
                    id="otherFeeType"
                    name="otherFeeType"
                    type="text"
                    label="Specify Fee Type"
                    required
                    value={feeData.otherFeeType}
                    onChange={handleChange}
                    placeholder="Enter fee type name"
                  />
                </div>
              )}

              <div className="sm:col-span-3">
                <FormInput
                  id="amount"
                  name="amount"
                  type="number"
                  label="Amount"
                  required
                  min="0"
                  step="0.01"
                  value={feeData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                />
              </div>

              <div className="sm:col-span-3">
                <div className="floating-input-container">
                  <input
                    type="date"
                    name="dueDate"
                    id="dueDate"
                    required
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={feeData.dueDate}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="dueDate"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${feeData.dueDate ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Due Date <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-3">
                <div className="floating-input-container">
                  <select
                    id="status"
                    name="status"
                    required
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={feeData.status}
                    onChange={handleChange}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <label
                    htmlFor="status"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${feeData.status ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Status <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-6">
                <div className="floating-input-container">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={feeData.description}
                    onChange={handleChange}
                    placeholder=" "
                  />
                  <label
                    htmlFor="description"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${feeData.description ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Description
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-500">Brief description of the fee (optional).</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigate('/fees')}
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

export default AddFee;
