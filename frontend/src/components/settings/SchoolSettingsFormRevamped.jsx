import { useState, useEffect, Fragment } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import FormInput from '../common/FormInput';
import FormTextarea from '../common/FormTextarea';
import LoadingSpinner from '../common/LoadingSpinner';
import CloudinaryImage from '../common/CloudinaryImage';
import { Tab } from '@headlessui/react';
import { Switch } from '@headlessui/react';
import FeaturedTeachersManager from './FeaturedTeachersManager';
import LandingPageEventsManager from './LandingPageEventsManager';
import TestimonialsManager from './TestimonialsManager';
import {
  FaSchool,
  FaImage,
  FaInfoCircle,
  FaEye,
  FaChartBar,
  FaSave,
  FaSpinner,
  FaUpload,
  FaPhone,
  FaEnvelope,
  FaQuoteLeft,
  FaCalendarAlt,
  FaBuilding,
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaNewspaper,
  FaCog,
  FaGlobe,
  FaAddressCard,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Card component for consistent styling
const SettingsCard = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 mb-6 ${className}`}>
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center">
        <span className="text-yellow-500 mr-3">{icon}</span>
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

// Toggle switch component
const ToggleSwitch = ({ enabled, onChange, label, description = '', icon = null }) => {
  return (
    <Switch.Group as="div" className="flex items-center justify-between p-4 rounded-lg bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 mb-4">
      <Switch.Label as="span" className="flex-grow flex items-start">
        {icon && <span className="text-yellow-500 mr-3 mt-0.5">{icon}</span>}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {description && <span className="text-xs text-gray-500 mt-1">{description}</span>}
        </div>
      </Switch.Label>
      <Switch
        checked={enabled}
        onChange={onChange}
        className={`${
          enabled ? 'bg-yellow-500' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2`}
      >
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
    </Switch.Group>
  );
};

const SchoolSettingsFormRevamped = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [heroImage, setHeroImage] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  // Fetch school settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/school-settings');
        if (res.data.success) {
          setSettings(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching school settings:', err);
        toast.error('Failed to load school settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      // Handle nested properties (e.g., landingPage.heroTitle)
      const [parent, child] = name.split('.');
      setSettings({
        ...settings,
        [parent]: {
          ...settings[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      // Handle top-level properties
      setSettings({
        ...settings,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Handle toggle switch changes for section visibility
  const handleToggleChange = (name, value) => {
    const [parent, child] = name.split('.');
    setSettings({
      ...settings,
      [parent]: {
        ...settings[parent],
        [child]: value
      }
    });
  };

  // Handle hero image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeroImage(file);
      setHeroImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Update settings
      const res = await axios.put('/api/school-settings', settings);

      // Upload hero image if selected
      if (heroImage) {
        const formData = new FormData();
        formData.append('heroImage', heroImage);

        await axios.post('/api/school-settings/hero-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      toast.success('School settings updated successfully');
    } catch (err) {
      console.error('Error updating school settings:', err);
      toast.error('Failed to update school settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Tab categories
  const tabs = [
    { name: 'General', icon: <FaSchool size={18} /> },
    { name: 'Landing Page', icon: <FaGlobe size={18} /> },
    { name: 'Featured Teachers', icon: <FaChalkboardTeacher size={18} /> },
    { name: 'Events', icon: <FaCalendarAlt size={18} /> },
    { name: 'Testimonials', icon: <FaQuoteLeft size={18} /> },
    { name: 'Visibility', icon: <FaEye size={18} /> },
    { name: 'Contact & Social', icon: <FaAddressCard size={18} /> },
    { name: 'Footer', icon: <FaNewspaper size={18} /> }
  ];

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <form onSubmit={handleSubmit}>
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <div className="flex flex-col md:flex-row">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200">
              <Tab.List className="flex flex-col space-y-1 py-4">
                {tabs.map((tab, index) => (
                  <Tab
                    key={tab.name}
                    className={({ selected }) =>
                      classNames(
                        'flex items-center px-6 py-3 text-sm font-medium text-left focus:outline-none',
                        selected
                          ? 'bg-white border-l-4 border-yellow-500 text-yellow-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      )
                    }
                  >
                    <span className="mr-3 text-yellow-500">{tab.icon}</span>
                    {tab.name}
                  </Tab>
                ))}
              </Tab.List>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6">
              <Tab.Panels>
                {/* General Settings Panel */}
                <Tab.Panel>
                  <div className="space-y-6">
                    <SettingsCard
                      title="Basic Information"
                      icon={<FaInfoCircle size={18} />}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                          label="School Name"
                          name="schoolName"
                          value={settings?.schoolName || ''}
                          onChange={handleChange}
                          required
                          className="bg-gray-50 focus:bg-white"
                        />
                        <FormInput
                          label="Established Year"
                          name="establishedYear"
                          type="number"
                          value={settings?.establishedYear || ''}
                          onChange={handleChange}
                          required
                          className="bg-gray-50 focus:bg-white"
                        />
                        <FormInput
                          label="Tagline"
                          name="tagline"
                          value={settings?.tagline || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </SettingsCard>
                  </div>
                </Tab.Panel>

                {/* Landing Page Panel */}
                <Tab.Panel>
                  <div className="space-y-6">
                    <SettingsCard
                      title="Hero Section"
                      icon={<FaImage size={18} />}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <FormInput
                            label="Hero Title"
                            name="landingPage.heroTitle"
                            value={settings?.landingPage?.heroTitle || ''}
                            onChange={handleChange}
                            className="bg-gray-50 focus:bg-white"
                          />
                          <FormTextarea
                            label="Hero Subtitle"
                            name="landingPage.heroSubtitle"
                            value={settings?.landingPage?.heroSubtitle || ''}
                            onChange={handleChange}
                            rows={3}
                            className="bg-gray-50 focus:bg-white mt-4"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hero Image
                          </label>
                          <div className="mb-3 bg-white p-4 rounded-md border border-gray-200">
                            {(heroImagePreview || settings?.landingPage?.heroImage) && (
                              <div className="mb-3">
                                <CloudinaryImage
                                  src={heroImagePreview || settings?.landingPage?.heroImage}
                                  alt="Hero Preview"
                                  className="w-full h-40 object-cover rounded-md shadow-sm"
                                  fallbackSrc="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                                />
                              </div>
                            )}
                            <div className="mt-2">
                              <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-200 border-dashed rounded-md appearance-none cursor-pointer hover:border-yellow-500 focus:outline-none">
                                <span className="flex items-center space-x-2">
                                  <FaUpload className="text-yellow-500" />
                                  <span className="font-medium text-gray-600">
                                    Drop files to upload or browse
                                  </span>
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SettingsCard>

                    <SettingsCard
                      title="About Section"
                      icon={<FaQuoteLeft size={18} />}
                    >
                      <div className="grid grid-cols-1 gap-6">
                        <FormInput
                          label="About Title"
                          name="landingPage.aboutTitle"
                          value={settings?.landingPage?.aboutTitle || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                        />
                        <FormTextarea
                          label="About Content"
                          name="landingPage.aboutContent"
                          value={settings?.landingPage?.aboutContent || ''}
                          onChange={handleChange}
                          rows={5}
                          className="bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </SettingsCard>

                    <SettingsCard
                      title="Stats"
                      icon={<FaChartBar size={18} />}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                          label="Success Rate (%)"
                          name="landingPage.stats.successRate"
                          type="number"
                          min="0"
                          max="100"
                          value={settings?.landingPage?.stats?.successRate || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </SettingsCard>
                  </div>
                </Tab.Panel>

                {/* Featured Teachers Panel */}
                <Tab.Panel>
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Featured Teachers Management</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add, edit, or remove featured teachers that will be displayed on the landing page.
                        These teachers will appear in the "Meet Our Teachers" section.
                      </p>
                    </div>
                    <FeaturedTeachersManager />
                  </div>
                </Tab.Panel>

                {/* Events Panel */}
                <Tab.Panel>
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Landing Page Events Management</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add, edit, or remove events that will be displayed on the landing page.
                        These events will appear in the "Upcoming Events" section.
                      </p>
                    </div>
                    <LandingPageEventsManager />
                  </div>
                </Tab.Panel>

                {/* Testimonials Panel */}
                <Tab.Panel>
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Testimonials Management</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add, edit, or remove testimonials from students, parents, or alumni that will be displayed on the landing page.
                        These testimonials will appear in the "What People Say" section.
                      </p>
                    </div>
                    <TestimonialsManager />
                  </div>
                </Tab.Panel>

                {/* Section Visibility Panel */}
                <Tab.Panel>
                  <div className="space-y-6">
                    <SettingsCard
                      title="Homepage Sections Visibility"
                      icon={<FaEye size={18} />}
                    >
                      <div className="space-y-4">
                        <p className="text-sm text-gray-500 mb-4">
                          Control which sections are displayed on your school's landing page.
                        </p>

                        <ToggleSwitch
                          label="Teacher Section"
                          description="Display featured teachers on the homepage"
                          icon={<FaChalkboardTeacher size={16} />}
                          enabled={settings?.landingPage?.showTeacherSection !== false}
                          onChange={(value) => handleToggleChange('landingPage.showTeacherSection', value)}
                        />

                        <ToggleSwitch
                          label="Events Section"
                          description="Display upcoming events and news on the homepage"
                          icon={<FaCalendarAlt size={16} />}
                          enabled={settings?.landingPage?.showEventsSection !== false}
                          onChange={(value) => handleToggleChange('landingPage.showEventsSection', value)}
                        />

                        <ToggleSwitch
                          label="Stats Section"
                          description="Display school statistics on the homepage"
                          icon={<FaChartBar size={16} />}
                          enabled={settings?.landingPage?.showStatsSection !== false}
                          onChange={(value) => handleToggleChange('landingPage.showStatsSection', value)}
                        />

                        <ToggleSwitch
                          label="Testimonials Section"
                          description="Display testimonials from students and parents"
                          icon={<FaQuoteLeft size={16} />}
                          enabled={settings?.landingPage?.showTestimonialsSection !== false}
                          onChange={(value) => handleToggleChange('landingPage.showTestimonialsSection', value)}
                        />
                      </div>
                    </SettingsCard>
                  </div>
                </Tab.Panel>

                {/* Contact & Social Panel */}
                <Tab.Panel>
                  <div className="space-y-6">
                    <SettingsCard
                      title="Contact Information"
                      icon={<FaAddressCard size={18} />}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                          label="Email"
                          name="email"
                          type="email"
                          value={settings?.email || ''}
                          onChange={handleChange}
                          required
                          className="bg-gray-50 focus:bg-white"
                          icon={<FaEnvelope className="text-gray-400" />}
                        />
                        <FormInput
                          label="Phone"
                          name="phone"
                          value={settings?.phone || ''}
                          onChange={handleChange}
                          required
                          className="bg-gray-50 focus:bg-white"
                          icon={<FaPhone className="text-gray-400" />}
                        />
                      </div>

                      <div className="mt-6">
                        <h4 className="text-md font-medium text-gray-700 mb-3">Address</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormInput
                            label="Street"
                            name="address.street"
                            value={settings?.address?.street || ''}
                            onChange={handleChange}
                            className="bg-gray-50 focus:bg-white"
                          />
                          <FormInput
                            label="City"
                            name="address.city"
                            value={settings?.address?.city || ''}
                            onChange={handleChange}
                            className="bg-gray-50 focus:bg-white"
                          />
                          <FormInput
                            label="State/Province"
                            name="address.state"
                            value={settings?.address?.state || ''}
                            onChange={handleChange}
                            className="bg-gray-50 focus:bg-white"
                          />
                          <FormInput
                            label="Zip/Postal Code"
                            name="address.zipCode"
                            value={settings?.address?.zipCode || ''}
                            onChange={handleChange}
                            className="bg-gray-50 focus:bg-white"
                          />
                          <FormInput
                            label="Country"
                            name="address.country"
                            value={settings?.address?.country || ''}
                            onChange={handleChange}
                            className="bg-gray-50 focus:bg-white"
                          />
                        </div>
                      </div>
                    </SettingsCard>

                    <SettingsCard
                      title="Social Media Links"
                      icon={<FaGlobe size={18} />}
                    >
                      <div className="grid grid-cols-1 gap-6">
                        <FormInput
                          label="Facebook"
                          name="socialMedia.facebook"
                          value={settings?.socialMedia?.facebook || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                          icon={<FaFacebook className="text-blue-600" />}
                        />
                        <FormInput
                          label="Twitter"
                          name="socialMedia.twitter"
                          value={settings?.socialMedia?.twitter || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                          icon={<FaTwitter className="text-blue-400" />}
                        />
                        <FormInput
                          label="Instagram"
                          name="socialMedia.instagram"
                          value={settings?.socialMedia?.instagram || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                          icon={<FaInstagram className="text-pink-500" />}
                        />
                        <FormInput
                          label="LinkedIn"
                          name="socialMedia.linkedin"
                          value={settings?.socialMedia?.linkedin || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                          icon={<FaLinkedin className="text-blue-700" />}
                        />
                      </div>
                    </SettingsCard>

                    <SettingsCard
                      title="School Hours"
                      icon={<FaClock size={18} />}
                    >
                      <div className="grid grid-cols-1 gap-6">
                        <FormInput
                          label="Weekdays"
                          name="schoolHours.weekdays"
                          value={settings?.schoolHours?.weekdays || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                          placeholder="e.g., Monday - Friday: 8:00 AM - 3:00 PM"
                        />
                        <FormInput
                          label="Weekend"
                          name="schoolHours.weekend"
                          value={settings?.schoolHours?.weekend || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                          placeholder="e.g., Saturday: 8:00 AM - 12:00 PM"
                        />
                        <FormInput
                          label="Closed"
                          name="schoolHours.closed"
                          value={settings?.schoolHours?.closed || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                          placeholder="e.g., Sunday: Closed"
                        />
                      </div>
                    </SettingsCard>
                  </div>
                </Tab.Panel>

                {/* Footer Settings Panel */}
                <Tab.Panel>
                  <div className="space-y-6">
                    <SettingsCard
                      title="Footer Information"
                      icon={<FaNewspaper size={18} />}
                    >
                      <div className="grid grid-cols-1 gap-6">
                        <FormTextarea
                          label="School Description"
                          name="footer.schoolDescription"
                          value={settings?.footer?.schoolDescription || ''}
                          onChange={handleChange}
                          rows={4}
                          className="bg-gray-50 focus:bg-white"
                          placeholder="Brief description of your school that will appear in the footer"
                        />

                        <FormInput
                          label="Copyright Text"
                          name="footer.copyrightText"
                          value={settings?.footer?.copyrightText || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                          placeholder="e.g., All rights reserved."
                        />

                        <div className="mt-4">
                          <ToggleSwitch
                            label="Newsletter Subscription"
                            description="Enable newsletter subscription form in the footer"
                            enabled={settings?.footer?.newsletterEnabled !== false}
                            onChange={(value) => handleToggleChange('footer.newsletterEnabled', value)}
                          />
                        </div>
                      </div>
                    </SettingsCard>

                    <SettingsCard
                      title="Social Media Links"
                      icon={<FaGlobe size={18} />}
                    >
                      <div className="grid grid-cols-1 gap-6">
                        <FormInput
                          label="Facebook"
                          name="socialMedia.facebook"
                          value={settings?.socialMedia?.facebook || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                          icon={<FaFacebook className="text-blue-600" />}
                        />
                        <FormInput
                          label="Twitter"
                          name="socialMedia.twitter"
                          value={settings?.socialMedia?.twitter || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                          icon={<FaTwitter className="text-blue-400" />}
                        />
                        <FormInput
                          label="Instagram"
                          name="socialMedia.instagram"
                          value={settings?.socialMedia?.instagram || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                          icon={<FaInstagram className="text-pink-500" />}
                        />
                        <FormInput
                          label="LinkedIn"
                          name="socialMedia.linkedin"
                          value={settings?.socialMedia?.linkedin || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                          icon={<FaLinkedin className="text-blue-700" />}
                        />
                        <FormInput
                          label="YouTube"
                          name="socialMedia.youtube"
                          value={settings?.socialMedia?.youtube || ''}
                          onChange={handleChange}
                          className="bg-gray-50 focus:bg-white"
                          icon={<svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" />
                          </svg>}
                        />
                      </div>
                    </SettingsCard>
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </div>
          </div>
        </Tab.Group>

        {/* Sticky Save Button */}
        <div className="sticky bottom-0 p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 font-medium transition-all duration-200 flex items-center shadow-md"
            disabled={saving}
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SchoolSettingsFormRevamped;
