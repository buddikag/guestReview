import React, { useState, useEffect, use} from "react";
import axios from "axios";
import "./SimpleWtStar.css";
import { Modal } from "bootstrap";
import { useParams } from 'react-router-dom';
import e from "cors";

const SimpleWtStar = (props) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [preReviews, setpreReviews] = useState([]);
  const [submtStatus, setsubmtStatus] = useState(false);
  const [reviewResponse, setReviewResponse] = useState([]);
  //const { guestData } = useParams();
  const [editmode, seteditmode] = useState(false);
  const [reviewId, setReviewId] = useState(null);
  // 
  const [guestId, setguestId] = useState(null);
  const [hotelId, sethotelId] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  useEffect(() => {
    if (token) {
      // decode token and get user data
      axios.get(`${import.meta.env.VITE_API_URL}simplewtstar/getUserData/${token}`,Headers={'Access-Control-Allow-Origin':'*'})
          .then((response) => {
            const newguestId=response.data.user_id;
            const newhotelId=response.data.hotel_id;
            setguestId(newguestId);
            sethotelId(newhotelId);
            //(newguestId, newhotelId);
          })
          .catch((error) => console.log(error));
    }
  }, []);
  useEffect(() => {
  if (guestId) {
   console.log("guest hear");
    init(guestId, hotelId);
  }
}, [guestId]);

  // useEffect(() => {
  //     getReview(guestData);
  //     axios.get(import.meta.env.VITE_API_URL+'simplewtstar/getPreReviews',Headers={'Access-Control-Allow-Origin':'*'})
  //         .then(
  //           response => setpreReviews(response.data))
  //         .catch(error => console.log(error));
  // }, []);

  // initiate 
  const init = (guestId, hotelId) => {
    getReview(guestId);
    axios.get(`${import.meta.env.VITE_API_URL}simplewtstar/getPreReviews`,Headers={'Access-Control-Allow-Origin':'*'})
        .then(
          response => setpreReviews(response.data))
        .catch(error => console.log(error));
  }
  const handleSubmit = (e) => {
    if (editmode) {
      updateReview(e);
      return;
    }
    e.preventDefault();
    setsubmtStatus(true);
    const modalEl = document.getElementById("exampleModal");
    const modal = new Modal(modalEl);
    const feedbackData = {
      rating,
      comment,
      guestid: guestId
    };
    axios.post(`${import.meta.env.VITE_API_URL}simplewtstar/add`, feedbackData)
      .then((response) => {
        //alert("Feedback submitted successfully!");
        setReviewResponse(response.data["Message"]);
        setRating(0);
        setComment("");
        modal.show();
        setsubmtStatus(false);
        getReview(guestId);
      })
      .catch((error) => console.log(error));    
    setRating(0);
    setComment("");
  };
// close modal
  const closeModal = () => {
    const modalEl = document.getElementById("exampleModal");
    const modal = Modal.getInstance(modalEl);
    modal.hide();
    getReview(guestId);
  };
// get pre reviews by id
  const getReview = (guestData) => {
    axios.get(`${import.meta.env.VITE_API_URL}simplewtstar/getReview/${guestData}`)
      .then((response) => {
        setRating(response.data[0].rating);
        setComment(response.data[0].comment);
        setReviewId(response.data[0].id);
        seteditmode(true);
      })
      .catch((error) => console.log(error));
  };
  // update review
  const updateReview = (e) => {
    e.preventDefault();
    e.preventDefault();
    setsubmtStatus(true);
    const modalEl = document.getElementById("exampleModal");
    const modal = new Modal(modalEl);
    const feedbackData = {
      rating,
      comment,
      guestid: window.location.pathname.split("/").pop()
    };
    axios.put(`${import.meta.env.VITE_API_URL}simplewtstar/update/${reviewId}`, feedbackData)
      .then((response) => {
        //alert("Feedback submitted successfully!");
        setReviewResponse(response.data["Message"]);
        setRating(0);
        setComment("");
        modal.show();
        setsubmtStatus(false);
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
        <h2>Review Us</h2>
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
        <div className="selected-rating">
          {rating > 0 ? `You selected ${rating} out of 5` : "No rating selected"}
        </div>
        <div className="divider">
          <hr />
        </div>
        {/* Predefined reviews */}

        <div class="container">
          <div class="row justify-content-md-center gap-2">
            {/* <span
              className="custom-badge"
              onClick={() => setComment("Excellent")}
            >
              Light Light Light
            </span> */}
            {preReviews.map((preReview) => (
              <span
                className="custom-badge"
                onClick={() => setComment(preReview.review)}
              >
                {preReview.review}
              </span>
            ))}
          </div>
        </div>
        <div className="divider">
          <hr />
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
          Submit
           {submtStatus && (
            <span class="spinner-border spinner-border-sm ms-5" role="status" aria-hidden="true"></span>
          )} 
        </button>
      </form>
<div
  className="modal fade"
  id="exampleModal"
  tabIndex="-1"
  aria-labelledby="exampleModalLabel"
  aria-hidden="true"
>
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title text-center" id="exampleModalLabel">Thank you for your review. We truly appreciate your feedback.</h5>
      </div>

      <div className="modal-body">
        {reviewResponse && <p>{reviewResponse}</p>}
      </div>

      <div className="modal-footer">
       <button className="btn btn-secondary" onClick={closeModal}> Close </button>
      </div>
    </div>
  </div>
</div>

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
