import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import MainNavigation from "./MainNavigation.jsx";
const ListFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [editState, setEditState] = useState(false);
  const [editRecordId, setEditRecordId] = useState(null);
  const [replyMsg, setReplyMsg] = useState('');
  const [replyRecordId, setReplyRecordId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  //   useEffect(() => {
  //   axios.get(`${import.meta.env.VITE_API_URL}simplewtstar/`, { headers: { 'Access-Control-Allow-Origin': '*' } })
  //     .then(response => setFeedbacks(response.data))
  //     .catch(error => console.log(error));
  // }, []);
    const fetchGuests = async (pageNumber) => {
        try {
            const res = await axios.get(
            import.meta.env.VITE_API_URL + `simplewtstar?page=${pageNumber}&limit=5`,
            { headers: { 'Access-Control-Allow-Origin': '*' } }
            );
            setFeedbacks(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                // Handle authentication/authorization errors
                setFeedbacks([]);
            }
        }
    };

    useEffect(() => {
        fetchGuests(page);
    }, [page]);
  const addRply = (id, replytext) => {
    setReplyRecordId(id);
    setLoading(true);
    console.log(replytext);
    const data = {
      replytext : replytext
    };
    axios.put(`${import.meta.env.VITE_API_URL}simplewtstar/reply/${id}`, data, { headers: { 'Access-Control-Allow-Origin': '*' } })
        .then(response => {
          console.log(response.data);
          // Update the feedbacks state to reflect the new reply
          const updatedFeedbacks = feedbacks.map(feedback => {
            if (feedback.id === id) {
              return { ...feedback, reply: replytext };
            }
            return feedback;
          });
          setFeedbacks(updatedFeedbacks);
          setLoading(false);
          setEditState(false);
        })
        .catch(error => console.log(error));
  }
  const changeState = (id,state) => {
    const newState = state === 1 ? 0 : 1;
    state = newState;
    const data = {
      state : state
    };
    axios.put(`${import.meta.env.VITE_API_URL}simplewtstar/state/${id}`, data, { headers: { 'Access-Control-Allow-Origin': '*' } })
        .then(response => {
          console.log(response.data);
          // Update the feedbacks state to reflect the new state
          const updatedFeedbacks = feedbacks.map(feedback => {
            if (feedback.id === id) {
              return { ...feedback, state: state };
            }
            return feedback;
          });
          setFeedbacks(updatedFeedbacks);
        })
        .catch(error => console.log(error));
  }
  const handledelete = (id) => {
    axios.delete(`${import.meta.env.VITE_API_URL}simplewtstar/delete/${id}`, { headers: { 'Access-Control-Allow-Origin': '*' } })
        .then(response => { 
          console.log(response.data);
          // Update the feedbacks state to reflect the deleted feedback
          const updatedFeedbacks = feedbacks.filter(feedback => feedback.id !== id);
          setFeedbacks(updatedFeedbacks);
        })
        .catch(error => console.log(error));
  } 
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
      <div className="card" style={{
        boxShadow: 'var(--shadow-card)',
        padding: 'var(--spacing-card-padding)',
        marginBottom: 'var(--spacing-section-margin)'
      }}>
      <table className="table">
        <thead>
          <tr>
            <th>Guest Name</th>
            <th>Hotel</th>
            <th>Feedback</th>
            <th>Rating</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((data, index) => {
            return (
              <tr key={data.id || data.rating}>
                <td>
                  <span className="text-lg font-bold" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>{data.name}</span> 
                  <span className="text-sm" style={{ color: 'var(--color-accent)', marginLeft: '8px', fontWeight: 600 }}>{data.rating} stars</span>
                </td>
                <td>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {data.hotel_name || 'N/A'}
                  </span>
                </td>
                <td className="max-w-xs truncate ...">
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
                  {/* reply */}
                  {data.reply && (
                    <div>
                    <span className="reply" style={{
                      display: 'block',
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: 'var(--color-gray-100)',
                      borderLeft: '4px solid var(--color-accent)',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic'
                    }}>
                      Reply: {data.reply}
                    </span>
                    <span className="text-blue" style={{ cursor: "pointer", textDecoration: "underline", fontSize: "14px", marginLeft: '8px', fontWeight: 600,color: 'var(--color-secondary)' }} onClick={(e) => {
                      e.preventDefault();
                      setEditState(!editState);
                      setEditRecordId(data.id);
                    }}>Edit</span>   
                    {editState && editRecordId === data.id && (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const replytext = e.target.reply.value;
                        addRply(data.id, replytext);
                      }}>
                        <input type="text" name="reply" className="form-control" placeholder="Enter your reply" />
                        <button type="submit" className="btn-sm mt-2 rounded btn-dark" style={{width: '100px'}}>Reply</button>
                        {loading && replyRecordId === data.id && (
                       <div class="spinner-border spinner-border-sm mx-2" role="status"></div>
                        )}
                      </form>
                    )}
                    </div>
                  )}
                  {!data.reply && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const replytext = e.target.reply.value;
                    addRply(data.id, replytext);
                  }}>
                    <input type="text" name="reply" className="form-control mt-2" placeholder="Enter your reply" />
                    <button type="submit" className="btn-sm mt-2 rounded btn-dark" style={{width: '100px'}}>Reply</button>
                     {loading && replyRecordId === data.id && (
                       <div class="spinner-border spinner-border-sm mx-2" role="status"></div>
                     )}
                     

                  </form>
                  )}
                </td> 
                <td>
                    <span className="text-lg font-bold" style={{ 
                      fontSize: '1.5rem',
                      color: 'var(--color-accent)',
                      filter: 'drop-shadow(0 2px 4px rgba(238, 167, 39, 0.3))'
                    }}>{'⭐'.repeat(data.rating)}</span>
                </td>
                <td>
                  <Link onClick={() => changeState(data.id,data.state)} className="btn btn-dark btn-sm">{data.state === 1 ? "Hide" : "Show"}</Link>
                  <Link onClick={() => handledelete(data.id)} className="btn btn-outline-dark btn-sm mx-2">Delete</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
      {/* pagination */}
            {/* Pagination */}
            <nav aria-label="Page navigation" style={{
                marginTop: 'var(--spacing-lg)',
                paddingTop: 'var(--spacing-md)'
            }}>
                <ul className="pagination justify-content-center mb-0" style={{
                    gap: '10px'
                }}>
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            aria-label="Previous"
                        >
                            <span aria-hidden="true">&laquo;</span>
                            <span className="ms-1">Previous</span>
                        </button>
                    </li>
                    {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                            <li key={pageNumber} className={`page-item ${page === pageNumber ? 'active' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setPage(pageNumber)}
                                >
                                    {pageNumber}
                                </button>
                            </li>
                        );
                    })}
                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            aria-label="Next"
                        >
                            <span className="me-1">Next</span>
                            <span aria-hidden="true">&raquo;</span>
                        </button>
                    </li>
                </ul>
            </nav>

      </div>
    </div>
  );
};

export default ListFeedback;
