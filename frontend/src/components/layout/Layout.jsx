import { useContext, memo } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import AuthContext from '../../context/AuthContext';
import PasswordResetChecker from '../routing/PasswordResetChecker';

// Memoize the Layout component to prevent unnecessary re-renders
const Layout = memo(({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <div className="flex flex-grow relative">
        {isAuthenticated && <Sidebar />}
        <main className="flex-grow w-full overflow-y-auto relative z-10">
          <PasswordResetChecker>
            {children}
          </PasswordResetChecker>
        </main>
      </div>
      <Footer />
    </div>
  );
});

export default Layout;
