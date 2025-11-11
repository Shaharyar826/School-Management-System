import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEye, FaEdit, FaSave, FaPlus, FaTrash, FaGraduationCap, FaBookOpen, FaWpforms, FaMoneyCheckAlt } from 'react-icons/fa';
import { getAcademicsContent, updateAcademicsContent } from '../../services/pageContentApi';
import LoadingSpinner from '../common/LoadingSpinner';
import RichTextEditor from '../common/RichTextEditor';
import FormInput from '../common/FormInput';
import { Tab } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const emptyGradingRow = { range: '', grade: '', description: '' };

const defaultContent = {
  philosophyTitle: '',
  philosophyIntro: '',
  approachList: [],
  goalsList: [],
  curriculumTitle: '',
  curriculumIntro: '',
  primaryLevel: { title: '', intro: '', coreSubjects: [], additionalSubjects: [] },
  middleLevel: { title: '', intro: '', coreSubjects: [], additionalSubjects: [] },
  highSchoolLevel: { title: '', intro: '', scienceStream: [], artsStream: [] },
  assessmentTitle: '',
  assessmentIntro: '',
  assessmentMethods: [],
  gradingTable: [emptyGradingRow],
  supportTitle: '',
  supportIntro: '',
  supportServices: [],
  learningResources: [],
};

