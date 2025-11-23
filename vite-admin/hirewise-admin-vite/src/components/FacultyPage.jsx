import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FacultyPage = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const facultyMembers = [
    { id: 1, name: 'Kiran Sharma', email: 'kiran.sharma@bmu.edu.in' },
    { id: 2, name: 'Ziya Khan', email: 'ziya.khan@bmu.edu.in' }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    const faculty = facultyMembers.find(f => f.email.toLowerCase() === email.toLowerCase());
    
    if (faculty) {
      // Navigate to faculty portal with faculty info
      navigate('/faculty-portal/dashboard', { state: { facultyInfo: faculty } });
    } else {
      alert('Email not found. Please use a valid faculty email (e.g., kiran.sharma@bmu.edu.in)');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Portal</h1>
          <p className="text-gray-600">Enter your email to access assigned candidates</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Faculty Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kiran.sharma@bmu.edu.in"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Access Portal
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Demo emails: kiran.sharma@bmu.edu.in or ziya.khan@bmu.edu.in
          </p>
        </div>
      </div>
    </div>
  );
};

export default FacultyPage;
