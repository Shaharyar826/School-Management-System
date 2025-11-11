import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaImage, FaEye, FaEdit, FaSave, FaPlus, FaTrash, FaUser, FaUsers, FaAward, FaCamera, FaInfoCircle, FaFileAlt } from 'react-icons/fa';
import { getAboutUsContent, updateAboutUsContent, uploadAboutUsBannerImage, uploadLeadershipPhoto } from '../../services/pageContentApi';
import LoadingSpinner from '../common/LoadingSpinner';
import RichTextEditor from '../common/RichTextEditor';
import FormInput from '../common/FormInput';
// Fallback images for About Us content
const FALLBACK_IMAGES = {
  BANNER: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=600&q=80',
  AVATAR: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&h=128&q=80',
  PLACEHOLDER_64: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyOEMzNS4zMTM3IDI4IDM4IDI1LjMxMzcgMzggMjJDMzggMTguNjg2MyAzNS4zMTM3IDE2IDMyIDE2QzI4LjY4NjMgMTYgMjYgMTguNjg2MyAyNiAyMkMyNiAyNS4zMTM3IDI4LjY4NjMgMjggMzIgMjhaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yMCA0OEMyMCA0MS4zNzI2IDI1LjM3MjYgMzYgMzIgMzZDMzguNjI3NCAzNiA0NCA0MS4zNzI2IDQ0IDQ4VjUySDIwVjQ4WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K',
  PLACEHOLDER_80: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCAzNUM0NC40MTgzIDM1IDQ4IDMxLjQxODMgNDggMjdDNDggMjIuNTgxNyA0NC40MTgzIDE5IDQwIDE5QzM1LjU4MTcgMTkgMzIgMjIuNTgxNyAzMiAyN0MzMiAzMS40MTgzIDM1LjU4MTcgMzUgNDAgMzVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yNCA2MEMyNCA1MS43MTU3IDMxLjcxNTcgNDUgNDAgNDVDNDguMjg0MyA0NSA1NiA1MS43MTU3IDU2IDYwVjY1SDI0VjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
};
import { Tab } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const AboutUsContentForm = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(null);
  const [leadershipPhotos, setLeadershipPhotos] = useState({});
  const [leadershipPhotosPreviews, setLeadershipPhotosPreviews] = useState({});
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch about us content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await getAboutUsContent();
        setContent(data);
      } catch (err) {
        console.error('Error fetching about us content:', err);
        toast.error('Failed to load about us content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Handle banner image change
  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle leadership photo change
  const handleLeadershipPhotoChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      setLeadershipPhotos(prev => ({
        ...prev,
        [index]: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setLeadershipPhotosPreviews(prev => ({
          ...prev,
          [index]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle content change
  const handleContentChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle nested content change
  const handleNestedContentChange = (parent, field, value) => {
    setContent(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Handle leadership team member change
  const handleLeadershipMemberChange = (index, field, value) => {
    setContent(prev => {
      const updatedTeam = [...prev.leadership.team];
      updatedTeam[index] = {
        ...updatedTeam[index],
        [field]: value
      };

      return {
        ...prev,
        leadership: {
          ...prev.leadership,
          team: updatedTeam
        }
      };
    });
  };

  // Add new leadership team member
  const addLeadershipMember = () => {
    setContent(prev => ({
      ...prev,
      leadership: {
        ...prev.leadership,
        team: [
          ...prev.leadership.team,
          {
            name: '',
            position: '',
            photo: null,
            description: ''
          }
        ]
      }
    }));
  };

  // Remove leadership team member
  const removeLeadershipMember = (index) => {
    setContent(prev => {
      const updatedTeam = prev.leadership.team.filter((_, i) => i !== index);

      return {
        ...prev,
        leadership: {
          ...prev.leadership,
          team: updatedTeam
        }
      };
    });
  };

  // Handle values item change
  const handleValuesItemChange = (index, field, value) => {
    setContent(prev => {
      const updatedItems = [...prev.values.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };

      return {
        ...prev,
        values: {
          ...prev.values,
          items: updatedItems
        }
      };
    });
  };

  // Add new values item
  const addValuesItem = () => {
    setContent(prev => ({
      ...prev,
      values: {
        ...prev.values,
        items: [
          ...prev.values.items,
          {
            title: '',
            description: '',
            icon: null
          }
        ]
      }
    }));
  };

  // Remove values item
  const removeValuesItem = (index) => {
    setContent(prev => {
      const updatedItems = prev.values.items.filter((_, i) => i !== index);

      return {
        ...prev,
        values: {
          ...prev.values,
          items: updatedItems
        }
      };
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Update content
      await updateAboutUsContent(content);

      // Upload banner image if selected
      if (bannerImage) {
        await uploadAboutUsBannerImage(bannerImage);
      }

      // Upload leadership photos if any
      const photoUploadPromises = Object.entries(leadershipPhotos).map(([index, photo]) => {
        return uploadLeadershipPhoto(photo, index);
      });

      if (photoUploadPromises.length > 0) {
        await Promise.all(photoUploadPromises);
      }

      toast.success('About Us content updated successfully');

      // Clear photo states after successful upload
      setLeadershipPhotos({});
      setLeadershipPhotosPreviews({});
    } catch (err) {
      console.error('Error updating about us content:', err);
      toast.error('Failed to update about us content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">About Us Content</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the content for your school's About Us page.
          </p>
        </div>

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Content Management</h2>
            <div className="flex space-x-2">
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
          </div>

      {previewMode ? (
        <div className="prose max-w-none">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Main Content</h3>
            <div dangerouslySetInnerHTML={{ __html: content.mainContent }}></div>
          </div>

          {content.bannerImage && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Banner Image</h3>
              <img
                src={content.bannerImage.startsWith('http') ? content.bannerImage : FALLBACK_IMAGES.BANNER}
                alt="Banner"
                className="max-h-64 rounded-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_IMAGES.BANNER;
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">{content.vision.title}</h3>
              <div dangerouslySetInnerHTML={{ __html: content.vision.content }}></div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">{content.mission.title}</h3>
              <div dangerouslySetInnerHTML={{ __html: content.mission.content }}></div>
            </div>
          </div>

          {/* Leadership Section Preview */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{content.leadership.title}</h3>
            <div className="mb-4" dangerouslySetInnerHTML={{ __html: content.leadership.description }}></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.leadership.team.map((member, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    {member.photo ? (
                      <img
                        src={member.photo && member.photo.startsWith('http') ? member.photo : FALLBACK_IMAGES.PLACEHOLDER_64}
                        alt={member.name}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGES.PLACEHOLDER_64;
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <FaUser size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{member.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{member.position}</p>
                    <p className="text-sm">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Values Section Preview */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{content.values.title}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {content.values.items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 mb-3">
                    <FaAward size={20} />
                  </div>
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Tab.Group>
            <Tab.List className="flex border-b border-gray-200">
              <Tab className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium flex items-center',
                  selected
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                )
              }><FaInfoCircle className="mr-2" />Header</Tab>
              <Tab className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium flex items-center',
                  selected
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                )
              }><FaFileAlt className="mr-2" />Main Content</Tab>
              <Tab className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium flex items-center',
                  selected
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                )
              }><FaImage className="mr-2" />Banner Image</Tab>
              <Tab className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium flex items-center',
                  selected
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                )
              }><FaEye className="mr-2" />Vision</Tab>
              <Tab className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium flex items-center',
                  selected
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                )
              }><FaEdit className="mr-2" />Mission</Tab>
              <Tab className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium flex items-center',
                  selected
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                )
              }><FaUsers className="mr-2" />Leadership</Tab>
              <Tab className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium flex items-center',
                  selected
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                )
              }><FaAward className="mr-2" />Values</Tab>
            </Tab.List>
            <Tab.Panels className="mt-4">
              <Tab.Panel>
                <div className="space-y-6">
                  <FormInput
                    label="Header Title"
                    type="text"
                    value={content.header?.title || ''}
                    onChange={e => handleNestedContentChange('header', 'title', e.target.value)}
                    placeholder="Enter header title"
                    floating={true}
                  />
                  <FormInput
                    label="Header Subtitle"
                    type="text"
                    value={content.header?.subtitle || ''}
                    onChange={e => handleNestedContentChange('header', 'subtitle', e.target.value)}
                    placeholder="Enter header subtitle"
                    floating={true}
                  />
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Main Content</label>
                  <RichTextEditor
                    value={content.mainContent}
                    onChange={(value) => handleContentChange('mainContent', value)}
                  />
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Banner Image</label>
                  <div className="flex items-center space-x-4">
                    {(bannerImagePreview || content.bannerImage) && (
                      <div className="relative">
                        <img
                          src={bannerImagePreview || (content.bannerImage && content.bannerImage.startsWith('http') ? content.bannerImage : FALLBACK_IMAGES.BANNER)}
                          alt="Banner Preview"
                          className="h-32 w-auto rounded-md object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = FALLBACK_IMAGES.BANNER;
                          }}
                        />
                      </div>
                    )}
                    <label className="cursor-pointer px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center">
                      <FaImage className="mr-2" />
                      <span>Choose Image</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleBannerImageChange}
                      />
                    </label>
                  </div>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="space-y-6">
                  <FormInput
                    label="Vision Title"
                    type="text"
                    value={content.vision.title}
                    onChange={(e) => handleNestedContentChange('vision', 'title', e.target.value)}
                    placeholder="Enter vision title"
                    floating={true}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vision Content</label>
                    <RichTextEditor
                      value={content.vision.content}
                      onChange={(value) => handleNestedContentChange('vision', 'content', value)}
                    />
                  </div>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="space-y-6">
                  <FormInput
                    label="Mission Title"
                    type="text"
                    value={content.mission.title}
                    onChange={(e) => handleNestedContentChange('mission', 'title', e.target.value)}
                    placeholder="Enter mission title"
                    floating={true}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mission Content</label>
                    <RichTextEditor
                      value={content.mission.content}
                      onChange={(value) => handleNestedContentChange('mission', 'content', value)}
                    />
                  </div>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="space-y-4 mt-8 border-t pt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Leadership Section</h3>
                  </div>

                  <div className="space-y-6">
                    <FormInput
                      label="Section Title"
                      type="text"
                      value={content.leadership.title}
                      onChange={(e) => handleNestedContentChange('leadership', 'title', e.target.value)}
                      placeholder="Enter leadership section title"
                      floating={true}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Section Description</label>
                      <RichTextEditor
                        value={content.leadership.description}
                        onChange={(value) => handleNestedContentChange('leadership', 'description', value)}
                        height={150}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">Leadership Team</label>
                        <button
                          type="button"
                          onClick={addLeadershipMember}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center text-sm"
                        >
                          <FaPlus className="mr-1" size={12} /> Add Member
                        </button>
                      </div>

                      {content.leadership.team.map((member, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Team Member {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeLeadershipMember(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                              label="Name"
                              type="text"
                              value={member.name}
                              onChange={(e) => handleLeadershipMemberChange(index, 'name', e.target.value)}
                              placeholder="Enter member name"
                              floating={true}
                            />

                            <FormInput
                              label="Position"
                              type="text"
                              value={member.position}
                              onChange={(e) => handleLeadershipMemberChange(index, 'position', e.target.value)}
                              placeholder="Enter member position"
                              floating={true}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                              value={member.description}
                              onChange={(e) => handleLeadershipMemberChange(index, 'description', e.target.value)}
                              rows={2}
                              placeholder="Enter member description"
                              className="w-full px-4 py-3 border border-gray-300 rounded-md transition-all duration-200 focus:border-green-500 focus:outline-none resize-none"
                            />
                          </div>

                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                            <div className="flex items-center space-x-4">
                              {(leadershipPhotosPreviews[index] || member.photo) && (
                                <div className="relative">
                                  <img
                                    src={leadershipPhotosPreviews[index] || (member.photo && member.photo.startsWith('http') ? member.photo : FALLBACK_IMAGES.PLACEHOLDER_80)}
                                    alt={`${member.name || 'Team member'} preview`}
                                    className="h-20 w-20 rounded-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = FALLBACK_IMAGES.PLACEHOLDER_80;
                                    }}
                                  />
                                </div>
                              )}
                              <label className="cursor-pointer px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center text-sm">
                                <FaCamera className="mr-2" />
                                <span>Choose Photo</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleLeadershipPhotoChange(e, index)}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="space-y-4 mt-8 border-t pt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Values Section</h3>
                  </div>

                  <div className="space-y-4">
                    <FormInput
                      label="Section Title"
                      type="text"
                      value={content.values.title}
                      onChange={(e) => handleNestedContentChange('values', 'title', e.target.value)}
                      placeholder="Enter section title"
                      floating={true}
                    />

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">Core Values</label>
                        <button
                          type="button"
                          onClick={addValuesItem}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center text-sm"
                        >
                          <FaPlus className="mr-1" size={12} /> Add Value
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {content.values.items.map((item, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">Value {index + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeValuesItem(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>

                            <FormInput
                              label="Title"
                              type="text"
                              value={item.title}
                              onChange={(e) => handleValuesItemChange(index, 'title', e.target.value)}
                              placeholder="Enter value title"
                              floating={true}
                            />

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                              <textarea
                                value={item.description}
                                onChange={(e) => handleValuesItemChange(index, 'description', e.target.value)}
                                rows={3}
                                placeholder="Enter value description"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md transition-all duration-200 focus:border-green-500 focus:outline-none resize-none"
                              />
                            </div>

                            {/* Icon selection can be added here */}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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
        </form>
      )}
        </div>
      </div>
    </div>
  );
};

export default AboutUsContentForm;
