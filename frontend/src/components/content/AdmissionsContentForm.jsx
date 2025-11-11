import { useState, useEffect, Fragment } from 'react';
import { toast } from 'react-toastify';
import { Tab } from '@headlessui/react';
import {
  FaEye, FaEdit, FaSave, FaTrash, FaPlus,
  FaArrowUp, FaArrowDown, FaGraduationCap,
  FaBookOpen, FaWpforms, FaFileContract,
  FaMoneyCheckAlt, FaPaperclip, FaRegQuestionCircle
} from 'react-icons/fa';
import { getAdmissionsContent, updateAdmissionsContent, uploadAdmissionsFile } from '../../services/pageContentApi';
import LoadingSpinner from '../common/LoadingSpinner';
import RichTextEditor from '../common/RichTextEditor';
import FileUpload from '../common/FileUpload';
import FormInput from '../common/FormInput';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const AdmissionsContentForm = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Initial content structure
  const initialContent = {
    title: 'Admissions Information',
    headerSection: {
      title: 'Admissions',
      subtitle: 'Join our community of learners',
    },
    mainContent: '',
    admissionCriteria: {
      title: 'Admission Criteria',
      content: '',
    },
    applicationProcess: {
      title: 'Application Process',
      content: '',
      steps: [],
    },
    requiredDocuments: {
      title: 'Required Documents',
      content: '',
      documentsList: [],
    },
    feeStructure: {
      title: 'Fee Structure',
      content: '',
      disclaimer: '* Fees subject to change',
      fees: [],
    },
    applyNow: {
      title: 'Apply Now',
      content: '',
      primaryButtonText: 'Download Application Form',
      secondaryButtonText: 'Contact Admissions Office',
      downloadableFiles: []
    },
    faqSection: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions about our admissions process',
      faqs: []
    }
  };

  // Helper functions for content management
  const handleTextChange = (path, value) => {
    setContent(prev => {
      const keys = path.split('.');
      const newContent = { ...prev };
      let current = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }

      current[keys[keys.length - 1]] = value;
      return newContent;
    });
  };

  const handleArrayChange = (path, index, field, value) => {
    setContent(prev => {
      const keys = path.split('.');
      const newContent = { ...prev };
      let current = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }

      const array = [...current[keys[keys.length - 1]]];
      array[index] = { ...array[index], [field]: value };
      current[keys[keys.length - 1]] = array;
      return newContent;
    });
  };

  const addArrayItem = (path, newItem) => {
    setContent(prev => {
      const keys = path.split('.');
      const newContent = { ...prev };
      let current = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }

      current[keys[keys.length - 1]] = [...current[keys[keys.length - 1]], newItem];
      return newContent;
    });
  };

  const removeArrayItem = (path, index) => {
    setContent(prev => {
      const keys = path.split('.');
      const newContent = { ...prev };
      let current = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }

      current[keys[keys.length - 1]] = current[keys[keys.length - 1]].filter((_, i) => i !== index);
      return newContent;
    });
  };

  const moveArrayItem = (path, index, direction) => {
    setContent(prev => {
      const keys = path.split('.');
      const newContent = { ...prev };
      let current = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }

      const array = [...current[keys[keys.length - 1]]];
      const newIndex = index + direction;

      if (newIndex >= 0 && newIndex < array.length) {
        [array[index], array[newIndex]] = [array[newIndex], array[index]];
        current[keys[keys.length - 1]] = array;
      }

      return newContent;
    });
  };

  // Fetch content on mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await getAdmissionsContent();
        setContent(data || initialContent);
      } catch (error) {
        toast.error('Failed to load admissions content');
        setContent(initialContent);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Basic validation
      if (!content?.headerSection?.title) {
        throw new Error('Header title is required');
      }

      const updatedContent = await updateAdmissionsContent(content);
      setContent(updatedContent);
      toast.success('Admissions content updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update content');
    } finally {
      setSaving(false);
    }
  };

  // Tab configuration
  const tabs = [
    { name: 'Header', icon: FaGraduationCap, fields: ['headerSection'] },
    { name: 'Main Content', icon: FaBookOpen, fields: ['mainContent'] },
    { name: 'Application', icon: FaWpforms, fields: ['applicationProcess'] },
    { name: 'Required Documents', icon: FaFileContract, fields: ['requiredDocuments'] },
    { name: 'Fee Structure', icon: FaMoneyCheckAlt, fields: ['feeStructure'] },
    { name: 'Apply Now', icon: FaPaperclip, fields: ['applyNow'] },
    { name: 'FAQs', icon: FaRegQuestionCircle, fields: ['faqSection'] }
  ];

  if (loading) return <LoadingSpinner />;
  if (!content) return <div>Failed to load content</div>;

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Admissions Content</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the content for your school's Admissions page.
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
          {/* Preview rendering would go here */}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Tab.Group>
            <Tab.List className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      'px-4 py-2 text-sm font-medium flex items-center',
                      selected
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    )
                  }
                >
                  <tab.icon className="mr-2" />
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-4">
              {/* Header Section */}
              <Tab.Panel>
                <div className="space-y-6">
                  <FormInput
                    label="Header Title"
                    type="text"
                    value={content.headerSection.title}
                    onChange={(e) => handleTextChange('headerSection.title', e.target.value)}
                    placeholder="Enter header title"
                    floating={true}
                  />
                  <FormInput
                    label="Subtitle"
                    type="text"
                    value={content.headerSection.subtitle}
                    onChange={(e) => handleTextChange('headerSection.subtitle', e.target.value)}
                    placeholder="Enter subtitle"
                    floating={true}
                  />
                </div>
              </Tab.Panel>

              {/* Main Content */}
              <Tab.Panel>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Main Content</label>
                  <RichTextEditor
                    value={content.mainContent}
                    onChange={(value) => handleTextChange('mainContent', value)}
                  />
                </div>
              </Tab.Panel>

              {/* Application Process */}
              <Tab.Panel>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Section Title</label>
                    <input
                      type="text"
                      value={content.applicationProcess.title}
                      onChange={(e) => handleTextChange('applicationProcess.title', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <RichTextEditor
                      value={content.applicationProcess.content}
                      onChange={(value) => handleTextChange('applicationProcess.content', value)}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">Application Steps</h3>
                    {content.applicationProcess.steps.map((step, index) => (
                      <div key={index} className="border rounded-md p-4 mb-3 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Step Title</label>
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => handleArrayChange('applicationProcess.steps', index, 'title', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Step Number</label>
                            <input
                              type="number"
                              value={step.stepNumber}
                              onChange={(e) => handleArrayChange('applicationProcess.steps', index, 'stepNumber', parseInt(e.target.value))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            value={step.description}
                            onChange={(e) => handleArrayChange('applicationProcess.steps', index, 'description', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        <div className="absolute top-2 right-2 flex space-x-1">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveArrayItem('applicationProcess.steps', index, -1)}
                              className="text-gray-500 hover:text-blue-600"
                            >
                              <FaArrowUp />
                            </button>
                          )}
                          {index < content.applicationProcess.steps.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveArrayItem('applicationProcess.steps', index, 1)}
                              className="text-gray-500 hover:text-blue-600"
                            >
                              <FaArrowDown />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeArrayItem('applicationProcess.steps', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('applicationProcess.steps', {
                        stepNumber: content.applicationProcess.steps.length + 1,
                        title: '',
                        description: ''
                      })}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
                    >
                      <FaPlus className="mr-2" />
                      Add Step
                    </button>
                  </div>
                </div>
              </Tab.Panel>

              {/* Required Documents */}
              <Tab.Panel>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Section Title</label>
                    <input
                      type="text"
                      value={content.requiredDocuments.title}
                      onChange={(e) => handleTextChange('requiredDocuments.title', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <RichTextEditor
                      value={content.requiredDocuments.content}
                      onChange={(value) => handleTextChange('requiredDocuments.content', value)}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">Documents List</h3>
                    {content.requiredDocuments.documentsList.map((doc, index) => (
                      <div key={index} className="border rounded-md p-4 mb-3 relative">
                        <div className="flex space-x-1">
                          <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700">Document</label>
                            <input
                              type="text"
                              value={doc.text}
                              onChange={(e) => handleArrayChange('requiredDocuments.documentsList', index, 'text', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                          </div>
                          <div className="flex space-x-1">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => moveArrayItem('requiredDocuments.documentsList', index, -1)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <FaArrowUp />
                              </button>
                            )}
                            {index < content.requiredDocuments.documentsList.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveArrayItem('requiredDocuments.documentsList', index, 1)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <FaArrowDown />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeArrayItem('requiredDocuments.documentsList', index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('requiredDocuments.documentsList', { text: '' })}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
                    >
                      <FaPlus className="mr-2" />
                      Add Document
                    </button>
                  </div>
                </div>
              </Tab.Panel>

              {/* Fee Structure */}
              <Tab.Panel>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Section Title</label>
                    <input
                      type="text"
                      value={content.feeStructure.title}
                      onChange={(e) => handleTextChange('feeStructure.title', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <RichTextEditor
                      value={content.feeStructure.content}
                      onChange={(value) => handleTextChange('feeStructure.content', value)}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">Fee Items</h3>
                    {content.feeStructure.fees.map((fee, index) => (
                      <div key={index} className="border rounded-md p-4 mb-3 relative">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Fee Type</label>
                            <input
                              type="text"
                              value={fee.feeType}
                              onChange={(e) => handleArrayChange('feeStructure.fees', index, 'feeType', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input
                              type="number"
                              value={fee.amount}
                              onChange={(e) => handleArrayChange('feeStructure.fees', index, 'amount', parseInt(e.target.value))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Frequency</label>
                            <input
                              type="text"
                              value={fee.frequency}
                              onChange={(e) => handleArrayChange('feeStructure.fees', index, 'frequency', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 flex space-x-1">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveArrayItem('feeStructure.fees', index, -1)}
                              className="text-gray-500 hover:text-blue-600"
                            >
                              <FaArrowUp />
                            </button>
                          )}
                          {index < content.feeStructure.fees.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveArrayItem('feeStructure.fees', index, 1)}
                              className="text-gray-500 hover:text-blue-600"
                            >
                              <FaArrowDown />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeArrayItem('feeStructure.fees', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('feeStructure.fees', { feeType: '', amount: '', frequency: '' })}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
                    >
                      <FaPlus className="mr-2" />
                      Add Fee Item
                    </button>
                  </div>
                </div>
              </Tab.Panel>

              {/* Apply Now */}
              <Tab.Panel>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Primary Button Text</label>
                    <input
                      type="text"
                      value={content.applyNow.primaryButtonText}
                      onChange={(e) => handleTextChange('applyNow.primaryButtonText', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Secondary Button Text</label>
                    <input
                      type="text"
                      value={content.applyNow.secondaryButtonText}
                      onChange={(e) => handleTextChange('applyNow.secondaryButtonText', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>

                  {/* Downloadable Files Manager */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">Application Materials (Downloadable Files)</h3>
                    {content.downloadableFiles && content.downloadableFiles.length > 0 ? (
                      content.downloadableFiles.map((file, index) => (
                        <div key={index} className="border rounded-md p-4 mb-3 relative">
                          <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700">File Title</label>
                            <input
                              type="text"
                              value={file.title || ''}
                              onChange={e => handleArrayChange('downloadableFiles', index, 'title', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                          </div>
                          <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <input
                              type="text"
                              value={file.description || ''}
                              onChange={e => handleArrayChange('downloadableFiles', index, 'description', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                          </div>
                          <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700">File</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={file.file || ''}
                                onChange={e => handleArrayChange('downloadableFiles', index, 'file', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                placeholder="e.g. application_form.pdf"
                                readOnly
                              />
                              <FileUpload
                                acceptedFileTypes={'.pdf'}
                                label="Choose PDF"
                                onFileSelect={async (selectedFile) => {
                                  if (selectedFile) {
                                    try {
                                      // Show uploading indicator (optional: set local state)
                                      const uploaded = await uploadAdmissionsFile(selectedFile, file.title || '', file.description || '');
                                      // Update the file field with the uploaded file name/path
                                      handleArrayChange('downloadableFiles', index, 'file', uploaded.file);
                                    } catch (err) {
                                      alert('File upload failed. Please try again.');
                                    }
                                  }
                                }}
                                maxSize={5 * 1024 * 1024}
                              />
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <button
                              type="button"
                              onClick={() => removeArrayItem('downloadableFiles', index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 mb-2">No downloadable files added yet.</div>
                    )}
                    <button
                      type="button"
                      onClick={() => addArrayItem('downloadableFiles', { title: '', description: '', file: '' })}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
                    >
                      <FaPlus className="mr-2" />
                      Add Downloadable File
                    </button>
                  </div>
                </div>
              </Tab.Panel>

              {/* FAQs */}
              <Tab.Panel>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Section Title</label>
                    <input
                      type="text"
                      value={content.faqSection.title}
                      onChange={(e) => handleTextChange('faqSection.title', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                    <input
                      type="text"
                      value={content.faqSection.subtitle}
                      onChange={(e) => handleTextChange('faqSection.subtitle', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>

                  {/* FAQ List */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">FAQs</h3>
                    {content.faqSection.faqs && content.faqSection.faqs.length > 0 ? (
                      content.faqSection.faqs.map((faq, index) => (
                        <div key={index} className="border rounded-md p-4 mb-3 relative">
                          <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700">Question</label>
                            <input
                              type="text"
                              value={faq.question || ''}
                              onChange={e => handleArrayChange('faqSection.faqs', index, 'question', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                          </div>
                          <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700">Answer</label>
                            <textarea
                              value={faq.answer || ''}
                              onChange={e => handleArrayChange('faqSection.faqs', index, 'answer', e.target.value)}
                              rows={3}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                          </div>
                          <div className="absolute top-2 right-2 flex space-x-1">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => moveArrayItem('faqSection.faqs', index, -1)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <FaArrowUp />
                              </button>
                            )}
                            {index < content.faqSection.faqs.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveArrayItem('faqSection.faqs', index, 1)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <FaArrowDown />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeArrayItem('faqSection.faqs', index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 mb-2">No FAQs added yet.</div>
                    )}
                    <button
                      type="button"
                      onClick={() => addArrayItem('faqSection.faqs', { question: '', answer: '' })}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
                    >
                      <FaPlus className="mr-2" />
                      Add FAQ
                    </button>
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

export default AdmissionsContentForm;