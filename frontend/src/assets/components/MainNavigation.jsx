import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const MainNavigation = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.user-dropdown')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="container-fluid p-0 m-0" >
    <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="container">
        <Link className="navbar-brand text-white" to="/">
          GSS
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/createGuest">
                Guests
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/listfeedback">
                List Feedback
              </Link>
            </li>
            {isSuperAdmin() && (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/users">
                    User Management
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/hotels">
                    Hotel Management
                  </Link>
                </li>
              </>
            )}
          </ul>
          <ul className="navbar-nav align-items-center">
            {user && (
              <>
                <li className="nav-item user-dropdown" style={{ position: 'relative' }}>
                  <a 
                    className="nav-link dropdown-toggle text-white" 
                    href="#" 
                    id="navbarDropdown" 
                    role="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDropdown(!showDropdown);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {user.full_name || user.username} ({user.role})
                  </a>
                  {showDropdown && (
                    <ul 
                      className="dropdown-menu dropdown-menu-end show" 
                      style={{ 
                        display: 'block',
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        zIndex: 1000,
                        minWidth: '200px'
                      }}
                    >
                      <li>
                        <div className="dropdown-item-text px-3 py-2" style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                          <strong>{user.full_name || user.username}</strong><br />
                          <small>{user.email}</small>
                        </div>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <a 
                          className="dropdown-item" 
                          onClick={handleLogout} 
                          style={{ cursor: 'pointer', color: '#dc3545' }}
                        >
                          <span style={{ marginRight: '8px' }}>🚪</span>
                          Logout
                        </a>
                      </li>
                    </ul>
                  )}
                </li>
                <li className="nav-item ms-2">
                  <button 
                    className="btn btn-outline-light btn-sm" 
                    onClick={handleLogout}
                    style={{ 
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white'
                    }}
                    title="Logout"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
    </div>
  );
};

export default MainNavigation;
