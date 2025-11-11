import { useState } from 'react';
import FloatingLabelInput from '../components/common/FloatingLabelInput';

const FloatingLabelDemoPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form submitted with data: ' + JSON.stringify(formData, null, 2));
  };

  return (
    <div className="py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Floating Label Input Demo</h1>
            
            <div className="mb-8">
              <p className="text-gray-600 mb-4">
                This demo showcases the floating label input effect. When you click on an input field, 
                the placeholder text animates upward and becomes a label, allowing you to see what information 
                is required while you type.
              </p>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 p-4 border border-gray-300 rounded-md">
                  <p className="text-sm text-gray-500 mb-2">Before Focus:</p>
                  <div className="h-12 border border-gray-300 rounded-md flex items-center px-4">
                    <span className="text-gray-500">Enter your name</span>
                  </div>
                </div>
                
                <div className="flex-1 p-4 border border-gray-300 rounded-md">
                  <p className="text-sm text-gray-500 mb-2">After Focus:</p>
                  <div className="h-12 border border-green-500 rounded-md relative flex items-center px-4">
                    <span className="absolute -top-2.5 left-4 text-sm text-green-500 bg-white px-1">Enter your name</span>
                    <span className="text-gray-900">John Doe</span>
                  </div>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <FloatingLabelInput
                  id="name"
                  name="name"
                  type="text"
                  label="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                
                <FloatingLabelInput
                  id="email"
                  name="email"
                  type="email"
                  label="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <FloatingLabelInput
                  id="password"
                  name="password"
                  type="password"
                  label="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                
                <FloatingLabelInput
                  id="phone"
                  name="phone"
                  type="tel"
                  label="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <FloatingLabelInput
                id="address"
                name="address"
                type="text"
                label="Enter your address"
                value={formData.address}
                onChange={handleChange}
              />
              
              <div className="floating-input-container">
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                  placeholder=" "
                />
                <label 
                  htmlFor="message"
                  className="absolute left-4 transition-all duration-200 pointer-events-none text-gray-500 top-3 peer-focus:text-sm peer-focus:text-green-500 peer-focus:-top-2.5 peer-focus:bg-white peer-focus:px-1 peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-green-500 peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
                >
                  Enter your message
                </label>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingLabelDemoPage;
