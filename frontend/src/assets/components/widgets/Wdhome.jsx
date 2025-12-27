import React from 'react';
import { useEffect, useState } from "react";
import axios from "axios";
import './widget.css';
const SamplePage = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      axios.get(`${import.meta.env.VITE_API_URL}simplewtstar/`, { headers: { 'Access-Control-Allow-Origin': '*' } })
        .then(response => setFeedbacks(response.data))
        .catch(error => console.log(error))
        .finally(() => setLoading(false));
    }, []);
    if (loading) {
      return <div>Loading...</div>;
    }
    return (
        <div className="container-fluid p-4">
            {/* <h1>Sample Page widget</h1> */}
            <div className="feedback-list">
              {feedbacks.length === 0 ? (
                <p className="empty">No feedback yet</p>
              ) : (
                feedbacks.map((data) => (
                  <div className="feedback-card" key={data.id}>
                    <div className="feedback-header">
                      <span className="guest-name">{data.name}</span>
                      <span className="rating">
                        {'⭐'.repeat(data.rating)}
                      </span>
                    </div>

                    <p className="comment">{data.comment}</p>
                  </div>
                ))
              )}
            </div>
        </div>
    );
};

export default SamplePage;
