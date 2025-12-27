import React, { useState, useEffect} from "react";
import axios from "axios";
import "./SimpleWtStar.css";

const SimpleWtStar = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [getData, setData] = useState([]);
    // useEffect(() => {
    //     axios.get('http://localhost:3000/simpleWtStar/')
    //         .then(response => setData(response.data))
    //         .catch(error => console.log(error));
    // }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const feedbackData = {
      rating,
      comment,
      guestid: window.location.pathname.split("/").pop()
    };
    axios.post(`${import.meta.env.VITE_API_URL}simplewtstar/add`, feedbackData)
      .then((response) => {
        alert("Feedback submitted successfully!");
        setRating(0);
        setComment("");
      })
      .catch((error) => console.log(error));    
    setRating(0);
    setComment("");
  };

  return (
    <div className="container">
        
    <div className="feedback-container">
      <div className="row justify-content-center mb-4">
        <img className="logo" src="/logo.jpg" alt="Vite logo" style={{height: "150px"}} />
      </div>
      <form className="feedback-card" onSubmit={handleSubmit}>
        <h2>Give feedback</h2>
        <p className="subtitle">
          Please share your experience about our hotel.
        </p>

        {/* Rating */}
        <div className="rating-section">
          <label>Rating</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= rating ? "star active" : "star"}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="comment-section">
          <label>Comment (optional)</label>
          <textarea
            placeholder="Enter your message..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button type="submit" disabled={rating === 0}>
          Send
        </button>
      </form>
    </div>
    <footer className="footer">
      <div className="container">
        <p className="footer-text color-white text-center" style={{color: 'white !important'}}>
          Copyright &copy; 2023. All rights reserved.
        </p>
      </div>
    </footer>
    </div>
  );
};

export default SimpleWtStar;
