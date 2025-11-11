import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import './debug.css' // Temporary debug CSS
import './form-fixes.css' // CSS fixes for form inputs
import './input-glow.css' // Glowing input field effect
import './school-theme.css' // School theme based on AI Based School Tando Jam
import './dark-theme.css' // Dark theme styles
import './dashboard-dark.css' // Enhanced dashboard dark theme
import './auth-dark.css' // Enhanced auth forms dark theme
import './global-dark.css' // Global dark theme for all pages
import './light-theme-animations.css' // Light theme animations to match dark mode
import './floating-label.css' // Floating label effect for input fields
import './modal-fixes.css' // CSS fixes for modal display
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { PublicDataProvider } from './context/PublicDataContext'
import { queryClient } from './config/queryClient'
import './config/axios'  // Import axios configuration

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PublicDataProvider>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
          </PublicDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
