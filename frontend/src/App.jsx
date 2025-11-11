import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useContext, lazy, Suspense } from 'react'
import Layout from './components/layout/Layout'
import Login from './components/auth/Login'
import ForgotPassword from './components/auth/ForgotPassword'
import TempPasswordReset from './components/auth/TempPasswordReset'
import Dashboard from './components/dashboard/Dashboard'
import PrivateRoute from './components/routing/PrivateRoute'
import ProfileEditRouter from './components/routing/ProfileEditRouter'
import ProfileRouter from './components/routing/ProfileRouter'
import AuthContext from './context/AuthContext'
import { NavigationProvider } from './context/NavigationContext'
import { ContactMessageProvider } from './context/ContactMessageContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import PerformanceDebugger from './components/debug/PerformanceDebugger'

// Import landing page components
import LandingPage from './pages/LandingPage'

// Lazy load all page components to improve performance
const EventsNoticesPage = lazy(() => import('./pages/EventsNoticesPage'))
const StudentsPage = lazy(() => import('./pages/StudentsPage'))
const TeachersPage = lazy(() => import('./pages/TeachersPage'))
const SupportStaffPage = lazy(() => import('./pages/SupportStaffPage'))
const AdminStaffPage = lazy(() => import('./pages/AdminStaffPage'))
const AttendancePage = lazy(() => import('./pages/AttendancePage'))
const FeesPage = lazy(() => import('./pages/FeesPage'))
const SalariesPage = lazy(() => import('./pages/SalariesPage'))
const StudentAttendancePage = lazy(() => import('./pages/StudentAttendancePage'))
const StudentFeesPage = lazy(() => import('./pages/StudentFeesPage'))
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const ContactMessagesPage = lazy(() => import('./pages/ContactMessagesPage'))
const MeetingsPage = lazy(() => import('./pages/MeetingsPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
// Import the main school settings page
const SchoolSettingsPage = lazy(() => import('./pages/SchoolSettingsPage'))
const ContentManagementPage = lazy(() => import('./pages/ContentManagementPage'))
const InputDemoPage = lazy(() => import('./pages/InputDemoPage'))
const ThemeDemoPage = lazy(() => import('./pages/ThemeDemoPage'))
const FloatingLabelDemoPage = lazy(() => import('./pages/FloatingLabelDemoPage'))
// const ButtonTestPage = lazy(() => import('./pages/ButtonTestPage'))
// const PublicButtonTestPage = lazy(() => import('./pages/PublicButtonTestPage'))
const SimpleTeacherPage = lazy(() => import('./pages/SimpleTeacherPage'))
const NewTeachersPage = lazy(() => import('./pages/NewTeachersPage'))
const NewViewTeacherPage = lazy(() => import('./pages/NewViewTeacherPage'))

// Lazy load public pages
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AdmissionsPage = lazy(() => import('./pages/AdmissionsPage'))
const AcademicsPage = lazy(() => import('./pages/AcademicsPage'))
const FacultyPage = lazy(() => import('./pages/FacultyPage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))

// Lazy load upload pages
const UploadDashboardPage = lazy(() => import('./pages/upload/UploadDashboardPage'))
const StudentUploadPage = lazy(() => import('./pages/upload/StudentUploadPage'))
const TeacherUploadPage = lazy(() => import('./pages/upload/TeacherUploadPage'))
const AdminStaffUploadPage = lazy(() => import('./pages/upload/AdminStaffUploadPage'))
const SupportStaffUploadPage = lazy(() => import('./pages/upload/SupportStaffUploadPage'))
const UploadHistoryPage = lazy(() => import('./pages/upload/UploadHistoryPage'))

// Lazy load form components
const AddTeacher = lazy(() => import('./components/teachers/AddTeacher'))
const EditTeacher = lazy(() => import('./components/teachers/EditTeacher'))
const ViewTeacher = lazy(() => import('./components/teachers/ViewTeacher'))
const TeacherProfile = lazy(() => import('./components/teachers/TeacherProfile'))
const TeacherProfileEdit = lazy(() => import('./components/teachers/TeacherProfileEdit'))
const AdminProfileEdit = lazy(() => import('./components/admin/AdminProfileEdit'))
const MeetingForm = lazy(() => import('./components/meetings/MeetingForm'))
const AddStudent = lazy(() => import('./components/students/AddStudent'))
const EditStudent = lazy(() => import('./components/students/EditStudent'))
const ViewStudent = lazy(() => import('./components/students/ViewStudent'))
const AddFee = lazy(() => import('./components/fees/AddFee'))
const ProcessFeePayment = lazy(() => import('./components/fees/ProcessFeePayment'))
const ViewFee = lazy(() => import('./components/fees/ViewFee'))
const FeeReceipt = lazy(() => import('./components/fees/FeeReceipt'))
const FeeStatement = lazy(() => import('./components/fees/FeeStatement'))
const StudentFeeReceipts = lazy(() => import('./components/fees/StudentFeeReceipts'))
const AddSalary = lazy(() => import('./components/salaries/AddSalary'))
const ViewSalary = lazy(() => import('./components/salaries/ViewSalary'))
const EditSalary = lazy(() => import('./components/salaries/EditSalary'))
const ProcessSalaryPayment = lazy(() => import('./components/salaries/ProcessSalaryPayment'))
const AddAdminStaff = lazy(() => import('./components/admin-staff/AddAdminStaff'))
const AddSupportStaff = lazy(() => import('./components/support-staff/AddSupportStaff'))

// Loading component for suspense fallback
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
)

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  // No need for memoized home page content anymore as we're using a dedicated component

  return (
    <Router>
      <NavigationProvider>
        <ContactMessageProvider>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
          {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-temp-password" element={
          <PrivateRoute>
            <TempPasswordReset />
          </PrivateRoute>
        } />
        <Route path="/about" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AboutPage />
          </Suspense>
        } />
        <Route path="/contact" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ContactPage />
          </Suspense>
        } />
        <Route path="/admissions" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdmissionsPage />
          </Suspense>
        } />
        <Route path="/academics" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AcademicsPage />
          </Suspense>
        } />
        <Route path="/faculty" element={
          <Suspense fallback={<LoadingSpinner />}>
            <FacultyPage />
          </Suspense>
        } />
        <Route path="/events" element={
          <Suspense fallback={<LoadingSpinner />}>
            <EventsPage />
          </Suspense>
        } />
        <Route path="/gallery" element={
          <Suspense fallback={<LoadingSpinner />}>
            <GalleryPage />
          </Suspense>
        } />
        {/* <Route path="/public-button-test" element={
          <Suspense fallback={<LoadingSpinner />}>
            <PublicButtonTestPage />
          </Suspense>
        } /> */}

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />

        {/* Pending approvals route removed as it's no longer needed */}

        {/* Lazy-loaded routes */}
        <Route path="/teachers" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <NewTeachersPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/students" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <StudentsPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/attendance" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AttendancePage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/student-attendance" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <StudentAttendancePage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/fees" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <FeesPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/student-fees" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <StudentFeesPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/salaries" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <SalariesPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/support-staff" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <SupportStaffPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/admin-staff" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AdminStaffPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/events-notices" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <EventsNoticesPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Redirect from old notices path to new events-notices path */}
        <Route path="/notices" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <EventsNoticesPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/notifications" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <NotificationsPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/contact-messages" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ContactMessagesPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/meetings" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <MeetingsPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/meetings/new" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <MeetingForm />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/meetings/edit/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <MeetingForm />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* History routes */}
        <Route path="/history" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <HistoryPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/history/:entityType/:entityId" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <HistoryPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* School Settings - Using the revamped version */}
        <Route path="/school-settings" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <SchoolSettingsPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Content Management */}
        <Route path="/content-management" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ContentManagementPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />



        {/* Add form routes */}
        <Route path="/teachers/add" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AddTeacher />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/students/add" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AddStudent />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/fees/add" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AddFee />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/fees/process-payment/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ProcessFeePayment />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/fees/receipt/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <FeeReceipt />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/fees/statement/:studentId" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <FeeStatement />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/fees/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ViewFee />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/salaries/add" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AddSalary />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/salaries/edit/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <EditSalary />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/salaries/process-payment/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ProcessSalaryPayment />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/salaries/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ViewSalary />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/admin-staff/add" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AddAdminStaff />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/support-staff/add" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AddSupportStaff />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Demo page for input field effects */}
        <Route path="/input-demo" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <InputDemoPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Demo page for school theme */}
        <Route path="/theme-demo" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ThemeDemoPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Demo page for floating label inputs */}
        <Route path="/floating-label-demo" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <FloatingLabelDemoPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Teacher detail routes - more specific routes first */}
        <Route path="/teachers/edit/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <EditTeacher />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/teachers/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <NewViewTeacherPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Student detail routes - more specific routes first */}
        <Route path="/students/edit/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <EditStudent />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/students/:id/fee-receipts" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <StudentFeeReceipts />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/students/:id" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ViewStudent />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Profile Routes */}
        <Route path="/profile" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ProfileRouter />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/profile/edit" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ProfileEditRouter />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/user-profile" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <UserProfilePage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Upload Routes */}
        <Route path="/upload" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <UploadDashboardPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/upload/student" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <StudentUploadPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/upload/teacher" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <TeacherUploadPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/upload/admin-staff" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <AdminStaffUploadPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/upload/support-staff" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <SupportStaffUploadPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/upload/history" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <UploadHistoryPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Test route for button functionality - commenting out for now */}
        {/* <Route path="/button-test" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <ButtonTestPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />

        {/* Simple teacher page for testing */}
        <Route path="/simple-teachers" element={
          <PrivateRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <SimpleTeacherPage />
              </Suspense>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
          <PerformanceDebugger />
        </ContactMessageProvider>
      </NavigationProvider>
    </Router>
  )
}

export default App
