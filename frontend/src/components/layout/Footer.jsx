import { Link } from 'react-router-dom';
import { useContext } from 'react';
import PublicDataContext from '../../context/PublicDataContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { schoolSettings } = useContext(PublicDataContext);

  return (
    <footer className="school-footer relative z-0 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="school-footer-heading">{schoolSettings?.schoolName || 'AI Based School'}</h3>
            <p className="text-gray-300 text-sm">
              {schoolSettings?.footer?.schoolDescription || 'A comprehensive solution for managing school operations, including student and teacher management, attendance tracking, fee collection, and more.'}
            </p>
          </div>

          <div>
            <h3 className="school-footer-heading">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="school-footer-link">Home</Link>
              </li>
              <li>
                <Link to="/dashboard" className="school-footer-link">Dashboard</Link>
              </li>
              <li>
                <Link to="/teachers" className="school-footer-link">Teachers</Link>
              </li>
              <li>
                <Link to="/students" className="school-footer-link">Students</Link>
              </li>
              <li>
                <Link to="/attendance" className="school-footer-link">Attendance</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="school-footer-heading">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-school-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{schoolSettings?.phone || '+92 (123) 456-7890'}</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-school-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{schoolSettings?.email || 'info@cbhstj.edu'}</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-school-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  {schoolSettings?.address ?
                    `${schoolSettings.address.city}, ${schoolSettings.address.state}, ${schoolSettings.address.country}` :
                    'Tando Jam, Sindh, Pakistan'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-school-navy-light text-sm text-gray-400 text-center relative">
          <p>&copy; {currentYear} {schoolSettings?.schoolName || 'AI Based School'} {schoolSettings?.footer?.copyrightText || 'All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
