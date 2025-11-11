import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormInput from '../common/FormInput';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    favoriteColor: '',
    birthCity: '',
    petName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { email, favoriteColor, birthCity, petName } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('/api/password-reset/request', {
        email,
        securityAnswers: {
          favoriteColor,
          birthCity,
          petName
        }
      });

      if (res.data.success) {
        setSuccess(res.data.message || 'Password reset request submitted successfully. Please contact your administrator.');
        
        // Clear form
        setFormData({
          email: '',
          favoriteColor: '',
          birthCity: '',
          petName: ''
        });

        // Redirect to login after 5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit password reset request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Forgot Password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide your email and answer the security questions
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <FormInput
              id="email"
              name="email"
              type="email"
              label="Email address"
              autoComplete="email"
              required
              value={email}
              onChange={onChange}
              className="z-10"
            />

            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Security Questions</h3>
              <div className="space-y-4">
                <FormInput
                  id="favoriteColor"
                  name="favoriteColor"
                  type="text"
                  label="What is your favorite color?"
                  required
                  value={favoriteColor}
                  onChange={onChange}
                />

                <FormInput
                  id="birthCity"
                  name="birthCity"
                  type="text"
                  label="In which city were you born?"
                  required
                  value={birthCity}
                  onChange={onChange}
                />

                <FormInput
                  id="petName"
                  name="petName"
                  type="text"
                  label="What was the name of your first pet?"
                  required
                  value={petName}
                  onChange={onChange}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-school-navy hover:bg-school-navy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-school-yellow"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Back to login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
