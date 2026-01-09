import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import axios from "axios";
import { Link } from "react-router-dom";
import GuestList from "./GuestList.jsx";
import MainNavigation from "./MainNavigation.jsx";
import { useAuth } from "../../contexts/AuthContext";

const AddGuest = () => {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [hotelId, setHotelId] = useState('');
  const [hotels, setHotels] = useState([]);

  const [phoneno, setPhoneno] = useState("");
  const [errorphone, setErrorphone] = useState("");
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    // Fetch user's hotels
    const fetchHotels = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_API_URL+'api/hotels');
        setHotels(response.data);
        // Auto-select first hotel if only one
        if (response.data.length === 1) {
          setHotelId(response.data[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching hotels:', error);
      }
    };
    fetchHotels();
  }, []);

  const validatePhone = () => {
    if (!phone || !isValidPhoneNumber(phone)) {
      setErrorphone("Please enter a valid phone number");
      return;
    }
    setErrorphone("");
    // alert("Valid phone: " + phone);
  };

  const validateAndAdjustDates = (newStartDate, newEndDate) => {
    setDateError("");
    
    if (!newStartDate && !newEndDate) {
      return { start: newStartDate, end: newEndDate };
    }

    if (newStartDate && newEndDate) {
      const start = new Date(newStartDate);
      const end = new Date(newEndDate);
      
      if (end < start) {
        // Auto-adjust: set end date to start date + 1 day
        const adjustedEndDate = new Date(start);
        adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
        const adjustedEndDateString = adjustedEndDate.toISOString().split('T')[0];
        setDateError("End date must be greater than start date. Adjusted to " + adjustedEndDateString);
        return { start: newStartDate, end: adjustedEndDateString };
      }
    }

    return { start: newStartDate, end: newEndDate };
  };

  const handleStartDateChange = (event) => {
    const newStartDate = event.target.value;
    setStartDate(newStartDate);
    
    if (newStartDate && endDate) {
      const result = validateAndAdjustDates(newStartDate, endDate);
      setEndDate(result.end);
    }
  };

  const handleEndDateChange = (event) => {
    const newEndDate = event.target.value;
    
    if (startDate && newEndDate) {
      const result = validateAndAdjustDates(startDate, newEndDate);
      setEndDate(result.end);
    } else {
      setEndDate(newEndDate);
    }
  };

  const handleSubmit = (event) => {
    setError('');
    setMessage('');
    setDateError('');
    event.preventDefault();
    validatePhone();
    
    // Validate hotel selection
    let selectedHotelId = hotelId;
    if (!selectedHotelId && hotels.length > 0) {
      // Auto-select first hotel if only one hotel available
      if (hotels.length === 1) {
        selectedHotelId = hotels[0].id.toString();
        setHotelId(selectedHotelId);
      } else {
        setError('Please select a hotel');
        return;
      }
    }

    if (!selectedHotelId) {
      setError('No hotel available. Please contact administrator.');
      return;
    }

    // Final date validation before submit
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        setDateError("End date must be greater than start date");
        return;
      }
    }
    
    const data = {
      name,
      phone,
      email,
      startDate,
      endDate,
      roomNumber,
      hotelId: parseInt(selectedHotelId),
    };
    axios.post(`${import.meta.env.VITE_API_URL}add`, data)
      .then(response => {
        setMessage(response.data['Message']);
        setName('');
        setPhone('');
        setEmail('');
        setStartDate('');
        setEndDate('');
        setRoomNumber('');
        setHotelId(hotels.length === 1 ? hotels[0].id.toString() : '');
        setError('');
        setDateError('');
        location.reload();
        //GuestList.fetchGuests(1);
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
      <div className="container" style={{ 
        marginTop: 'var(--spacing-section-margin)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <div className="bred-crumb">
            <Link to="/" className="text-dark text-decoration-none" style={{ color: 'var(--color-primary)' }}>Home</Link> 
            <span style={{ color: 'var(--color-secondary)', marginLeft: 'var(--spacing-sm)' }}>/ Add Guest</span>
        </div>
      </div>
      <div className="container" style={{ 
        marginTop: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-section-margin)'
      }}>
      <div className="card" style={{
        boxShadow: 'var(--shadow-card)',
        padding: 'var(--spacing-card-padding)',
        marginBottom: 'var(--spacing-section-margin)'
      }}>
      <form onSubmit={handleSubmit} className="add-guest-form">
        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
              <label style={{ color: '#000000', fontWeight: 300 }}>Name</label>
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
              <label style={{ color: '#000000', fontWeight: 300 }}>Phone Number</label>
              <PhoneInput
                style={{ maxWidth: '100%' }}
                defaultCountry="LK"
                placeholder="Enter phone number"
                value={phone}
                onChange={setPhone}
              />
              {errorphone && <p style={{ color: "var(--color-danger)", marginTop: "8px", fontWeight: 500 }}>{errorphone}</p>}
            </div>
            {/* <button onClick={validatePhone}>Submit</button> */}
          </div>

        </div>
        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
              <label style={{ color: '#000000', fontWeight: 300 }}>Email</label>
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
              <label style={{ color: '#000000', fontWeight: 300 }}>Dates of Stay</label>
              <div className="row">
                <div className="col-6" style={{ position: 'relative' }}>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={handleStartDateChange}
                    style={{ 
                      color: startDate ? 'inherit' : 'transparent'
                    }}
                  />
                  {!startDate && (
                    <span style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: '#6c757d',
                      fontSize: '1rem'
                    }}>From Date</span>
                  )}
                </div>
                <div className="col-6" style={{ position: 'relative' }}>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={handleEndDateChange}
                    min={startDate || undefined}
                    style={{ 
                      color: endDate ? 'inherit' : 'transparent'
                    }}
                  />
                  {!endDate && (
                    <span style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: '#6c757d',
                      fontSize: '1rem'
                    }}>To Date</span>
                  )}
                </div>
              </div>
              {dateError && (
                <p style={{ color: dateError.includes("Adjusted") ? "var(--color-warning)" : "var(--color-danger)", marginTop: "8px", fontWeight: 500, fontSize: "0.875rem" }}>
                  {dateError}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
              <label style={{ color: '#000000', fontWeight: 300 }}>Hotel {hotels.length > 1 && <span style={{ color: 'var(--color-danger)' }}>*</span>}</label>
              <select
                className="form-control"
                value={hotelId}
                onChange={(event) => setHotelId(event.target.value)}
                required={hotels.length > 1}
              >
                <option value="">Select a hotel</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id.toString()}>
                    {hotel.name}
                  </option>
                ))}
              </select>
              {hotels.length === 0 && (
                <p style={{ color: "var(--color-warning)", marginTop: "8px", fontWeight: 500, fontSize: "0.875rem" }}>
                  No hotels available. Please contact administrator.
                </p>
              )}
            </div>
          </div>
          <div className="col-sm-6">
            <div className="form-group">
              <label style={{ color: '#000000', fontWeight: 300 }}>Room Number</label>
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
            <div className="form-group" style={{ marginTop: 'var(--spacing-lg)' }}>
            <button className="btn btn-primary">Add Guest</button>
            </div>
            </div>
            <div className="col-sm-6">
            <div className="form-group" style={{ marginTop: 'var(--spacing-lg)' }}>
            {error && <div className="alert alert-danger" role="alert" style={{ marginTop: 'var(--spacing-md)' }}>{error}</div>}
            {message && <div className="alert alert-success" role="alert" style={{ marginTop: 'var(--spacing-md)' }}>{message}</div>}
            </div>            
            </div>
        </div>
      </form>
      </div>
      <GuestList />
      </div>
      <footer className="bg-dark text-white" style={{ 
        background: 'var(--color-primary)',
        marginTop: 'var(--spacing-3xl)',
        padding: 'var(--spacing-xl)',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: 'var(--text-light)' }}>&copy; 2025 Guest Review System</p>
      </footer>
    </div>
  );
};

export default AddGuest;
