import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import MainNavigation from "./MainNavigation.jsx";
import axios from "axios";
const UpdateGuest = (props) => {
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); 
    const { guestid } = useParams();
    const [guestName, setGuestName] = useState('');
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
      return;
    };  
  
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}getGuest/${guestid}`, { headers: { 'Access-Control-Allow-Origin': '*' } })
      .then(response => {
        setGuestName(response.data.name);
        setPhone(response.data.phone);
        setEmail(response.data.email);
        setStartDate(response.data.startDate);
        setEndDate(response.data.endDate);
        setRoomNumber(response.data.roomNumber);
      })
      .catch(error => console.log(error));
  }, []);

  const handleSubmit = (event) => {
    setError('');
    setMessage('');
    validatePhone();
    event.preventDefault();
    const data = {
      id: guestid,
      name: guestName,
      phone: phone,
      email: email,
      startDate: startDate,
      endDate: endDate,
      roomNumber: roomNumber,
    };
    axios.put(`${import.meta.env.VITE_API_URL}update/${guestid}`, data)
      .then(response => {
        // location.reload();
        setMessage(response.data['Message']);
        props.history.push('/');
      })
        .catch(error => {
            console.log(error.response.data['Message']);
            setError(error.response.data['Message']);
        });
  };

  return (
    <div className="w-full bg-gray-200">
      <header className="bg-dark text-white p-3 w-100vw">
        <MainNavigation />
      </header>
      <div className="container mt-4 mb-5">
        <div className="bred-crumb">
            <Link to="/" className="text-dark text-decoration-none">Home</Link>
            <Link to="/createGuest" className="text-dark text-decoration-none mx-2">/Add Guest</Link> / Update Guest
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
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
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
          <div className="col-sm-6 mt-3">
            <div className="form-group">
              <label>Email</label>
              <input
                type="text"
                className="form-control"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>
          <div className="col-sm-6 mt-3">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate ? new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(startDate)) : ''}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
          </div>
          <div className="col-sm-6 mt-3">
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate ? new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(endDate)) : ''}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>
          <div className="col-sm-6 mt-3">
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
            <button type="submit" className="btn btn-primary w-100">Update</button>
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
    </div>
      <footer className="bg-dark text-white p-3">
        <p>&copy; 2025</p>
      </footer>
    </div>
  );
}

export default UpdateGuest;