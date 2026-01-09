import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import MainNavigation from "./MainNavigation";

const Home = () => {

    const [getData, setData] = useState([]);

    useEffect(() => {
        axios.get(import.meta.env.VITE_API_URL+'api')
            .then(response => setData(response.data))
            .catch(error => console.log(error));
    }, []);

    const handleDelete = (id) => {
        axios.put(import.meta.env.VITE_API_URL+`delete/${id}`)
            .then(response => {
                location.reload();
            })
            .catch(error => console.log(error));
    }

    return (
        <div>
            <MainNavigation />
            <div className="d-flex flex-column vh-100 justify-content-center align-items-center" style={{ 
            position: 'relative',
            overflow: 'hidden',
            minHeight: '100vh',
            padding: 'var(--spacing-section-margin)'
        }}>
            <div style={{ 
                position: 'relative', 
                zIndex: 1, 
                textAlign: 'center', 
                padding: '2rem',
                width: '100%',
                maxWidth: '1200px'
            }}>
                <h1 className="mb-4" style={{ 
                    fontSize: '3.5rem',
                    fontWeight: 700,
                    marginBottom: '1.5rem',
                    color: '#333333'
                }}>Guest Review Management System</h1>
                
                <div style={{ 
                    marginBottom: 'var(--spacing-xl)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <img 
                        src="/backImage2.png" 
                        alt="Guest Management" 
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            maxHeight: '400px',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-xl)',
                            opacity: 0.95
                        }}
                    />
                </div>
                
                <p className="mb-4" style={{ 
                    fontSize: '1.25rem',
                    color: '#4d2b8c',
                    marginBottom: '2rem',
                    opacity: 0.95,
                    fontWeight: 500
                }}>Manage your guests review efficiently and effortlessly.</p>
                
                <Link to="/createGuest" className="btn btn-primary btn-lg add-guest-btn-home" style={{
                    padding: '1rem 2.5rem',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: '1px solid #212529'
                }}>Add New Guest</Link>
            </div>
        </div>
        </div>
    );
}

export default Home;