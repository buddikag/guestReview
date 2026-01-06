import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import MainNavigation from './MainNavigation';
import './UserManagement.css';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'staff',
    hotelIds: [],
  });

  const API_URL = import.meta.env.VITE_API_URL + 'api';

  useEffect(() => {
    fetchUsers();
    fetchHotels();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await axios.get(`${API_URL}/hotels`);
      setHotels(response.data);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };

  const handleOpenModal = async (user = null) => {
    if (user) {
      // Fetch full user details with hotels
      try {
        const response = await axios.get(`${API_URL}/users/${user.id}`);
        const userData = response.data;
        setEditingUser(userData);
        setFormData({
          username: userData.username,
          email: userData.email,
          password: '',
          full_name: userData.full_name,
          role: userData.role,
          hotelIds: userData.hotels ? userData.hotels.map(h => h.id) : [],
        });
      } catch (error) {
        console.error('Error fetching user details:', error);
        // Fallback to basic user data
        setEditingUser(user);
        setFormData({
          username: user.username,
          email: user.email,
          password: '',
          full_name: user.full_name,
          role: user.role,
          hotelIds: [],
        });
      }
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        role: 'staff',
        hotelIds: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      full_name: '',
      role: 'staff',
      hotelIds: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = { ...formData };
      if (editingUser && !data.password) {
        delete data.password;
      }

      if (editingUser) {
        await axios.put(`${API_URL}/users/${editingUser.id}`, data);
        alert('User updated successfully');
      } else {
        if (!data.password) {
          alert('Password is required for new users');
          return;
        }
        await axios.post(`${API_URL}/users`, data);
        alert('User created successfully');
      }
      
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.Message || 'Failed to save user');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/users/${userId}`);
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.Message || 'Failed to delete user');
    }
  };

  const toggleHotel = (hotelId) => {
    setFormData(prev => ({
      ...prev,
      hotelIds: prev.hotelIds.includes(hotelId)
        ? prev.hotelIds.filter(id => id !== hotelId)
        : [...prev.hotelIds, hotelId],
    }));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <MainNavigation />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>User Management</h2>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            Add New User
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Hotels</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.full_name}</td>
                  <td>
                    <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.hotels || 'N/A'}</td>
                  <td>
                    <span className={`badge ${user.status === 1 ? 'bg-success' : 'bg-secondary'}`}>
                      {user.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleOpenModal(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(user.id)}
                      disabled={user.id === currentUser?.id}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Username</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Password {editingUser && '(leave blank to keep current)'}</label>
                        <input
                          type="password"
                          className="form-control"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required={!editingUser}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                      >
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Hotels</label>
                      <div className="hotel-checkboxes">
                        {hotels.map((hotel) => (
                          <div key={hotel.id} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.hotelIds.includes(hotel.id)}
                              onChange={() => toggleHotel(hotel.id)}
                              id={`hotel-${hotel.id}`}
                            />
                            <label className="form-check-label" htmlFor={`hotel-${hotel.id}`}>
                              {hotel.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingUser ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'super_admin':
      return 'bg-danger';
    case 'admin':
      return 'bg-warning';
    case 'manager':
      return 'bg-info';
    case 'staff':
      return 'bg-secondary';
    default:
      return 'bg-secondary';
  }
};

export default UserManagement;

