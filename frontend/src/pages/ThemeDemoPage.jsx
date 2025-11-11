import { useState } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import PasswordInput from '../components/common/PasswordInput';

const ThemeDemoPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="school-content mb-8">
          <h1 className="school-heading text-3xl">AI Based School Theme</h1>
          <p className="school-text mb-6">
            This page demonstrates the custom theme elements based on the AI Based School Tando Jam logo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="school-heading text-xl mb-4">Color Palette</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-school-yellow text-school-navy-dark rounded-md">Yellow</div>
                <div className="p-4 bg-school-orange text-white rounded-md">Orange</div>
                <div className="p-4 bg-school-navy text-white rounded-md">Navy</div>
                <div className="p-4 bg-school-purple text-white rounded-md">Purple</div>
                <div className="p-4 bg-school-gray text-school-navy-dark rounded-md">Gray</div>
                <div className="p-4 bg-white text-school-navy-dark rounded-md border">White</div>
              </div>
            </div>

            <div>
              <h2 className="school-heading text-xl mb-4">Typography</h2>
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-school-navy-dark">Heading 1</h1>
                  <h2 className="text-2xl font-bold text-school-navy-dark">Heading 2</h2>
                  <h3 className="text-xl font-bold text-school-navy-dark">Heading 3</h3>
                  <h4 className="text-lg font-bold text-school-navy-dark">Heading 4</h4>
                  <h5 className="text-base font-bold text-school-navy-dark">Heading 5</h5>
                  <h6 className="text-sm font-bold text-school-navy-dark">Heading 6</h6>
                </div>
                <p className="text-school-navy-dark">
                  Regular paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
                <p className="text-sm text-gray-600">
                  Small text for secondary information.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="school-heading text-xl mb-4">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="primary" size="sm">Small Button</Button>
              <Button variant="primary" size="lg">Large Button</Button>
              <Button variant="primary" disabled>Disabled Button</Button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="school-heading text-xl mb-4">Form Elements</h2>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-school-navy-dark mb-2">Standard Inputs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="name"
                  name="name"
                  label="Name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />

                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-school-navy-dark mb-2">Floating Label Inputs</h3>
              <p className="text-sm text-gray-600 mb-4">
                These inputs use the floating label effect where the placeholder moves up when focused.
                <a href="/floating-label-demo" className="text-green-500 ml-2 hover:underline">
                  See full demo →
                </a>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="floatingName"
                  name="floatingName"
                  label="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  floating={true}
                />

                <Input
                  id="floatingEmail"
                  name="floatingEmail"
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  floating={true}
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-school-navy-dark mb-2">Other Form Elements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PasswordInput
                  id="password"
                  name="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />

              <div className="school-input-group">
                <label htmlFor="select" className="school-input-label">
                  Select Option
                </label>
                <select
                  id="select"
                  name="select"
                  className="school-input"
                >
                  <option value="">Select an option</option>
                  <option value="option1">Option 1</option>
                  <option value="option2">Option 2</option>
                  <option value="option3">Option 3</option>
                </select>
              </div>

              <div className="school-input-group md:col-span-2">
                <label htmlFor="message" className="school-input-label">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="school-input"
                  placeholder="Enter your message"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="school-heading text-xl mb-4">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="school-card">
                <div className="school-card-header">
                  <h3 className="font-medium">Card Title</h3>
                </div>
                <div className="school-card-body">
                  <p className="text-sm">This is a sample card with header and footer.</p>
                </div>
                <div className="school-card-footer">
                  <Button variant="primary" size="sm">Action</Button>
                </div>
              </div>

              <div className="school-card">
                <div className="school-card-body">
                  <h3 className="font-medium mb-2">Simple Card</h3>
                  <p className="text-sm">This is a simple card without header or footer.</p>
                </div>
              </div>

              <div className="school-card">
                <div className="school-card-header">
                  <h3 className="font-medium">Information Card</h3>
                </div>
                <div className="school-card-body">
                  <p className="text-sm mb-4">This card contains some information with badges.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="school-badge school-badge-yellow">Badge 1</span>
                    <span className="school-badge school-badge-orange">Badge 2</span>
                    <span className="school-badge school-badge-navy">Badge 3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="school-heading text-xl mb-4">Alerts</h2>
            <div className="space-y-4">
              <div className="school-alert school-alert-success">
                <p>This is a success alert message.</p>
              </div>
              <div className="school-alert school-alert-warning">
                <p>This is a warning alert message.</p>
              </div>
              <div className="school-alert school-alert-error">
                <p>This is an error alert message.</p>
              </div>
              <div className="school-alert school-alert-info">
                <p>This is an information alert message.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ThemeDemoPage;
