import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import MainNavigation from './MainNavigation';
import './HotelManagement.css';

const HotelManagement = () => {
  const { user: currentUser } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    status: 1,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [selectedHotelForToken, setSelectedHotelForToken] = useState(null);
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedHotelForSettings, setSelectedHotelForSettings] = useState(null);
  const [smtpData, setSmtpData] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_secure: false,
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    from_name: ''
  });
  const [templateData, setTemplateData] = useState({
    subject: 'Thank you for your stay - Please share your feedback',
    body_html: '',
    body_text: ''
  });
  const apiUrl_for_uploads = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
  const API_URL = import.meta.env.VITE_API_URL + 'api';

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await axios.get(`${API_URL}/hotels`);
      setHotels(response.data);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      alert('Failed to fetch hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (hotel = null) => {
    if (hotel) {
      setEditingHotel(hotel);
      setFormData({
        name: hotel.name || '',
        address: hotel.address || '',
        phone: hotel.phone || '',
        email: hotel.email || '',
        status: hotel.status !== undefined ? hotel.status : 1,
      });
      setLogoPreview(hotel.logo_path ? `${hotel.logo_path}` : null);
      setLogoFile(null);
    } else {
      setEditingHotel(null);
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        status: 1,
      });
      setLogoPreview(null);
      setLogoFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHotel(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      status: 1,
    });
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image/(png|jpeg|jpg)')) {
        alert('Please select a PNG or JPG image');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setLogoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('phone', formData.phone || '');
      formDataToSend.append('email', formData.email || '');
      formDataToSend.append('status', formData.status);
      
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }
      
      if (editingHotel) {
        await axios.put(`${API_URL}/hotels/${editingHotel.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Hotel updated successfully');
      } else {
        await axios.post(`${API_URL}/hotels`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Hotel created successfully');
      }
      
      handleCloseModal();
      fetchHotels();
    } catch (error) {
      console.error('Error saving hotel:', error);
      alert(error.response?.data?.Message || 'Failed to save hotel');
    }
  };

  const handleDelete = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel? This will also affect all associated users and guests.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/hotels/${hotelId}`);
      alert('Hotel deleted successfully');
      fetchHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert(error.response?.data?.Message || 'Failed to delete hotel');
    }
  };

  const handleGenerateToken = async (hotel) => {
    setSelectedHotelForToken(hotel);
    setGeneratingToken(true);
    setTokenData(null);

    try {
      const token = localStorage.getItem('token');
      // Use the base API URL without /api for simplewtstar routes
      const baseApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
      const response = await axios.post(
        `${baseApiUrl}/simplewtstar/generateWidgetToken`,
        {
          hotelId: hotel.id
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setTokenData(response.data);
      setShowTokenModal(true);
    } catch (error) {
      console.error('Error generating token:', error);
      alert(error.response?.data?.Message || 'Failed to generate widget token');
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleCloseTokenModal = () => {
    setShowTokenModal(false);
    setTokenData(null);
    setSelectedHotelForToken(null);
  };

  const handleCopyToken = () => {
    if (tokenData?.token) {
      navigator.clipboard.writeText(tokenData.token);
      alert('Token copied to clipboard!');
    }
  };

  const handleCopyWidgetUrl = () => {
    if (tokenData?.token) {
      const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
      const widgetUrl = `${apiUrl}/simplewtstar/hotel-token/${tokenData.token}`;
      navigator.clipboard.writeText(widgetUrl);
      alert('Widget URL copied to clipboard!');
    }
  };

  const handleOpenSmtpModal = async (hotel) => {
    setSelectedHotelForSettings(hotel);
    try {
      const response = await axios.get(`${API_URL}/email/smtp/${hotel.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data) {
        setSmtpData({
          smtp_host: response.data.smtp_host || '',
          smtp_port: response.data.smtp_port || 587,
          smtp_secure: response.data.smtp_secure === 1 || response.data.smtp_secure === true,
          smtp_user: response.data.smtp_user || '',
          smtp_password: '', // Don't show existing password
          from_email: response.data.from_email || '',
          from_name: response.data.from_name || ''
        });
      } else {
        setSmtpData({
          smtp_host: '',
          smtp_port: 587,
          smtp_secure: false,
          smtp_user: '',
          smtp_password: '',
          from_email: hotel.email || '',
          from_name: hotel.name || ''
        });
      }
    } catch (error) {
      console.error('Error fetching SMTP settings:', error);
      setSmtpData({
        smtp_host: '',
        smtp_port: 587,
        smtp_secure: false,
        smtp_user: '',
        smtp_password: '',
        from_email: hotel.email || '',
        from_name: hotel.name || ''
      });
    }
    setShowSmtpModal(true);
  };

  const handleCloseSmtpModal = () => {
    setShowSmtpModal(false);
    setSelectedHotelForSettings(null);
    setSmtpData({
      smtp_host: '',
      smtp_port: 587,
      smtp_secure: false,
      smtp_user: '',
      smtp_password: '',
      from_email: '',
      from_name: ''
    });
  };

  const handleSaveSmtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/email/smtp/${selectedHotelForSettings.id}`,
        smtpData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('SMTP settings saved successfully!');
      handleCloseSmtpModal();
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      alert(error.response?.data?.Message || 'Failed to save SMTP settings');
    }
  };

  const handleOpenTemplateModal = async (hotel) => {
    setSelectedHotelForSettings(hotel);
    try {
      const response = await axios.get(`${API_URL}/email/template/${hotel.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data) {
        setTemplateData({
          subject: response.data.subject || '',
          body_html: response.data.body_html || '',
          body_text: response.data.body_text || ''
        });
      } else {
        // Default template
        setTemplateData({
          subject: 'Thank you for your stay - Please share your feedback',
          body_html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="{{base_url}}/uploads/{{hotel_logo}}" alt="{{hotel_name}}" style="max-width: 200px; height: auto;">
            </div>
            <h2 style="color: #333;">Dear {{guest_name}},</h2>
            <p>Thank you for staying at <strong>{{hotel_name}}</strong>!</p>
            <p>We hope you enjoyed your stay. Your feedback is very important to us and helps us improve our services.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="{{feedback_link}}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Share Your Feedback</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">{{feedback_link}}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              <strong>{{hotel_name}}</strong><br>
              {{hotel_address}}<br>
              Phone: {{hotel_phone}}<br>
              Email: {{hotel_email}}
            </p>
          </div>`,
          body_text: `Dear {{guest_name}},\n\nThank you for staying at {{hotel_name}}!\n\nWe hope you enjoyed your stay. Your feedback is very important to us.\n\nPlease share your feedback by clicking this link:\n{{feedback_link}}\n\nBest regards,\n{{hotel_name}}`
        });
      }
    } catch (error) {
      console.error('Error fetching email template:', error);
      // Use default template
      setTemplateData({
        subject: 'Thank you for your stay - Please share your feedback',
        body_html: '',
        body_text: ''
      });
    }
    setShowTemplateModal(true);
  };

  const handleCloseTemplateModal = () => {
    setShowTemplateModal(false);
    setSelectedHotelForSettings(null);
    setTemplateData({
      subject: '',
      body_html: '',
      body_text: ''
    });
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/email/template/${selectedHotelForSettings.id}`,
        templateData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('Email template saved successfully!');
      handleCloseTemplateModal();
    } catch (error) {
      console.error('Error saving email template:', error);
      alert(error.response?.data?.Message || 'Failed to save email template');
    }
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
          <h2>Hotel Management</h2>
          <button 
            className="btn btn-primary" 
            onClick={() => handleOpenModal()}
            style={{ width: 'fit-content', whiteSpace: 'nowrap' }}
          >
            Add New Hotel
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Logo</th>
                <th>Name</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((hotel) => (
                <tr key={hotel.id}>
                  <td>{hotel.id}</td>
                  <td>
                    {hotel.logo_path ? (
                      <img 
                        src={`${apiUrl_for_uploads}${hotel.logo_path}`} 
                        alt={hotel.name}
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    ) : (
                      <span className="text-muted">No logo</span>
                    )}
                  </td>
                  <td>{hotel.name}</td>
                  <td>{hotel.address || 'N/A'}</td>
                  <td>{hotel.phone || 'N/A'}</td>
                  <td>{hotel.email || 'N/A'}</td>
                  <td>
                    <span className={`badge ${hotel.status === 1 ? 'bg-success' : 'bg-secondary'}`}>
                      {hotel.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{hotel.created_at ? new Date(hotel.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleOpenModal(hotel)}
                        title="Edit Hotel"
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleGenerateToken(hotel)}
                        disabled={generatingToken}
                        title="Generate Widget Token"
                      >
                        {generatingToken && selectedHotelForToken?.id === hotel.id ? (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : (
                          'Token'
                        )}
                      </button>
                      <button
                        className="btn btn-info"
                        onClick={() => handleOpenSmtpModal(hotel)}
                        title="SMTP Settings"
                        style={{ backgroundColor: '#17a2b8', borderColor: '#17a2b8', color: 'white' }}
                      >
                        SMTP
                      </button>
                      <button
                        className="btn btn-warning"
                        onClick={() => handleOpenTemplateModal(hotel)}
                        title="Email Template"
                        style={{ backgroundColor: '#ffc107', borderColor: '#ffc107', color: 'black' }}
                      >
                        Template
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleDelete(hotel.id)}
                        title="Delete Hotel"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {hotels.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center">
                    No hotels found. Create your first hotel!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Hotel Name <span style={{ color: 'red' }}>*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                        >
                          <option value={1}>Active</option>
                          <option value={0}>Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Hotel Logo (PNG or JPG, max 5MB)</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleLogoChange}
                      />
                      {logoPreview && (
                        <div className="mt-2">
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            style={{ 
                              maxWidth: '200px', 
                              maxHeight: '200px', 
                              objectFit: 'contain',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              padding: '5px'
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter hotel address"
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingHotel ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Token Modal */}
        {showTokenModal && tokenData && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-info text-white">
                  <h5 className="modal-title">
                    🔑 Widget Token Generated
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={handleCloseTokenModal}></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <strong>Hotel:</strong> {tokenData.hotelName} (ID: {tokenData.hotelId})<br />
                    <strong>Expires:</strong> {new Date(tokenData.expiresAt).toLocaleDateString()} ({tokenData.expiresIn})
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Widget Token:</label>
                    <div className="input-group">
                      <textarea
                        className="form-control font-monospace"
                        rows="4"
                        readOnly
                        value={tokenData.token}
                        style={{ fontSize: '0.85rem' }}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={handleCopyToken}
                        title="Copy Token"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <small className="text-muted">Use this token in your widget to fetch reviews for this hotel</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Widget API URL:</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control font-monospace"
                        readOnly
                        value={`${apiUrl_for_uploads}/simplewtstar/hotel-token/${tokenData.token}`}
                        style={{ fontSize: '0.85rem' }}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={handleCopyWidgetUrl}
                        title="Copy Widget URL"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <small className="text-muted">Direct API endpoint with token</small>
                  </div>

                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="card-title">How to use in your widget:</h6>
                      <pre className="bg-dark text-light p-3 rounded" style={{ fontSize: '0.8rem', overflowX: 'auto' }}>
{`// JavaScript example
const token = '${tokenData.token}';
const apiUrl = '${apiUrl_for_uploads}';

fetch(\`\${apiUrl}/simplewtstar/hotel-token/\${token}?page=1&limit=10\`)
  .then(response => response.json())
  .then(data => {
    console.log('Reviews:', data.data);
    // Display reviews in your widget
  });`}
                      </pre>
                    </div>
                  </div>

                  <div className="alert alert-warning mt-3">
                    ⚠️ <strong>Important:</strong>
                    <ul className="mb-0 mt-2">
                      <li>Keep this token secure - anyone with the token can access reviews for this hotel</li>
                      <li>Token expires in 1 year - you'll need to generate a new one after expiration</li>
                      <li>If token is compromised, generate a new one immediately</li>
                    </ul>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseTokenModal}>
                    Close
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleCopyToken}>
                    📋 Copy Token
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SMTP Settings Modal */}
        {showSmtpModal && selectedHotelForSettings && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-info text-white">
                  <h5 className="modal-title">SMTP Settings - {selectedHotelForSettings.name}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={handleCloseSmtpModal}></button>
                </div>
                <form onSubmit={handleSaveSmtp}>
                  <div className="modal-body">
                    <div className="alert alert-info">
                      <small>Configure SMTP settings for sending feedback emails. Common settings:<br />
                      Gmail: smtp.gmail.com:587 (STARTTLS)<br />
                      Outlook: smtp-mail.outlook.com:587 (STARTTLS)<br />
                      Custom: Check with your email provider</small>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">SMTP Host <span style={{ color: 'red' }}>*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          value={smtpData.smtp_host}
                          onChange={(e) => setSmtpData({ ...smtpData, smtp_host: e.target.value })}
                          placeholder="smtp.gmail.com"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">SMTP Port <span style={{ color: 'red' }}>*</span></label>
                        <input
                          type="number"
                          className="form-control"
                          value={smtpData.smtp_port}
                          onChange={(e) => setSmtpData({ ...smtpData, smtp_port: parseInt(e.target.value) })}
                          placeholder="587"
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={smtpData.smtp_secure}
                          onChange={(e) => setSmtpData({ ...smtpData, smtp_secure: e.target.checked })}
                          id="smtpSecure"
                        />
                        <label className="form-check-label" htmlFor="smtpSecure">
                          Use SSL/TLS (usually checked for port 465, unchecked for port 587 with STARTTLS)
                        </label>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">SMTP Username <span style={{ color: 'red' }}>*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          value={smtpData.smtp_user}
                          onChange={(e) => setSmtpData({ ...smtpData, smtp_user: e.target.value })}
                          placeholder="your-email@gmail.com"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">SMTP Password <span style={{ color: 'red' }}>*</span></label>
                        <input
                          type="password"
                          className="form-control"
                          value={smtpData.smtp_password}
                          onChange={(e) => setSmtpData({ ...smtpData, smtp_password: e.target.value })}
                          placeholder="Enter password or app password"
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">From Email <span style={{ color: 'red' }}>*</span></label>
                        <input
                          type="email"
                          className="form-control"
                          value={smtpData.from_email}
                          onChange={(e) => setSmtpData({ ...smtpData, from_email: e.target.value })}
                          placeholder="noreply@hotel.com"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">From Name <span style={{ color: 'red' }}>*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          value={smtpData.from_name}
                          onChange={(e) => setSmtpData({ ...smtpData, from_name: e.target.value })}
                          placeholder="Hotel Name"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseSmtpModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save SMTP Settings
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Email Template Modal */}
        {showTemplateModal && selectedHotelForSettings && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">Email Template - {selectedHotelForSettings.name}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseTemplateModal}></button>
                </div>
                <form onSubmit={handleSaveTemplate}>
                  <div className="modal-body">
                    <div className="alert alert-info">
                      <small>
                        <strong>Available Variables:</strong>{' '}
                        {'{'} {'{'}'guest_name'{'}'} {'}'}, {'{'} {'{'}'hotel_name'{'}'} {'}'}, {'{'} {'{'}'feedback_link'{'}'} {'}'}, {'{'} {'{'}'hotel_address'{'}'} {'}'}, {'{'} {'{'}'hotel_phone'{'}'} {'}'}, {'{'} {'{'}'hotel_email'{'}'} {'}'}, {'{'} {'{'}'room_number'{'}'} {'}'}, {'{'} {'{'}'check_in_date'{'}'} {'}'}, {'{'} {'{'}'check_out_date'{'}'} {'}'}, {'{'} {'{'}'base_url'{'}'} {'}'}
                      </small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email Subject <span style={{ color: 'red' }}>*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={templateData.subject}
                        onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
                        placeholder="Thank you for your stay - Please share your feedback"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">HTML Body <span style={{ color: 'red' }}>*</span></label>
                      <textarea
                        className="form-control"
                        rows="15"
                        value={templateData.body_html}
                        onChange={(e) => setTemplateData({ ...templateData, body_html: e.target.value })}
                        placeholder="Enter HTML email template..."
                        required
                      />
                      <small className="form-text text-muted">Use HTML to format your email. Include {'{'} {'{'}'feedback_link'{'}'} {'}'} for the feedback button/link.</small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Plain Text Body (Optional)</label>
                      <textarea
                        className="form-control"
                        rows="8"
                        value={templateData.body_text}
                        onChange={(e) => setTemplateData({ ...templateData, body_text: e.target.value })}
                        placeholder="Enter plain text email template (for email clients that don't support HTML)..."
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseTemplateModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Template
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

export default HotelManagement;

