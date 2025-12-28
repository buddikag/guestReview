import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
function GuestList() {
    const [getData, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
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
    const copyFeedbakLink = (id) => {
        const feedbackLink = import.meta.env.VITE_BASE_URL + `simplewtstar/${id}`;
        navigator.clipboard.writeText(feedbackLink);
        alert('Feedback link copied to clipboard!');
    } 

    //
    const sendWhatsAppMessage = (id,phone_number) => {
        console.log(phone_number);
        const phone = phone_number;
        const message = import.meta.env.VITE_BASE_URL + `simplewtstar/${id}`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        window.open(url, "_blank");
    };  
    return (
        <div className="p-3 bg-white rounded shadow-sm mb-20 mt-2">
            <table className="table table-bordered table-striped">
                <thead>
                    <tr> 
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
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
                                <td>
                                    <Link onClick={() => copyFeedbakLink(data.id)} className="btn btn-outline-dark btn-sm mx-2">Copy Link</Link>
                                    <Link onClick={() => copyFeedbakLink(data.id)} className="btn btn-outline-dark btn-sm mx-2">Mail</Link>
                                    <Link onClick={() => sendWhatsAppMessage(data.id,data.phone)} className="btn btn-outline-dark btn-sm mx-2">Whatsapp</Link>                                   
                                </td>
                                <td>
                                    <Link to={`/read/${data.id}`} className="btn btn-dark btn-sm">Read</Link>
                                    <Link to={`/updateGuest/${data.id}`} className="btn btn-outline-dark btn-sm mx-2">Update</Link>
                                    {/* <button onClick={() => handleDelete(data.id)} className="btn btn-dark btn-sm">Delete</button> */}
                                    <Link onClick={() => handleDelete(data.id)} className="btn btn-outline-dark btn-sm mx-2">Delete</Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-4">
                <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                Prev
                </button>

                <span className="px-3 py-1">
                {page} / {totalPages}
                </span>

                <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                Next
                </button>
            </div>
        </div>
    );
}
export default GuestList;
