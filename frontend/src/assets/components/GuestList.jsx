import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
function GuestList() {
    const [getData, setData] = useState([]);

    useEffect(() => {
        axios.get(import.meta.env.VITE_API_URL,Headers={'Access-Control-Allow-Origin':'*'})
            .then(response => setData(response.data))
            .catch(error => console.log(error));
    }, []);
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
    return (
        <div className="w-100 mt-2 bg-white rounded p-3">
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
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
                                    <Link to={`/read/${data.id}`} className="btn btn-dark btn-sm">Read</Link>
                                    <Link to={`/updateGuest/${data.id}`} className="btn btn-outline-dark btn-sm mx-2">Update</Link>
                                    {/* <button onClick={() => handleDelete(data.id)} className="btn btn-dark btn-sm">Delete</button> */}
                                    <Link onClick={() => handleDelete(data.id)} className="btn btn-outline-dark btn-sm mx-2">Delete</Link>
                                    <Link onClick={() => copyFeedbakLink(data.id)} className="btn btn-outline-dark btn-sm mx-2">Copy Feedbak Link</Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
export default GuestList;
