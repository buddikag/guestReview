import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Home = () => {

    const [getData, setData] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3000/')
            .then(response => setData(response.data))
            .catch(error => console.log(error));
    }, []);

    const handleDelete = (id) => {
        axios.delete(`http://localhost:3000/delete/${id}`)
            .then(response => {
                location.reload();
            })
            .catch(error => console.log(error));
    }

    return (
        <div className="d-flex flex-column vh-100 bg-light justify-content-center align-items-center">
            <h1 className="mb-4">Welcome to the Guest Management System</h1>
            <p className="mb-4">Manage your guests efficiently and effortlessly.</p>
            <Link to="/createGuest" className="btn btn-primary btn-lg">Add New Guest</Link>
        </div>
    );
}

export default Home;