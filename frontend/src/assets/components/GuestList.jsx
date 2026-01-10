import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
function GuestList() {
    const [getData, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sendingEmail, setSendingEmail] = useState(null); // Track which guest's email is being sent
    const [emailStatuses, setEmailStatuses] = useState({}); // Track email status for each guest
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkModalData, setLinkModalData] = useState({ feedbackLink: '', token: '', guestName: '' });
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailModalData, setEmailModalData] = useState({ type: 'success', message: '', guestName: '' });
    //const SECRET = process.env.JWT_SECRET || "gss_2026_@";
    // useEffect(() => {
    //     axios.get(import.meta.env.VITE_API_URL,Headers={'Access-Control-Allow-Origin':'*'})
    //         .then(response => setData(response.data))
    //         .catch(error => console.log(error));
    // }, []);

    const fetchGuests = async (pageNumber) => {
        const res = await axios.get(
        import.meta.env.VITE_API_URL + `?page=${pageNumber}&limit=10`,
        { headers: { 'Access-Control-Allow-Origin': '*' } }
        //`http://localhost:5000/users?page=${pageNumber}&limit=5`
        );
        setData(res.data.data);
        setTotalPages(res.data.totalPages);
        
        // Fetch email statuses for the guests
        if (res.data.data && res.data.data.length > 0) {
            fetchEmailStatuses(res.data.data.map(guest => guest.id));
        }
    };

    const fetchEmailStatuses = async (guestIds) => {
        try {
            const token = localStorage.getItem('token');
            const guestIdsString = guestIds.join(',');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}api/email/status/guests?guestIds=${guestIdsString}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setEmailStatuses(response.data || {});
        } catch (error) {
            console.error('Error fetching email statuses:', error);
            // Don't show error to user, just continue without status colors
        }
    };

    useEffect(() => {
        fetchGuests(page);
    }, [page]);
    const handleDelete = (id) => {
        axios.put(`${import.meta.env.VITE_API_URL}delete/${id}`)
            .then(response => {
                location.reload();
            })
            .catch(error => console.log(error));
    }
    // Send feedback link via WhatsApp
    const sendWhatsAppMessage = async (userid, phone_number, hotelId) => {
        try {
            // Generate token for the guest
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}simplewtstar/generateReviewToken`,
                {
                    userId: userid,
                    hotelId: hotelId || 1,
                }
            );
            const token = res.data;

            // Create feedback link with token
            const feedbackLink = `${import.meta.env.VITE_BASE_URL}simplewtstar/review?token=${token}`;
            
            // Format phone number (remove any non-numeric characters except +)
            const phone = phone_number.replace(/[^\d+]/g, '');
            
            // Create WhatsApp message with feedback link
            const message = `Hello! Please share your feedback about your stay:\n${feedbackLink}`;
            const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

            window.open(url, "_blank");
        } catch (error) {
            console.error('Error generating token for WhatsApp:', error);
            alert('Failed to generate feedback link. Please try again.');
        }
    };  
//  copy feedback link
    const copyFeedbakLink = async (userid, hotelId, guestName) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}simplewtstar/generateReviewToken`,
                {
                userId: userid,
                hotelId: hotelId || 1,
                }
            );
            const token = res.data;

            // Token is now short (10-20 characters), no need to shorten
            const feedbackLink =
                `${import.meta.env.VITE_BASE_URL}simplewtstar/review?token=${token}`;

            // Show modal with feedback link
            setLinkModalData({
                feedbackLink: feedbackLink,
                token: token,
                guestName: guestName || 'Guest'
            });
            setShowLinkModal(true);
        } catch (error) {
            console.error('Error generating token:', error);
            alert('Failed to generate feedback link. Please try again.');
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            alert('Failed to copy to clipboard');
        }
    };

    const closeLinkModal = () => {
        setShowLinkModal(false);
        setLinkModalData({ feedbackLink: '', token: '', guestName: '' });
    };

    // Send feedback link via email
    const sendEmail = async (guestId, hotelId, guestName) => {
        setSendingEmail(guestId); // Set loading state for this guest
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}api/email/send/${guestId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            // Show success modal
            setEmailModalData({
                type: 'success',
                message: 'Email sent successfully!',
                guestName: guestName || 'Guest'
            });
            setShowEmailModal(true);
            // Refresh email status for this guest
            fetchEmailStatuses([guestId]);
        } catch (error) {
            console.error('Error sending email:', error);
            const errorMessage = error.response?.data?.Message || 'Failed to send email. Please check SMTP settings.';
            // Show error modal
            setEmailModalData({
                type: 'error',
                message: errorMessage,
                guestName: guestName || 'Guest'
            });
            setShowEmailModal(true);
        } finally {
            setSendingEmail(null); // Clear loading state
        }
    };

    const closeEmailModal = () => {
        setShowEmailModal(false);
        setEmailModalData({ type: 'success', message: '', guestName: '' });
    };

    // Get button class and style based on email status
    const getEmailButtonStyle = (guestId) => {
        const status = emailStatuses[guestId]?.status;
        
        if (sendingEmail === guestId) {
            return {
                className: "btn btn-outline-secondary btn-sm mx-2",
                style: { 
                    pointerEvents: 'none',
                    opacity: 0.6
                }
            };
        }

        switch (status) {
            case 'sent':
                return {
                    className: "btn btn-success btn-sm mx-2",
                    style: {}
                };
            case 'failed':
                return {
                    className: "btn btn-danger btn-sm mx-2",
                    style: {}
                };
            case 'pending':
                return {
                    className: "btn btn-warning btn-sm mx-2",
                    style: {}
                };
            default:
                return {
                    className: "btn btn-outline-dark btn-sm mx-2",
                    style: {}
                };
        }
    };

    // Get button text based on email status
    const getEmailButtonText = (guestId) => {
        if (sendingEmail === guestId) {
            return (
                <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                </>
            );
        }

        const status = emailStatuses[guestId]?.status;
        switch (status) {
            case 'sent':
                return '✓ Sent';
            case 'failed':
                return '✗ Failed';
            case 'pending':
                return '⏳ Pending';
            default:
                return 'Mail';
        }
    };

    return (
        <div className="bg-white rounded" style={{
            padding: 'var(--spacing-card-padding)',
            boxShadow: 'var(--shadow-card)',
            marginBottom: 'var(--spacing-section-margin)',
            marginTop: 'var(--spacing-lg)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-lg)'
        }}>
            <table className="table table-bordered table-striped">
                <thead>
                    <tr> 
                        <th>ID</th>
                        <th>Name</th>
                        <th>Hotel</th>
                        <th>Copy Link</th>
                        <th>Send Email</th>
                        <th>Send Link</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {getData.map((data, index) => {
                        return (
                            <tr key={index}>
                                <td>{data.id}</td>
                                <td>{data.name}</td>
                                <td>{data.hotel_name || 'N/A'}</td>
                                <td>
                                    <Link onClick={() => copyFeedbakLink(data.id, data.hotel_id, data.name)} className="btn btn-outline-dark btn-sm mx-2">Copy Link</Link>
                                </td>
                                <td>
                                    <Link 
                                        onClick={() => sendEmail(data.id, data.hotel_id, data.name)} 
                                        {...getEmailButtonStyle(data.id)}
                                        title={emailStatuses[data.id]?.status === 'failed' && emailStatuses[data.id]?.error_message 
                                            ? `Error: ${emailStatuses[data.id].error_message.substring(0, 100)}` 
                                            : emailStatuses[data.id]?.status === 'sent' && emailStatuses[data.id]?.sent_at
                                            ? `Sent: ${new Date(emailStatuses[data.id].sent_at).toLocaleString()}`
                                            : 'Send feedback link via email'}
                                    >
                                        {getEmailButtonText(data.id)}
                                    </Link>
                                    </td>
                                <td>
                                    <Link onClick={() => sendWhatsAppMessage(data.id, data.phone, data.hotel_id)} className="btn btn-outline-dark btn-sm mx-2">Whatsapp</Link>                                   
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <Link to={`/read/${data.id}`} className="btn btn-dark btn-sm">Read</Link>
                                        <Link to={`/updateGuest/${data.id}`} className="btn btn-outline-dark btn-sm">Update</Link>
                                        {/* <button onClick={() => handleDelete(data.id)} className="btn btn-dark btn-sm">Delete</button> */}
                                        <Link onClick={() => handleDelete(data.id)} className="btn btn-outline-dark btn-sm">Delete</Link>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
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

            {/* Feedback Link Modal */}
            {showLinkModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Feedback Link Generated</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={closeLinkModal}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label"><strong>Guest:</strong> {linkModalData.guestName}</label>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label"><strong>Token:</strong></label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={linkModalData.token}
                                            readOnly
                                            style={{ fontFamily: 'monospace' }}
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={() => copyToClipboard(linkModalData.token)}
                                            title="Copy Token"
                                        >
                                            📋 Copy Token
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label"><strong>Feedback Link:</strong></label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={linkModalData.feedbackLink}
                                            readOnly
                                            style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={() => copyToClipboard(linkModalData.feedbackLink)}
                                            title="Copy Link"
                                        >
                                            📋 Copy Link
                                        </button>
                                    </div>
                                </div>
                                <div className="alert alert-info mb-0">
                                    <small>
                                        <strong>Instructions:</strong> Share this link with the guest so they can provide feedback about their stay.
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeLinkModal}>
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => copyToClipboard(linkModalData.feedbackLink)}
                                >
                                    Copy Link & Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Status Modal */}
            {showEmailModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className={`modal-header text-white ${emailModalData.type === 'success' ? 'bg-success' : 'bg-danger'}`}>
                                <h5 className="modal-title">
                                    {emailModalData.type === 'success' ? '✓ Email Sent Successfully' : '✗ Email Failed'}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={closeEmailModal}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <p><strong>Guest:</strong> {emailModalData.guestName}</p>
                                </div>
                                <div className={`alert ${emailModalData.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                                    <div className="d-flex align-items-center">
                                        <span className="me-2" style={{ fontSize: '1.5rem' }}>
                                            {emailModalData.type === 'success' ? '✓' : '✗'}
                                        </span>
                                        <span>{emailModalData.message}</span>
                                    </div>
                                </div>
                                {emailModalData.type === 'error' && (
                                    <div className="alert alert-warning mb-0">
                                        <small>
                                            <strong>Note:</strong> Please check the SMTP settings in Hotel Management section and ensure they are configured correctly.
                                        </small>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className={`btn ${emailModalData.type === 'success' ? 'btn-success' : 'btn-danger'}`}
                                    onClick={closeEmailModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default GuestList;
