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
        <div className="d-flex flex-column vh-100 justify-content-center align-items-center" style={{ 
            background: 'radial-gradient(circle, rgb(97 61 163) 0%, rgb(60 16 114) 50%, rgb(22 1 36) 100%)',
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
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #E9ECEF 50%, #ADB5BD 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: 'none'
                }}>Guest Review Management System</h1>
                
                <div style={{ 
                    marginBottom: 'var(--spacing-xl)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <img 
                        src="/backImage.png" 
                        alt="Guest Management" 
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            maxHeight: '400px',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-xl)',
                            filter: 'brightness(0.7)',
                            opacity: 0.9
                        }}
                    />
                </div>
                
                <p className="mb-4" style={{ 
                    fontSize: '1.25rem',
                    color: '#FFFFFF',
                    marginBottom: '2rem',
                    opacity: 0.95
                }}>Manage your guests efficiently and effortlessly.</p>
                
                <Link to="/createGuest" className="btn btn-primary btn-lg" style={{
                    padding: '1rem 2.5rem',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>Add New Guest</Link>
            </div>
        </div>
    );
}

export default Home;