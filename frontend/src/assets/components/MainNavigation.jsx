import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
const MainNavigation = () => {
  return (
    <div className="container-fluid p-0 m-0" >
    <nav className="navbar navbar-expand-lg navbar-light bg-gray-800">
      <div className="container">
        <Link className="navbar-brand text-white" to="/">
          GSS
        </Link>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/createGuest">
                Guests
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/listfeedback">
                List Feedback
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    </div>
  );
};

export default MainNavigation;