const AcademicsContentForm = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState(defaultContent);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await getAcademicsContent();
        setContent({ ...defaultContent, ...data });
      } catch {
        toast.error('Failed to load academics content');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
    // eslint-disable-next-line
  }, []);

  const handleContentChange = (field, value) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleListChange = (field, list) => {
    setContent(prev => ({ ...prev, [field]: list }));
  };

  const handleNestedListChange = (section, field, list) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: list }
    }));
  };

  const handleGradingTableChange = (index, key, value) => {
    const newTable = [...content.gradingTable];
    newTable[index][key] = value;
    setContent(prev => ({ ...prev, gradingTable: newTable }));
  };

  const addGradingRow = () => {
    setContent(prev => ({ ...prev, gradingTable: [...prev.gradingTable, emptyGradingRow] }));
  };

  const removeGradingRow = (index) => {
    setContent(prev => ({
      ...prev,
      gradingTable: prev.gradingTable.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateAcademicsContent(content);
      toast.success('Academics content updated successfully');
    } catch {
      toast.error('Failed to update academics content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Helper for rendering list inputs
  const ListInput = ({ label, value, onChange }) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={() => onChange([...value, ''])}
          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center text-sm"
        >
          <FaPlus className="mr-1" size={12} /> Add Item
        </button>
      </div>
      <div className="space-y-2">
        {value.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={e => {
                const newList = [...value];
                newList[idx] = e.target.value;
                onChange(newList);
              }}
              placeholder={`Enter ${label.toLowerCase()} item`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md transition-all duration-200 focus:border-green-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== idx))}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <FaTrash size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Academics Content</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the content for your school's Academics page.
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
          <pre>{JSON.stringify(content, null, 2)}</pre>
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
              }><FaGraduationCap className="mr-2" />Philosophy</Tab>
              <Tab className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium flex items-center',
                  selected
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                )
              }><FaBookOpen className="mr-2" />Curriculum</Tab>
              <Tab className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium flex items-center',
                  selected
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                )
              }><FaWpforms className="mr-2" />Assessment & Grading</Tab>
              <Tab className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium flex items-center',
                  selected
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                )
              }><FaMoneyCheckAlt className="mr-2" />Academic Support</Tab>
            </Tab.List>
            <Tab.Panels className="mt-4">
              <Tab.Panel>
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Philosophy Section</h3>
                  <FormInput
                    label="Section Title"
                    type="text"
                    placeholder="Enter section title"
                    value={content.philosophyTitle}
                    onChange={e => handleContentChange('philosophyTitle', e.target.value)}
                    floating={true}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Introduction</label>
                    <RichTextEditor
                      value={content.philosophyIntro}
                      onChange={val => handleContentChange('philosophyIntro', val)}
                    />
                  </div>
                  <ListInput label="Our Approach" value={content.approachList} onChange={list => handleListChange('approachList', list)} />
                  <ListInput label="Our Goals" value={content.goalsList} onChange={list => handleListChange('goalsList', list)} />
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Curriculum Section</h3>
                  <FormInput
                    label="Section Title"
                    type="text"
                    placeholder="Enter section title"
                    value={content.curriculumTitle}
                    onChange={e => handleContentChange('curriculumTitle', e.target.value)}
                    floating={true}
                  />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Introduction</label>
                    <RichTextEditor
                      value={content.curriculumIntro}
                      onChange={val => handleContentChange('curriculumIntro', val)}
                    />
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Primary Level */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Primary Level</h4>
                    <FormInput
                      label="Title"
                      type="text"
                      placeholder="Enter title"
                      value={content.primaryLevel.title}
                      onChange={e => handleNestedChange('primaryLevel', 'title', e.target.value)}
                      floating={true}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Introduction</label>
                      <RichTextEditor
                        value={content.primaryLevel.intro}
                        onChange={val => handleNestedChange('primaryLevel', 'intro', val)}
                        height={120}
                      />
                    </div>
                    <ListInput
                      label="Core Subjects"
                      value={content.primaryLevel.coreSubjects}
                      onChange={list => handleNestedListChange('primaryLevel', 'coreSubjects', list)}
                    />
                    <ListInput
                      label="Additional Subjects"
                      value={content.primaryLevel.additionalSubjects}
                      onChange={list => handleNestedListChange('primaryLevel', 'additionalSubjects', list)}
                    />
                  </div>
                  {/* Middle Level */}
                  <div>
                    <h4 className="font-semibold">Middle Level</h4>
                    <input
                      type="text"
                      placeholder="Title"
                      value={content.middleLevel.title}
                      onChange={e => handleNestedChange('middleLevel', 'title', e.target.value)}
                      className="mb-2 w-full rounded-md border-gray-300"
                    />
                    <RichTextEditor
                      value={content.middleLevel.intro}
                      onChange={val => handleNestedChange('middleLevel', 'intro', val)}
                    />
                    <ListInput
                      label="Core Subjects"
                      value={content.middleLevel.coreSubjects}
                      onChange={list => handleNestedListChange('middleLevel', 'coreSubjects', list)}
                    />
                    <ListInput
                      label="Additional Subjects"
                      value={content.middleLevel.additionalSubjects}
                      onChange={list => handleNestedListChange('middleLevel', 'additionalSubjects', list)}
                    />
                  </div>
                  {/* High School Level */}
                  <div>
                    <h4 className="font-semibold">High School Level</h4>
                    <input
                      type="text"
                      placeholder="Title"
                      value={content.highSchoolLevel.title}
                      onChange={e => handleNestedChange('highSchoolLevel', 'title', e.target.value)}
                      className="mb-2 w-full rounded-md border-gray-300"
                    />
                    <RichTextEditor
                      value={content.highSchoolLevel.intro}
                      onChange={val => handleNestedChange('highSchoolLevel', 'intro', val)}
                    />
                    <ListInput
                      label="Science Stream"
                      value={content.highSchoolLevel.scienceStream}
                      onChange={list => handleNestedListChange('highSchoolLevel', 'scienceStream', list)}
                    />
                    <ListInput
                      label="Arts Stream"
                      value={content.highSchoolLevel.artsStream}
                      onChange={list => handleNestedListChange('highSchoolLevel', 'artsStream', list)}
                    />
                  </div>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <h3 className="text-lg font-bold mb-2">Assessment & Grading</h3>
                <input
                  type="text"
                  placeholder="Section Title"
                  value={content.assessmentTitle}
                  onChange={e => handleContentChange('assessmentTitle', e.target.value)}
                  className="mb-2 w-full rounded-md border-gray-300"
                />
                <RichTextEditor
                  value={content.assessmentIntro}
                  onChange={val => handleContentChange('assessmentIntro', val)}
                />
                <ListInput
                  label="Assessment Methods"
                  value={content.assessmentMethods}
                  onChange={list => handleListChange('assessmentMethods', list)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grading Table</label>
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg mb-2">
                    <thead>
                      <tr>
                        <th className="py-2 px-2 border">Range</th>
                        <th className="py-2 px-2 border">Grade</th>
                        <th className="py-2 px-2 border">Description</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {content.gradingTable.map((row, idx) => (
                        <tr key={idx}>
                          <td><input type="text" value={row.range} onChange={e => handleGradingTableChange(idx, 'range', e.target.value)} className="w-full border" /></td>
                          <td><input type="text" value={row.grade} onChange={e => handleGradingTableChange(idx, 'grade', e.target.value)} className="w-full border" /></td>
                          <td><input type="text" value={row.description} onChange={e => handleGradingTableChange(idx, 'description', e.target.value)} className="w-full border" /></td>
                          <td>
                            <button type="button" onClick={() => removeGradingRow(idx)} className="text-red-500"><FaTrash /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button type="button" onClick={addGradingRow} className="text-blue-600 flex items-center">
                    <FaPlus className="mr-1" /> Add Row
                  </button>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <h3 className="text-lg font-bold mb-2">Academic Support</h3>
                <input
                  type="text"
                  placeholder="Section Title"
                  value={content.supportTitle}
                  onChange={e => handleContentChange('supportTitle', e.target.value)}
                  className="mb-2 w-full rounded-md border-gray-300"
                />
                <RichTextEditor
                  value={content.supportIntro}
                  onChange={val => handleContentChange('supportIntro', val)}
                />
                <ListInput
                  label="Support Services"
                  value={content.supportServices}
                  onChange={list => handleListChange('supportServices', list)}
                />
                <ListInput
                  label="Learning Resources"
                  value={content.learningResources}
                  onChange={list => handleListChange('learningResources', list)}
                />
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

export default AcademicsContentForm;