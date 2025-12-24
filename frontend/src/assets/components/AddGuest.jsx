import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import GuestList from "./GuestList.jsx";
import MainNavigation from "./MainNavigation.jsx";

const AddGuest = () => {
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roomNumber, setRoomNumber] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
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
        alert('Guest added successfully!');
        setName('');
        setPhone('');
        setEmail('');
        setStartDate('');
        setEndDate('');
        setRoomNumber('');
        // location.reload();
      })
        .catch(error => {
            console.log(error.response.data['Message']);
            setError(error.response.data['Message']);
        });
  };

  return (
    <div className="w-full bg-gray-200">
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
          <div className="col-sm-6">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                className="form-control"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
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
            <p className="text-danger">{error}</p>
            </div>            
            </div>
        </div>

        <GuestList />
      </form>
      </div>
      <footer className="bg-dark text-white p-3 fixed-bottom">
        <p>&copy; 2025</p>
      </footer>
    </div>
  );
};

export default AddGuest;
