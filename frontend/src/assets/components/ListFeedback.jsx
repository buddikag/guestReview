import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import MainNavigation from "./MainNavigation.jsx";
const ListFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}simplewtstar/`, { headers: { 'Access-Control-Allow-Origin': '*' } })
      .then(response => setFeedbacks(response.data))
      .catch(error => console.log(error));
  }, []);
//   console.log(feedbacks);
  return (
    <div className="w-full bg-gray-200">
      <header className="bg-dark text-white w-100vw">
        <MainNavigation />
      </header>
      <div className="container" style={{ 
        marginTop: 'var(--spacing-section-margin)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <div className="bred-crumb">
            <Link to="/" className="text-dark text-decoration-none" style={{ color: 'var(--color-primary)' }}>Home</Link> 
            <span style={{ color: 'var(--color-secondary)', marginLeft: 'var(--spacing-sm)' }}>/ List Feedback</span>
        </div>
      </div>
      <div className="container" style={{ 
        marginTop: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-section-margin)'
      }}>
      <h2 className="text-center" style={{ 
        color: 'var(--color-primary)',
        marginBottom: 'var(--spacing-xl)',
        fontWeight: 700,
        fontSize: '2.5rem'
      }}>List of all Feedback</h2>
      <div className="card" style={{
        boxShadow: 'var(--shadow-card)',
        padding: 'var(--spacing-card-padding)',
        marginBottom: 'var(--spacing-section-margin)'
      }}>
      <table className="table">
        <thead>
          <tr>
            <th>Guest Name</th>
            <th>Feedback</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((data, index) => {
            return (
              <tr key={data.rating}>
                <td>
                  <span className="text-lg font-bold" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>{data.name}</span> 
                  <span className="text-sm" style={{ color: 'var(--color-accent)', marginLeft: '8px', fontWeight: 600 }}>{data.rating} stars</span>
                </td>
                <td>
                  <span className="truncate" style={{ color: 'var(--text-primary)' }}>
                    {data.comment.substring(0, 50)}
                  </span>
                  {data.comment.length > 50 && (
                    <span className="more" onClick={(e) => {
                      e.preventDefault();
                      alert(data.comment);
                    }}>
                      <span className="text-blue" style={{ 
                        color: "var(--color-secondary)", 
                        cursor: "pointer", 
                        textDecoration: "underline", 
                        fontSize: "14px",
                        marginLeft: '8px',
                        fontWeight: 600
                      }}> More</span>
                    </span>
                  )}
                </td> 
                <td>
                    <span className="text-lg font-bold" style={{ 
                      fontSize: '1.5rem',
                      color: 'var(--color-accent)',
                      filter: 'drop-shadow(0 2px 4px rgba(238, 167, 39, 0.3))'
                    }}>{'⭐'.repeat(data.rating)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      <div style={{ marginTop: 'var(--spacing-xl)' }}>
      <nav className="d-flex justify-content-center">
        <ul className="pagination">
          {[...Array(5)].map((v, i) => {
            return (
              <li className="page-item" key={i}>
                <Link to={`/listfeedback/${i+1}`} className={`page-link ${i === 0 ? "active" : ""}`}>{i+1}</Link>
              </li>
            );
          })}
        </ul>
      </nav>
      </div>
      </div>
    </div>
  );
};

export default ListFeedback;
