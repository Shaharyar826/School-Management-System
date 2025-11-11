import { useState, useEffect, useContext } from 'react';
import { Tab } from '@headlessui/react';
import { FaUserTie, FaUserFriends, FaChalkboardTeacher, FaBuilding, FaSave, FaPlus, FaTrash, FaEdit, FaEye, FaCamera } from 'react-icons/fa';
import { getFacultyContent, updateFacultyContent, uploadFacultyPhoto } from '../../services/pageContentApi';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import ImageUpload from '../common/ImageUpload';
import CloudinaryImage from '../common/CloudinaryImage';
import FormInput from '../common/FormInput';
import AuthContext from '../../context/AuthContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const defaultContent = {
  leadership: [],
  departmentHeads: [],
  teachingStaff: [],
  departments: []
};

const FacultyContentForm = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState(defaultContent);
  const [previewMode, setPreviewMode] = useState(false);
  const [memberPhotos, setMemberPhotos] = useState({});
  const [memberPhotosPreviews, setMemberPhotosPreviews] = useState({});

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const data = await getFacultyContent();
      setContent(data || defaultContent);
      setLoading(false);
    };
    fetchContent();
  }, []);

  const handleAdd = (section) => {
    setContent(prev => ({
      ...prev,
      [section]: [
        ...prev[section],
        section === 'departments'
          ? { name: '', description: '' }
          : {
              name: '',
              designation: '',
              qualification: '',
              experience: '',
              department: section === 'departments' ? '' : '',
              section,
              image: '',
              bio: '',
              displayOrder: prev[section].length + 1
            }
      ]
    }));
  };

  const handleRemove = (section, idx) => {
    setContent(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== idx)
    }));
  };

  const handleChange = (section, idx, field, value) => {
    setContent(prev => {
      const updated = [...prev[section]];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, [section]: updated };
    });
  };

  const validateFacultyContent = (content) => {
    const sections = ['leadership', 'departmentHeads', 'teachingStaff'];
    for (const section of sections) {
      for (const [idx, member] of content[section].entries()) {
        if (!member.name || !member.designation || !member.qualification || !member.bio || !member.section) {
          return `Please fill all required fields for ${section.replace(/([A-Z])/g, ' $1')} member #${idx + 1}`;
        }
        if (member.experience === '' || isNaN(Number(member.experience))) {
          return `Experience must be a number for ${section.replace(/([A-Z])/g, ' $1')} member #${idx + 1}`;
        }
        if (!member.image) {
          return `Please upload a photo for ${section.replace(/([A-Z])/g, ' $1')} member #${idx + 1}`;
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate before saving
    const error = validateFacultyContent(content);
    if (error) {
      toast.error(error);
      setSaving(false);
      return;
    }
    // Convert experience to number and add createdBy/section
    const contentToSave = { ...content };
    ['leadership', 'departmentHeads', 'teachingStaff'].forEach(section => {
      contentToSave[section] = contentToSave[section].map(member => ({
        ...member,
        experience: Number(member.experience),
        createdBy: user?._id,
        section: section === 'departmentHeads' ? 'departmentHead' : section
      }));
    });
    contentToSave.departments = contentToSave.departments.map(dep => ({
      name: dep.name?.trim(),
      description: dep.description?.trim() || ''
    }));
    setSaving(true);
    try {
      await updateFacultyContent(contentToSave);
      toast.success('Faculty content updated successfully!');
    } catch (err) {
      toast.error('Failed to update faculty content');
    }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;

  const renderMemberForm = (section, member, index) => (
    <div key={index} className="border rounded-lg p-6 space-y-4 relative">
      <button type="button" onClick={() => handleRemove(section, index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-md transition-colors">
        <FaTrash />
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Name"
          type="text"
          value={member.name}
          onChange={e => handleChange(section, index, 'name', e.target.value)}
          placeholder="Enter member name"
          floating={true}
          required
        />
        <FormInput
          label="Designation"
          type="text"
          value={member.designation}
          onChange={e => handleChange(section, index, 'designation', e.target.value)}
          placeholder="Enter designation"
          floating={true}
          required
        />
        <FormInput
          label="Qualification"
          type="text"
          value={member.qualification}
          onChange={e => handleChange(section, index, 'qualification', e.target.value)}
          placeholder="Enter qualification"
          floating={true}
          required
        />
        <FormInput
          label="Experience (years)"
          type="number"
          value={member.experience}
          onChange={e => handleChange(section, index, 'experience', e.target.value)}
          placeholder="Enter years of experience"
          floating={true}
          required
        />
        <FormInput
          label="Department"
          type="text"
          value={member.department}
          onChange={e => handleChange(section, index, 'department', e.target.value)}
          placeholder="Enter department"
          floating={true}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={member.bio}
            onChange={e => handleChange(section, index, 'bio', e.target.value)}
            placeholder="Enter member bio"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-md transition-all duration-200 focus:border-green-500 focus:outline-none resize-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
          <div className="flex items-center space-x-4">
            {(memberPhotosPreviews[`${section}-${index}`] || member.image) && (
              <div className="relative">
                <CloudinaryImage
                  src={
                    memberPhotosPreviews[`${section}-${index}`] ||
                    (member.image?.url || member.image)
                  }
                  alt={`${member.name || 'Faculty member'} preview`}
                  fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02NCA1NkM3MC42Mjc0IDU2IDc2IDUwLjYyNzQgNzYgNDRDNzYgMzcuMzcyNiA3MC42Mjc0IDMyIDY0IDMyQzU3LjM3MjYgMzIgNTIgMzcuMzcyNiA1MiA0NEM1MiA1MC42Mjc0IDU3LjM3MjYgNTYgNjQgNTZaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zMiA5NkMzMiA4Mi43NDUyIDQyLjc0NTIgNzIgNTYgNzJIOTZWMTA0SDMyVjk2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K"
                  className="h-32 w-32 rounded-full object-cover"
                  placeholderClassName="h-32 w-32 rounded-full"
                  errorClassName="h-32 w-32 rounded-full"
                />
              </div>
            )}
            <div className="flex-1">
              <ImageUpload
                onImageSelect={url => handleChange(section, index, 'image', url)}
                initialImage={member.image}
                accept="image/*"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Faculty Content</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the faculty and staff information for your school.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Faculty Management</h2>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                  previewMode
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {previewMode ? <FaEdit className="mr-2" /> : <FaEye className="mr-2" />}
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </button>
            </div>
        <Tab.Group>
          <Tab.List className="flex border-b border-gray-200">
            <Tab className={({ selected }) =>
              classNames(
                'px-4 py-2 text-sm font-medium flex items-center',
                selected ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              )
            }><FaUserTie className="mr-2" />Leadership Team</Tab>
            <Tab className={({ selected }) =>
              classNames(
                'px-4 py-2 text-sm font-medium flex items-center',
                selected ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              )
            }><FaUserFriends className="mr-2" />Department Heads</Tab>
            <Tab className={({ selected }) =>
              classNames(
                'px-4 py-2 text-sm font-medium flex items-center',
                selected ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              )
            }><FaChalkboardTeacher className="mr-2" />Teaching Staff</Tab>
            <Tab className={({ selected }) =>
              classNames(
                'px-4 py-2 text-sm font-medium flex items-center',
                selected ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              )
            }><FaBuilding className="mr-2" />Departments</Tab>
          </Tab.List>
          <Tab.Panels className="mt-4">
            {/* Leadership Team Panel */}
            <Tab.Panel>
              <div className="space-y-4">
                {content.leadership.length === 0 && (
                  <div className="text-gray-400">No leadership team members. Click Add to create one.</div>
                )}
                {content.leadership.map((member, idx) => renderMemberForm('leadership', member, idx))}
                <button
                  type="button"
                  onClick={() => handleAdd('leadership')}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center text-sm"
                >
                  <FaPlus className="mr-1" /> Add Member
                </button>
              </div>
            </Tab.Panel>
            {/* Department Heads Panel */}
            <Tab.Panel>
              <div className="space-y-4">
                {content.departmentHeads.length === 0 && (
                  <div className="text-gray-400">No department heads. Click Add to create one.</div>
                )}
                {content.departmentHeads.map((member, idx) => renderMemberForm('departmentHeads', member, idx))}
                <button
                  type="button"
                  onClick={() => handleAdd('departmentHeads')}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center text-sm"
                >
                  <FaPlus className="mr-1" /> Add Department Head
                </button>
              </div>
            </Tab.Panel>
            {/* Teaching Staff Panel */}
            <Tab.Panel>
              <div className="space-y-4">
                {content.teachingStaff.length === 0 && (
                  <div className="text-gray-400">No teaching staff. Click Add to create one.</div>
                )}
                {content.teachingStaff.map((member, idx) => renderMemberForm('teachingStaff', member, idx))}
                <button
                  type="button"
                  onClick={() => handleAdd('teachingStaff')}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center text-sm"
                >
                  <FaPlus className="mr-1" /> Add Teacher
                </button>
              </div>
            </Tab.Panel>
            {/* Departments Panel */}
            <Tab.Panel>
              <div className="space-y-4">
                {content.departments.length === 0 && <div className="text-gray-400">No departments. Click Add to create one.</div>}
                {content.departments.map((dept, idx) => (
                  <div key={idx} className="border rounded-lg p-6 space-y-4 relative">
                    <button type="button" onClick={() => handleRemove('departments', idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-md transition-colors"><FaTrash /></button>
                    <FormInput
                      label="Department Name"
                      type="text"
                      value={dept.name}
                      onChange={e => handleChange('departments', idx, 'name', e.target.value)}
                      placeholder="Enter department name"
                      floating={true}
                      required
                    />
                    <FormInput
                      label="Department Description"
                      type="text"
                      value={dept.description || ''}
                      onChange={e => handleChange('departments', idx, 'description', e.target.value)}
                      placeholder="Enter department description"
                      floating={true}
                    />
                  </div>
                ))}
                <button type="button" onClick={() => handleAdd('departments')} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center text-sm"><FaPlus className="mr-1" /> Add Department</button>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-green-600 text-white rounded-md flex items-center disabled:opacity-50 hover:bg-green-700 transition-colors font-medium"
              >
                <FaSave className="mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyContentForm;