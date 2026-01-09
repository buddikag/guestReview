import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
function GuestList() {
    const [getData, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
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
    //
    const sendWhatsAppMessage = (id,phone_number) => {
        console.log(phone_number);
        const phone = phone_number;
        const message = import.meta.env.VITE_BASE_URL + `simplewtstar/${id}`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        window.open(url, "_blank");
    };  
//  copy feedback link
    const copyFeedbakLink = async (userid, hotelId) => {
        const res = await axios.post(
            `${import.meta.env.VITE_API_URL}simplewtstar/generateReviewToken`,
            {
            userId: userid,
            hotelId: hotelId || 1,
            }
        );
        const token = res.data;

        const feedbackLink =
            `${import.meta.env.VITE_BASE_URL}simplewtstar/review?token=${token}`;

        await navigator.clipboard.writeText(feedbackLink);
        alert("Feedback link copied!");
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
                        <th>Email</th>
                        <th>Hotel</th>
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
                                <td>{data.email}</td>
                                <td>{data.hotel_name || 'N/A'}</td>
                                <td>
                                    <Link onClick={() => copyFeedbakLink(data.id, data.hotel_id)} className="btn btn-outline-dark btn-sm mx-2">Copy Link</Link>
                                    <Link onClick={() => copyFeedbakLink(data.id, data.hotel_id)} className="btn btn-outline-dark btn-sm mx-2">Mail</Link>
                                    <Link onClick={() => sendWhatsAppMessage(data.id,data.phone)} className="btn btn-outline-dark btn-sm mx-2">Whatsapp</Link>                                   
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
        </div>
    );
}
export default GuestList;
