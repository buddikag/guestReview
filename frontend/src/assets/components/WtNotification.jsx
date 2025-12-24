import React, { useState } from 'react';

const WhatsAppButton = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [message, setMessage] = useState('Hello World!');

  const sendWhatsApp = () => {
    // Regex to remove non-alphanumeric characters for a clean number
    let number = mobileNumber.replace(/[^\\w\\s]/gi, "").replace(/ /g, "");
    // URI encode the message
    let encodedMessage = encodeURI(message);
    // Construct the full URL
    let url = `https://wa.me/${number}?text=${encodedMessage}`;
//https://wa.me/+94704481212?text=Hello+World%21&type=custom_url&app_absent=0
    // Open the URL in a new tab
    window.open(url, '_blank');
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter phone number (e.g., 12127365000)"
        value={mobileNumber}
        onChange={(e) => setMobileNumber(e.target.value)}
      />
      <button onClick={sendWhatsApp}>
        Send Message via WhatsApp
      </button>
    </div>
  );
};

export default WhatsAppButton;