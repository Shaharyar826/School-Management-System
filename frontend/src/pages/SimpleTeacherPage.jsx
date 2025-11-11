import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const SimpleTeacherPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/teachers');

      if (res.data.success) {
        setTeachers(res.data.data);
        console.log('Teachers loaded:', res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch teachers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id) => {
    console.log('View button clicked for teacher:', id);
    setMessage(`View button clicked for teacher: ${id}`);
    // navigate(`/teachers/${id}`);
  };

  const handleEdit = (id) => {
    console.log('Edit button clicked for teacher:', id);
    setMessage(`Edit button clicked for teacher: ${id}`);
    // navigate(`/teachers/edit/${id}`);
  };

  const handleDelete = (id, name) => {
    console.log('Delete button clicked for teacher:', id);
    setMessage(`Delete button clicked for teacher: ${id} (${name})`);
    
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      console.log('Delete confirmed for teacher:', id);
      setMessage(`Delete confirmed for teacher: ${id} (${name})`);
      
      // Uncomment to actually delete
      // deleteTeacher(id);
    }
  };

  const deleteTeacher = async (id) => {
    try {
      await axios.delete(`/api/teachers/${id}`);
      setMessage(`Teacher deleted successfully`);
      fetchTeachers();
    } catch (err) {
      setError(`Failed to delete teacher: ${err.response?.data?.message || err.message}`);
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Simple Teacher Management</h1>
      
      {message && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-700">{message}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher._id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{teacher.user?.name || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{teacher.user?.email || 'N/A'}</td>
                <td className="py-2 px-4 border-b">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(teacher._id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                    >
                      View
                    </button>
                    
                    {user && ['admin', 'principal'].includes(user.role) && (
                      <>
                        <button
                          onClick={() => handleEdit(teacher._id)}
                          className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                        >
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleDelete(teacher._id, teacher.user?.name)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimpleTeacherPage;
