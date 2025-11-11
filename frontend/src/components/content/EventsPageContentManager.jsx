import { useEffect, useState } from 'react';
import { getEventsPageContent, updateEventsPageSection, uploadEventsPageImage } from '../../services/eventsPageContentApi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaNewspaper, FaListUl } from 'react-icons/fa';

const defaultEvent = {
  title: '', date: '', time: '', location: '', description: '', image: '', category: '', displayOrder: 0, isActive: true
};
const defaultNews = {
  title: '', date: '', summary: '', image: '', displayOrder: 0, isActive: true
};
const defaultCalendar = {
  title: '', date: '', description: '', semester: 'First', displayOrder: 0, isActive: true
};

const sectionMeta = {
  events: { label: 'Events', icon: <FaListUl className="mr-2" /> },
  news: { label: 'News', icon: <FaNewspaper className="mr-2" /> },
  calendar: { label: 'Calendar', icon: <FaCalendarAlt className="mr-2" /> },
};

const EventsPageContentManager = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({ events: [], news: [], calendar: [] });
  const [section, setSection] = useState('events');
  const [form, setForm] = useState({ ...defaultEvent });
  const [editIdx, setEditIdx] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => { fetchContent(); }, []);
  const fetchContent = async () => {
    setLoading(true);
    const data = await getEventsPageContent();
    setContent(data);
    setLoading(false);
  };

  const handleSection = (s) => {
    setSection(s);
    setForm(s === 'events' ? { ...defaultEvent } : s === 'news' ? { ...defaultNews } : { ...defaultCalendar });
    setEditIdx(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setForm({ ...content[section][idx] });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDelete = async (idx) => {
    if (!window.confirm('Delete this item?')) return;
    const items = content[section].filter((_, i) => i !== idx);
    await updateEventsPageSection(section, items);
    toast.success('Deleted');
    fetchContent();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let items = [...content[section]];
    let formToSave = { ...form };
    if ((section === 'events' || section === 'news') && imageFile) {
      const url = await uploadEventsPageImage(imageFile);
      formToSave.image = url;
    }
    if (editIdx !== null) {
      items[editIdx] = formToSave;
    } else {
      items.push(formToSave);
    }
    await updateEventsPageSection(section, items);
    toast.success(editIdx !== null ? 'Updated' : 'Added');
    setForm(section === 'events' ? { ...defaultEvent } : section === 'news' ? { ...defaultNews } : { ...defaultCalendar });
    setEditIdx(null);
    setImageFile(null);
    setImagePreview(null);
    fetchContent();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center">
        <FaListUl className="mr-2 text-blue-400" />
        Events Page Content Manager
      </h2>
      <div className="flex space-x-2 mb-6">
        {Object.entries(sectionMeta).map(([key, meta]) => (
          <button
            key={key}
            className={`px-4 py-2 rounded flex items-center font-semibold transition-colors duration-150 ${section === key ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
            onClick={() => handleSection(key)}
          >
            {meta.icon}{meta.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center">
          <FaPlus className="mr-2 text-blue-400" />
          {editIdx !== null ? `Edit ${sectionMeta[section].label}` : `Add New ${sectionMeta[section].label}`}
        </h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          {section === 'events' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input name="title" value={form.title} onChange={handleInput} placeholder="Title" className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input name="date" type="date" value={form.date ? format(new Date(form.date), 'yyyy-MM-dd') : ''} onChange={handleInput} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input name="time" value={form.time} onChange={handleInput} placeholder="Time" className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input name="location" value={form.location} onChange={handleInput} placeholder="Location" className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input name="category" value={form.category} onChange={handleInput} placeholder="Category" className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
                {imagePreview && <img src={imagePreview} alt="Preview" className="h-16 mt-2 rounded shadow" />}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input name="displayOrder" type="number" value={form.displayOrder} onChange={handleInput} placeholder="Order" className="w-full border rounded p-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleInput} placeholder="Description" className="w-full border rounded p-2" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleInput} className="mr-2" />
                <span className="text-sm">Active</span>
              </div>
            </>
          )}
          {section === 'news' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input name="title" value={form.title} onChange={handleInput} placeholder="Title" className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input name="date" type="date" value={form.date ? format(new Date(form.date), 'yyyy-MM-dd') : ''} onChange={handleInput} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
                {imagePreview && <img src={imagePreview} alt="Preview" className="h-16 mt-2 rounded shadow" />}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input name="displayOrder" type="number" value={form.displayOrder} onChange={handleInput} placeholder="Order" className="w-full border rounded p-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Summary</label>
                <textarea name="summary" value={form.summary} onChange={handleInput} placeholder="Summary" className="w-full border rounded p-2" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleInput} className="mr-2" />
                <span className="text-sm">Active</span>
              </div>
            </>
          )}
          {section === 'calendar' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input name="title" value={form.title} onChange={handleInput} placeholder="Title" className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date (e.g. Aug 15)</label>
                <input name="date" value={form.date} onChange={handleInput} placeholder="Date (e.g. Aug 15)" className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Semester</label>
                <input name="semester" value={form.semester} onChange={handleInput} placeholder="Semester (First/Second)" className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input name="displayOrder" type="number" value={form.displayOrder} onChange={handleInput} placeholder="Order" className="w-full border rounded p-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleInput} placeholder="Description" className="w-full border rounded p-2" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleInput} className="mr-2" />
                <span className="text-sm">Active</span>
              </div>
            </>
          )}
          <div className="md:col-span-2 flex space-x-2 mt-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded flex items-center font-semibold hover:bg-blue-700 transition-colors">
              <FaPlus className="mr-2" />{editIdx !== null ? 'Update' : 'Add'}
            </button>
            {editIdx !== null && (
              <button type="button" className="px-4 py-2 bg-gray-400 text-white rounded flex items-center font-semibold hover:bg-gray-500 transition-colors" onClick={() => { setEditIdx(null); setForm(section === 'events' ? { ...defaultEvent } : section === 'news' ? { ...defaultNews } : { ...defaultCalendar }); setImageFile(null); setImagePreview(null); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
          {sectionMeta[section].icon}
          {sectionMeta[section].label} List
        </h2>
        {loading ? <div>Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(form).map(k => (
                    <th key={k} className="px-2 py-1 text-xs text-gray-500 uppercase">{k}</th>
                  ))}
                  <th className="px-2 py-1 text-xs text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {content[section].map((item, idx) => (
                  <tr key={idx} className={item.isActive ? '' : 'bg-gray-100'}>
                    {Object.keys(form).map(k => (
                      <td key={k} className="px-2 py-1">
                        {k === 'image' && item[k] ? (
                          <img src={item[k]} alt="" className="h-10 w-10 object-cover rounded" />
                        ) : (
                          item[k]?.toString()
                        )}
                      </td>
                    ))}
                    <td className="px-2 py-1 flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 flex items-center" onClick={() => handleEdit(idx)}><FaEdit className="mr-1" />Edit</button>
                      <button className="text-red-600 hover:text-red-900 flex items-center" onClick={() => handleDelete(idx)}><FaTrash className="mr-1" />Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPageContentManager; 