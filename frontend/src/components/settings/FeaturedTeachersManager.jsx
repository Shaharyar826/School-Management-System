import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getFeaturedTeachers,
  createFeaturedTeacher,
  updateFeaturedTeacher,
  deleteFeaturedTeacher,
  getActiveTeachersForSelection
} from '../../services/landingPageApi';
import FormInput from '../common/FormInput';
import FormTextarea from '../common/FormTextarea';
import LoadingSpinner from '../common/LoadingSpinner';
import CloudinaryImage from '../common/CloudinaryImage';
import { FaPlus, FaEdit, FaTrash, FaChevronUp, FaChevronDown, FaImage, FaUserPlus, FaUserCheck } from 'react-icons/fa';

// Helper function to get the correct image URL
const getTeacherImageUrl = (teacher, size = 256) => {
  // Check if image is a full URL (Cloudinary)
  if (teacher.image && typeof teacher.image === 'string' && teacher.image.startsWith('http')) {
    return teacher.image;
  }

  // Check if profileImage is a Cloudinary URL object
  if (teacher.profileImage && typeof teacher.profileImage === 'object' && teacher.profileImage.url) {
    return teacher.profileImage.url;
  }

  // Fallback to avatar - all images should now be Cloudinary URLs
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=0D8ABC&color=fff&size=${size}`;
};

const FeaturedTeachersManager = () => {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [activeTeachers, setActiveTeachers] = useState([]);
  const [loadingActiveTeachers, setLoadingActiveTeachers] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add effect to log when showForm changes
  useEffect(() => {
    console.log('showForm state changed to:', showForm);
  }, [showForm]);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [addMode, setAddMode] = useState('manual'); // 'manual' or 'existing'
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [selectedExistingTeacher, setSelectedExistingTeacher] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    qualification: '',
    experience: '',
    subjects: [],
    bio: '',
    image: null,
    displayOrder: 0,
    isActive: true
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [subjectInput, setSubjectInput] = useState('');

  // Fetch featured teachers
  useEffect(() => {
    console.log('Initial useEffect running to fetch teachers');
    fetchTeachers();
  }, []);

  // Fetch active teachers when form is shown
  useEffect(() => {
    if (showForm && formMode === 'add' && addMode === 'existing') {
      fetchActiveTeachers();
    }
  }, [showForm, formMode, addMode]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await getFeaturedTeachers();
      console.log('Featured teachers data:', data);
      setTeachers(data || []);
    } catch (err) {
      console.error('Error fetching featured teachers:', err);
      toast.error('Failed to load featured teachers');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveTeachers = async () => {
    try {
      setLoadingActiveTeachers(true);
      const data = await getActiveTeachersForSelection();
      setActiveTeachers(data);
    } catch (err) {
      console.error('Error fetching active teachers:', err);
      toast.error('Failed to load active teachers');
    } finally {
      setLoadingActiveTeachers(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddSubject = () => {
    if (subjectInput.trim()) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, subjectInput.trim()]
      });
      setSubjectInput('');
    }
  };

  const handleRemoveSubject = (index) => {
    const updatedSubjects = [...formData.subjects];
    updatedSubjects.splice(index, 1);
    setFormData({
      ...formData,
      subjects: updatedSubjects
    });
  };

  const handleSubmit = async (e = null) => {
    console.log('Form submit handler called');
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling to parent form
    }

    setSaving(true);
    try {
      // Create a copy of the form data to modify
      const dataToSubmit = { ...formData };

      // If we have an originalProfileImage but no new image selected, use the original
      if (!dataToSubmit.image && dataToSubmit.originalProfileImage) {
        console.log('Using original profile image:', dataToSubmit.originalProfileImage);
        // Set the profileImage field to the original image path
        dataToSubmit.profileImage = dataToSubmit.originalProfileImage;
      }

      console.log('Form data being submitted:', dataToSubmit);

      if (formMode === 'add') {
        const result = await createFeaturedTeacher(dataToSubmit);
        console.log('Create teacher result:', result);
        toast.success('Featured teacher added successfully');
      } else {
        const result = await updateFeaturedTeacher(currentTeacher._id, dataToSubmit);
        console.log('Update teacher result:', result);
        toast.success('Featured teacher updated successfully');
      }

      // Reset form and hide it
      resetForm();
      setShowForm(false);

      // Fetch updated teachers list
      fetchTeachers();
    } catch (err) {
      console.error('Error saving featured teacher:', err);
      toast.error('Failed to save featured teacher: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (teacher) => {
    setCurrentTeacher(teacher);
    setFormData({
      name: teacher.name,
      designation: teacher.designation,
      qualification: teacher.qualification,
      experience: teacher.experience,
      subjects: teacher.subjects || [],
      bio: teacher.bio,
      image: null, // Don't set the image here, it will be uploaded only if a new one is selected
      displayOrder: teacher.displayOrder || 0,
      isActive: teacher.isActive !== false
    });

    // Set image preview for existing teacher
    if (teacher.image) {
      if (typeof teacher.image === 'object' && teacher.image.url) {
        // Handle Cloudinary URL object
        setImagePreview(teacher.image.url);
      } else if (typeof teacher.image === 'string' && teacher.image.startsWith('http')) {
        // Handle direct Cloudinary URL
        setImagePreview(teacher.image);
      } else {
        // No fallback to local storage - only use Cloudinary URLs
        setImagePreview(null);
      }
    } else {
      setImagePreview(null);
    }

    setFormMode('edit');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this featured teacher?')) {
      try {
        await deleteFeaturedTeacher(id);
        toast.success('Featured teacher deleted successfully');
        fetchTeachers();
      } catch (err) {
        console.error('Error deleting featured teacher:', err);
        toast.error('Failed to delete featured teacher');
      }
    }
  };

  const resetForm = () => {
    console.log('Resetting form');
    setFormData({
      name: '',
      designation: '',
      qualification: '',
      experience: '',
      subjects: [],
      bio: '',
      image: null,
      displayOrder: teachers.length + 1,
      isActive: true
    });
    setImagePreview(null);
    setSubjectInput('');
    setCurrentTeacher(null);
    setSelectedExistingTeacher('');
    setAddMode('manual');
    // Note: We don't set showForm here anymore, it's handled by the button click
  };

  const handleExistingTeacherSelect = (e) => {
    const teacherId = e.target.value;
    setSelectedExistingTeacher(teacherId);

    if (teacherId) {
      const selectedTeacher = activeTeachers.find(teacher => teacher.id === teacherId);
      if (selectedTeacher) {
        console.log('Selected existing teacher:', selectedTeacher);

        // Pre-fill the form with the selected teacher's data
        setFormData({
          name: selectedTeacher.name,
          designation: 'Teacher', // Default designation
          qualification: selectedTeacher.qualification,
          experience: selectedTeacher.experience.toString(),
          subjects: [...selectedTeacher.subjects],
          bio: `Experienced educator with expertise in ${selectedTeacher.subjects.join(', ')}.`, // Default bio
          image: null,
          displayOrder: teachers.length + 1,
          isActive: true,
          // Store the original profile image path for later use
          originalProfileImage: selectedTeacher.profileImage
        });

        // Set image preview if available
        if (selectedTeacher.profileImage) {
          if (typeof selectedTeacher.profileImage === 'object' && selectedTeacher.profileImage.url) {
            // Handle Cloudinary URL object
            setImagePreview(selectedTeacher.profileImage.url);
          } else if (typeof selectedTeacher.profileImage === 'string' && selectedTeacher.profileImage.startsWith('http')) {
            // Handle direct Cloudinary URL
            setImagePreview(selectedTeacher.profileImage);
          } else {
            setImagePreview(null);
          }
        } else {
          setImagePreview(null);
        }
      }
    } else {
      // Reset form if no teacher is selected
      setFormData({
        name: '',
        designation: '',
        qualification: '',
        experience: '',
        subjects: [],
        bio: '',
        image: null,
        displayOrder: teachers.length + 1,
        isActive: true,
        originalProfileImage: null
      });
      setImagePreview(null);
    }
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;

    try {
      const teacher = teachers[index];
      const prevTeacher = teachers[index - 1];

      // Swap display orders silently (no success toast)
      await updateFeaturedTeacher(teacher._id, {
        ...teacher,
        displayOrder: prevTeacher.displayOrder
      }, true); // Pass silent flag

      await updateFeaturedTeacher(prevTeacher._id, {
        ...prevTeacher,
        displayOrder: teacher.displayOrder
      }, true); // Pass silent flag

      fetchTeachers();
    } catch (err) {
      console.error('Error reordering teachers:', err);
      toast.error('Failed to reorder teachers');
    }
  };

  const handleMoveDown = async (index) => {
    if (index === teachers.length - 1) return;

    try {
      const teacher = teachers[index];
      const nextTeacher = teachers[index + 1];

      // Swap display orders silently (no success toast)
      await updateFeaturedTeacher(teacher._id, {
        ...teacher,
        displayOrder: nextTeacher.displayOrder
      }, true); // Pass silent flag

      await updateFeaturedTeacher(nextTeacher._id, {
        ...nextTeacher,
        displayOrder: teacher.displayOrder
      }, true); // Pass silent flag

      fetchTeachers();
    } catch (err) {
      console.error('Error reordering teachers:', err);
      toast.error('Failed to reorder teachers');
    }
  };

  if (loading && teachers.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Featured Teachers</h3>
          <button
            type="button"
            onClick={(e) => {
              console.log('Add Teacher button clicked');
              e.preventDefault();
              e.stopPropagation();
              console.log('Current showForm state:', showForm);

              // Toggle form visibility directly
              const newShowFormState = !showForm;
              console.log('Setting showForm to:', newShowFormState);

              if (newShowFormState) {
                // If opening the form, set mode to add
                setFormMode('add');
              } else {
                // If closing the form, reset it
                resetForm();
              }

              // Set the state after we've done our logic
              setShowForm(newShowFormState);
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            {showForm && formMode === 'add' ? 'Cancel' : 'Add Teacher'}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
            <h4 className="text-lg font-medium text-gray-700 mb-4">
              {formMode === 'add' ? 'Add New Featured Teacher' : 'Edit Featured Teacher'}
            </h4>

            {formMode === 'add' && (
              <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setAddMode('manual');
                    }}
                    className={`flex-1 px-4 py-3 rounded-md flex items-center justify-center ${
                      addMode === 'manual'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaUserPlus className="mr-2" />
                    Add Custom Teacher
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setAddMode('existing');
                      fetchActiveTeachers();
                    }}
                    className={`flex-1 px-4 py-3 rounded-md flex items-center justify-center ${
                      addMode === 'existing'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaUserCheck className="mr-2" />
                    Select Existing Teacher
                  </button>
                </div>

                {addMode === 'existing' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Teacher
                    </label>
                    <select
                      value={selectedExistingTeacher}
                      onChange={handleExistingTeacherSelect}
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="">-- Select a teacher --</option>
                      {loadingActiveTeachers ? (
                        <option disabled>Loading teachers...</option>
                      ) : (
                        activeTeachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name} ({teacher.qualification}, {teacher.subjects.join(', ')})
                          </option>
                        ))
                      )}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      Select a teacher from your existing staff to feature on the landing page.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div key={formMode} className="form-container" onClick={(e) => e.stopPropagation()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="bg-white"
                />
                <FormInput
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                  className="bg-white"
                  placeholder="e.g., Mathematics Teacher"
                />
                <FormInput
                  label="Qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  required
                  className="bg-white"
                  placeholder="e.g., M.Sc. Mathematics"
                />
                <FormInput
                  label="Experience (years)"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleInputChange}
                  required
                  className="bg-white"
                  min="0"
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subjects
                  </label>
                  <div className="flex items-center mb-2">
                    <input
                      type="text"
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex-grow"
                      placeholder="Add a subject"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddSubject();
                      }}
                      className="ml-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full"
                      >
                        {subject}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveSubject(index);
                          }}
                          className="ml-2 text-yellow-600 hover:text-yellow-800"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <FormTextarea
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    required
                    className="bg-white"
                    rows={4}
                    placeholder="Short biography of the teacher"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Image
                  </label>
                  <div className="mt-1 flex items-center">
                    {imagePreview && (
                      <div className="mr-4">
                        <CloudinaryImage
                          src={imagePreview}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-md"
                          fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA0MkM1My41MjI4IDQyIDU4IDM3LjUyMjggNTggMzJDNTggMjYuNDc3MiA1My41MjI4IDIyIDQ4IDIyQzQyLjQ3NzIgMjIgMzggMjYuNDc3MiAzOCAzMkMzOCAzNy41MjI4IDQyLjQ3NzIgNDIgNDggNDJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yOCA3MkMyOCA2MS41MDY2IDM2LjUwNjYgNTMgNDcgNTNINDlDNTkuNDkzNCA1MyA2OCA2MS41MDY2IDY4IDcyVjc4SDI4VjcyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K"
                          placeholderClassName="w-24 h-24 rounded-md"
                          errorClassName="w-24 h-24 rounded-md"
                        />
                      </div>
                    )}
                    <label className="cursor-pointer bg-white border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50 transition-colors flex items-center">
                      <FaImage className="mr-2 text-gray-400" />
                      <span className="text-gray-600">Choose Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {formMode === 'edit' && !formData.image
                      ? 'Leave empty to keep the current image'
                      : 'Recommended size: 300x300 pixels'}
                  </p>
                </div>
                <FormInput
                  label="Display Order"
                  name="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  className="bg-white"
                  min="0"
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active (visible on the landing page)
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={(e) => {
                    console.log('Cancel button clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit(e);
                  }}
                  disabled={saving}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {formMode === 'add' ? 'Adding...' : 'Updating...'}
                    </>
                  ) : (
                    formMode === 'add' ? 'Add Teacher' : 'Update Teacher'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : teachers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map((teacher, index) => (
                  <tr key={teacher._id} className={teacher.isActive ? '' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={getTeacherImageUrl(teacher, 128)}
                            alt={teacher.name}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=0D8ABC&color=fff&size=128`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                          <div className="text-sm text-gray-500">{teacher.qualification}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{teacher.designation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        teacher.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {teacher.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-2">{teacher.displayOrder || 0}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleMoveUp(index);
                            }}
                            disabled={index === 0}
                            className={`text-gray-400 hover:text-gray-600 ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <FaChevronUp size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleMoveDown(index);
                            }}
                            disabled={index === teachers.length - 1}
                            className={`text-gray-400 hover:text-gray-600 ${index === teachers.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <FaChevronDown size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEdit(teacher);
                        }}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(teacher._id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No featured teachers found. Add your first featured teacher to display on the landing page.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedTeachersManager;
