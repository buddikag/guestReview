import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import MainNavigation from "./MainNavigation.jsx";

const ReadGuest = () => {
    const { id } = useParams();
    const [guest, setGuest] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGuestData();
        fetchGuestReviews();
    }, [id]);

    const fetchGuestData = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}getGuest/${id}`,
                { headers: { 'Access-Control-Allow-Origin': '*' } }
            );
            setGuest(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching guest:', err);
            if (err.response?.status === 403) {
                setError('Access denied to this guest');
            } else if (err.response?.status === 404) {
                setError('Guest not found');
            } else {
                setError('Error loading guest data');
            }
            setLoading(false);
        }
    };

    const fetchGuestReviews = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}simplewtstar/getReview/${id}`,
                { headers: { 'Access-Control-Allow-Origin': '*' } }
            );
            setReviews(response.data || []);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            // Reviews are optional, so don't set error if they fail
        }
    };

    if (loading) {
        return (
            <div className="w-full">
                <header className="bg-dark text-white w-100vw">
                    <MainNavigation />
                </header>
                <div className="container" style={{ marginTop: '50px', textAlign: 'center' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full">
                <header className="bg-dark text-white w-100vw">
                    <MainNavigation />
                </header>
                <div className="container" style={{ marginTop: '50px' }}>
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                    <Link to="/" className="btn btn-primary">Back to Home</Link>
                </div>
            </div>
        );
    }

    if (!guest) {
        return (
            <div className="w-full">
                <header className="bg-dark text-white w-100vw">
                    <MainNavigation />
                </header>
                <div className="container" style={{ marginTop: '50px' }}>
                    <div className="alert alert-warning" role="alert">
                        Guest not found
                    </div>
                    <Link to="/" className="btn btn-primary">Back to Home</Link>
                </div>
            </div>
        );
    }

    // Calculate stay duration
    const startDate = new Date(guest.startDate);
    const endDate = new Date(guest.endDate);
    const stayDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    return (
        <div className="w-full">
            <header className="bg-dark text-white w-100vw">
                <MainNavigation />
            </header>
            <div className="container" style={{ 
                marginTop: 'var(--spacing-section-margin)',
                marginBottom: 'var(--spacing-lg)'
            }}>
                <div className="bred-crumb">
                    <Link to="/" className="text-dark text-decoration-none" style={{ color: 'var(--color-primary)' }}>Home</Link>
                    <span style={{ color: 'var(--color-secondary)', marginLeft: 'var(--spacing-sm)' }}>/ Guest Details</span>
                </div>
            </div>
            <div className="container" style={{ 
                marginTop: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-section-margin)'
            }}>
                {/* Guest Information Card */}
                <div className="card mb-4" style={{
                    boxShadow: 'var(--shadow-card)',
                    padding: 'var(--spacing-card-padding)',
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: 'var(--radius-lg)'
                }}>
                    <div className="card-header bg-primary text-white">
                        <h4 className="mb-0">Guest Information</h4>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <strong>Guest ID:</strong>
                                <p className="text-muted">{guest.id}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <strong>Status:</strong>
                                <p className="text-muted">
                                    <span className={`badge ${guest.status === 1 ? 'bg-success' : 'bg-secondary'}`}>
                                        {guest.status === 1 ? 'Active' : 'Inactive'}
                                    </span>
                                </p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <strong>Full Name:</strong>
                                <p className="text-muted">{guest.name}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <strong>Email:</strong>
                                <p className="text-muted">
                                    <a href={`mailto:${guest.email}`}>{guest.email}</a>
                                </p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <strong>Phone Number:</strong>
                                <p className="text-muted">
                                    <a href={`tel:${guest.phone}`}>{guest.phone}</a>
                                </p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <strong>Hotel:</strong>
                                <p className="text-muted">{guest.hotel_name || 'N/A'}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <strong>Room Number:</strong>
                                <p className="text-muted">{guest.roomNumber}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <strong>Stay Duration:</strong>
                                <p className="text-muted">{stayDuration} {stayDuration === 1 ? 'day' : 'days'}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <strong>Check-in Date:</strong>
                                <p className="text-muted">{new Date(guest.startDate).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <strong>Check-out Date:</strong>
                                <p className="text-muted">{new Date(guest.endDate).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <strong>Created At:</strong>
                                <p className="text-muted">
                                    {guest.created_at ? new Date(guest.created_at).toLocaleString('en-US') : 'N/A'}
                                </p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <strong>Last Updated:</strong>
                                <p className="text-muted">
                                    {guest.updated_at ? new Date(guest.updated_at).toLocaleString('en-US') : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Link to={`/updateGuest/${guest.id}`} className="btn btn-primary me-2">Edit Guest</Link>
                            <Link to="/" className="btn btn-outline-secondary">Back to List</Link>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="card" style={{
                    boxShadow: 'var(--shadow-card)',
                    padding: 'var(--spacing-card-padding)',
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: 'var(--radius-lg)'
                }}>
                    <div className="card-header bg-info text-white">
                        <h4 className="mb-0">Guest Reviews & Feedback</h4>
                    </div>
                    <div className="card-body">
                        {reviews.length > 0 ? (
                            <div>
                                {reviews.map((review, index) => (
                                    <div key={review.id || index} className="mb-4 p-3 border rounded" style={{
                                        backgroundColor: '#f8f9fa'
                                    }}>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <strong>Rating:</strong>
                                                <div className="mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} style={{ 
                                                            fontSize: '1.5rem',
                                                            color: i < review.rating ? '#ffc107' : '#e0e0e0'
                                                        }}>
                                                            ★
                                                        </span>
                                                    ))}
                                                    <span className="ms-2 text-muted">({review.rating}/5)</span>
                                                </div>
                                            </div>
                                            <small className="text-muted">
                                                {review.created_at ? new Date(review.created_at).toLocaleString('en-US') : 'N/A'}
                                            </small>
                                        </div>
                                        {review.nickname && (
                                            <div className="mb-2">
                                                <strong>Nickname:</strong> {review.nickname}
                                            </div>
                                        )}
                                        {review.comment && (
                                            <div className="mb-2">
                                                <strong>Comment:</strong>
                                                <p className="text-muted mb-0">{review.comment}</p>
                                            </div>
                                        )}
                                        {review.reply && (
                                            <div className="mt-3 p-2 bg-white border-start border-primary border-3">
                                                <strong>Hotel Response:</strong>
                                                <p className="text-muted mb-0">{review.reply}</p>
                                            </div>
                                        )}
                                        <div className="mt-2">
                                            <span className={`badge ${review.state === 1 ? 'bg-success' : 'bg-secondary'}`}>
                                                {review.state === 1 ? 'Published' : 'Unpublished'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted py-4">
                                <p>No reviews submitted yet for this guest.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <footer className="bg-dark text-white" style={{ 
                background: 'var(--color-primary)',
                marginTop: 'var(--spacing-3xl)',
                padding: 'var(--spacing-xl)',
                textAlign: 'center'
            }}>
                <p style={{ margin: 0, color: 'var(--text-light)' }}>&copy; 2025 Guest Review System</p>
            </footer>
        </div>
    );
};

export default ReadGuest;
