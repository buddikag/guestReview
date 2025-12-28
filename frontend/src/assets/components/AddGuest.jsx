import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import axios from "axios";
import { Link } from "react-router-dom";
import GuestList from "./GuestList.jsx";
import MainNavigation from "./MainNavigation.jsx";

const AddGuest = () => {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roomNumber, setRoomNumber] = useState('');

  const [phoneno, setPhoneno] = useState("");
  const [errorphone, setErrorphone] = useState("");

  const validatePhone = () => {
    if (!phone || !isValidPhoneNumber(phone)) {
      setErrorphone("Please enter a valid phone number");
      return;
    }
    setErrorphone("");
    // alert("Valid phone: " + phone);
  };

  const handleSubmit = (event) => {
    setError('');
    setMessage('');
    event.preventDefault();
    validatePhone();
    const data = {
      name,
      phone,
      email,
      startDate,
      endDate,
      roomNumber,
    };
    axios.post('http://localhost:3000/add', data)
      .then(response => {
        setMessage(response.data['Message']);
        setName('');
        setPhone('');
        setEmail('');
        setStartDate('');
        setEndDate('');
        setRoomNumber('');
        setError('');
        location.reload();
      })
        .catch(error => {
            console.log(error.response.data['Message']);
            setError(error.response.data['Message']);
        });
  };

  return (
    <div className="w-full">
      <header className="bg-dark text-white w-100vw">
        <MainNavigation />
      </header>
      <div className="container mt-4 mb-5">
        <div className="bred-crumb">
            <Link to="/" className="text-dark text-decoration-none">Home</Link> <span className="color-red">/ Add Guest</span>
        </div>
      </div>
      <div className="container mt-4 mb-5">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          </div>
          <div style={{ maxWidth: '100%', marginTop: '25px' }} className="col-sm-6">
            <PhoneInput
              style={{ maxWidth: '100%' }}
              defaultCountry="LK"
              placeholder="Enter phone number"
              value={phone}
              onChange={setPhone}
            />

            {errorphone && <p style={{ color: "red" }}>{errorphone}</p>}

            {/* <button onClick={validatePhone}>Submit</button> */}
          </div>

        </div>
        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>
          <div className="col-sm-6">
            <div className="form-group">
              <label>Dates of Stay</label>
              <div className="input-group">
                <input
                  type="date"
                  style={{ backgroundColor: "darkslategrey", color: "white" }}
                  className="form-control"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
                <span className="input-group-text">to</span>
                <input
                  type="date"
                  style={{ backgroundColor: "darkslategrey", color: "white" }}
                  className="form-control"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
              <label>Room Number</label>
              <input
                type="text"
                className="form-control"
                value={roomNumber}
                onChange={(event) => setRoomNumber(event.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="row">
            <div className="col-sm-6">
            <div className="form-group mt-3">
            <button className="btn btn-primary">Add Guest</button>
            </div>
            </div>
            <div className="col-sm-6">
            <div className="form-group mt-3">
            {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
            {message && <div className="alert alert-success mt-3" role="alert">{message}</div>}
            </div>            
            </div>
        </div>
      </form>
      <GuestList />
      </div>
      <footer className="bg-dark text-white p-3">
        <p>&copy; 2025</p>
      </footer>
    </div>
  );
};

export default AddGuest;
