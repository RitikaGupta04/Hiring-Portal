import React, { useState } from 'react';

const FacultyPage = () => {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [assignedCandidates, setAssignedCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const facultyMembers = [
    { id: 1, name: 'Kiran Sharma', email: 'kiran.sharma@bmu.edu.in' },
    { id: 2, name: 'Ziya Khan', email: 'ziya.khan@bmu.edu.in' }
  ];

  // Mock assigned candidates data
  const mockAssignments = {
    'kiran.sharma@bmu.edu.in': [
      {
        id: 1,
        first_name: 'Bottle',
        last_name: 'Test',
        email: 'bottle@gmail.com',
        position: 'Teaching',
        department: 'Management',
        experience: '5 years',
        publications: 11,
        scopus_general_papers: 5,
        conference_papers: 5,
        edited_books: 6,
        status: 'pending'
      }
    ],
    'ziya.khan@bmu.edu.in': []
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const faculty = facultyMembers.find(f => f.email.toLowerCase() === email.toLowerCase());
    
    if (faculty) {
      setFacultyInfo(faculty);
      setIsLoggedIn(true);
      setAssignedCandidates(mockAssignments[email.toLowerCase()] || []);
    } else {
      alert('Email not found. Please use a valid faculty email (e.g., kiran.sharma@bmu.edu.in)');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setFacultyInfo(null);
    setAssignedCandidates([]);
    setSelectedCandidate(null);
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const closeModal = () => {
    setSelectedCandidate(null);
  };

  if (!isLoggedIn) {
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
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {facultyInfo.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Assigned Candidates ({assignedCandidates.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {assignedCandidates.length > 0 ? (
              assignedCandidates.map((candidate, index) => (
                <div key={candidate.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-blue-600">#{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {candidate.first_name} {candidate.last_name}
                          </h3>
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            {candidate.department}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{candidate.position}</p>
                        <p className="text-sm text-gray-500">{candidate.email}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-600">{candidate.experience}</span>
                          <span className="text-sm text-gray-600">{candidate.publications} publications</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleViewDetails(candidate)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Candidates</h3>
                <p className="text-gray-600">You don't have any candidates assigned to review yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCandidate.first_name} {selectedCandidate.last_name}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-gray-600">{selectedCandidate.position}</p>
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {selectedCandidate.department}
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCandidate.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCandidate.experience}</p>
                    </div>
                  </div>
                </div>

                {/* Research Metrics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Research Metrics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedCandidate.scopus_general_papers || 0}</p>
                      <p className="text-sm text-gray-600">Scopus Papers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedCandidate.conference_papers || 0}</p>
                      <p className="text-sm text-gray-600">Conference Papers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{selectedCandidate.edited_books || 0}</p>
                      <p className="text-sm text-gray-600">Edited Books</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Status</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                      {selectedCandidate.status || 'Pending Review'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-6 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => alert('Review functionality coming soon')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Add Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyPage;
