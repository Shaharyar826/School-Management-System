import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ProfileAvatarImage from '../components/common/ProfileAvatarImage';
import TeacherSearch from '../components/admin/TeacherSearch';
import { useTeachers, useDeleteTeacher } from '../hooks/useTeachers';

const TeachersPage = () => {
  const { user } = useContext(AuthContext);
  
  // React Query hooks
  const { data: teachers = [], isLoading: loading, error: queryError } = useTeachers();
  const deleteTeacherMutation = useDeleteTeacher();

  // Convert query error to string for existing error handling
  const error = queryError?.response?.data?.message || (queryError ? 'Failed to load teachers' : '');

  // Handle teacher deletion with React Query
  const handleDeleteTeacher = (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      deleteTeacherMutation.mutate(teacherId);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Teacher Management</h1>
          {user && (user.role === 'admin' || user.role === 'principal') && (
            <Link
              to="/teachers/add"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Teacher
            </Link>
          )}
        </div>

        <TeacherSearch />

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : teachers.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                No teachers found
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <li key={teacher._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                            <ProfileAvatarImage
                              profileImage={teacher.user?.profileImage}
                              name={teacher.user?.name}
                              fallbackLetter={teacher.user?.name?.charAt(0) || 'T'}
                              bgColor="bg-green-500"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{teacher.user?.name}</div>
                            <div className="text-sm text-gray-500">Employee ID: {teacher.employeeId}</div>
                            <div className="text-sm text-gray-500">
                              Subjects: {teacher.subjects?.join(', ')}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/teachers/${teacher._id}`}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View Details
                          </Link>
                          {user && (user.role === 'admin' || user.role === 'principal') && (
                            <>
                              <Link
                                to={`/teachers/edit/${teacher._id}`}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteTeacher(teacher._id)}
                                disabled={deleteTeacherMutation.isPending}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                              >
                                {deleteTeacherMutation.isPending ? 'Deleting...' : 'Delete'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachersPage;
