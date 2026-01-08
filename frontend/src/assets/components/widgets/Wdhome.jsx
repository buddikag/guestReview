import React from 'react';
import { useEffect, useState } from "react";
import axios from "axios";
import './widget.css';

const SamplePage = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Get hotel ID from URL parameter, environment variable, or use default
    // You can pass hotelId as a URL parameter: ?hotelId=1
    // Or set it in environment variable: VITE_HOTEL_ID
    // Or hardcode it for the widget
    const getHotelId = () => {
        // Option 1: Get from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const urlHotelId = urlParams.get('hotelId');
        if (urlHotelId) return urlHotelId;
        
        // Option 2: Get from environment variable
        const envHotelId = import.meta.env.VITE_HOTEL_ID;
        if (envHotelId) return envHotelId;
        
        // Option 3: Default hotel ID (change this to your hotel ID)
        return 1; // Replace with your default hotel ID
    };

    useEffect(() => {
        const hotelId = getHotelId();
        const apiUrl = import.meta.env.VITE_API_URL || '';
        
        // Remove trailing slash from API URL if present
        const cleanApiUrl = apiUrl.replace(/\/$/, '');
        
        // Fetch reviews for specific hotel
        axios.get(`${cleanApiUrl}/simplewtstar/hotel/${hotelId}`, { 
            headers: { 
                'Access-Control-Allow-Origin': '*' 
            } 
        })
        .then(response => {
            // Handle paginated response
            if (response.data.data) {
                setFeedbacks(response.data.data);
            } else {
                setFeedbacks(response.data);
            }
        })
        .catch(error => {
            console.error('Error fetching reviews:', error);
            setError('Failed to load reviews. Please try again later.');
        })
        .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div>Loading reviews...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="container-fluid p-4">
            <div className="feedback-list">
              {feedbacks.length === 0 ? (
                <p className="empty">No feedback yet</p>
              ) : (
                feedbacks.map((data) => (
                  <div className="feedback-card" key={data.id}>
                    <div className="feedback-header">
                      <span className="guest-name">
                        {data.nickname || data.guest_name || 'Anonymous'}
                      </span>
                      <span className="rating">
                        {'⭐'.repeat(data.rating || 0)}
                      </span>
                    </div>

                    <p className="comment">{data.comment}</p>
                    
                    {data.reply && (
                      <div className="reply-section">
                        <strong>Reply:</strong>
                        <p className="reply-text">{data.reply}</p>
                      </div>
                    )}
                    
                    {data.created_at && (
                      <div className="feedback-date">
                        {new Date(data.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
        </div>
    );
};

export default SamplePage;
