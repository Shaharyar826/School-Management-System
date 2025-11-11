import { useState, useContext, lazy, Suspense, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { FaInfoCircle, FaGraduationCap, FaUserGraduate, FaChalkboardTeacher, FaImages } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy load components
const AboutUsContentForm = lazy(() => import('../components/content/AboutUsContentForm'));
const AdmissionsContentForm = lazy(() => import('../components/content/AdmissionsContentForm'));
const AcademicsContentForm = lazy(() => import('../components/content/AcademicsContentForm'));
const GalleryManager = lazy(() => import('../components/content/GalleryManager'));
const FacultyContentForm = lazy(() => import('../components/content/FacultyContentForm'));
const EventsPageContentManager = lazy(() => import('../components/content/EventsPageContentManager'));

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ContentManagementPage = () => {
  const { user } = useContext(AuthContext);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Only admin and principal can access this page
  if (user && user.role !== 'admin' && user.role !== 'principal') {
    return <Navigate to="/dashboard" />;
  }

  // Define tab metadata
  const tabsMetadata = [
    {
      name: 'About Us',
      icon: <FaInfoCircle className="mr-2" />,
      component: AboutUsContentForm
    },
    {
      name: 'Admissions',
      icon: <FaUserGraduate className="mr-2" />,
      component: AdmissionsContentForm
    },
    {
      name: 'Academics',
      icon: <FaGraduationCap className="mr-2" />,
      component: AcademicsContentForm
    },
    {
      name: 'Faculty',
      icon: <FaChalkboardTeacher className="mr-2" />,
      component: FacultyContentForm
    },
    {
      name: 'Gallery',
      icon: <FaImages className="mr-2" />,
      component: GalleryManager
    },
    {
      name: 'Events Page Content',
      icon: <FaImages className="mr-2" />,
      component: EventsPageContentManager
    }
  ];

  // Memoize the active component to prevent unnecessary re-renders
  const ActiveComponent = useMemo(() => {
    const Component = tabsMetadata[selectedIndex].component;
    return <Component />;
  }, [selectedIndex, tabsMetadata]);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Content Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage content for various pages of your school website.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="flex p-1 space-x-1 bg-gray-100 rounded-t-lg">
            {tabsMetadata.map((tab, index) => (
              <button
                key={tab.name}
                className={classNames(
                  'w-full py-3 px-4 text-sm font-medium rounded-md flex items-center justify-center',
                  'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
                  selectedIndex === index
                    ? 'bg-white shadow text-blue-700'
                    : 'text-gray-700 hover:bg-white/[0.5] hover:text-blue-700'
                )}
                onClick={() => setSelectedIndex(index)}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>

          <div className="mt-2 rounded-b-lg p-3">
            <Suspense fallback={
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            }>
              {ActiveComponent}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManagementPage;
