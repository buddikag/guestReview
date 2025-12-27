import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import MainNavigation from "./MainNavigation.jsx";
const ListFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}simplewtstar/`, { headers: { 'Access-Control-Allow-Origin': '*' } })
      .then(response => setFeedbacks(response.data))
      .catch(error => console.log(error));
  }, []);
//   console.log(feedbacks);
  return (
    <div className="w-full bg-gray-200">
      <header className="bg-dark text-white w-100vw">
        <MainNavigation />
      </header>
      <div className="container mt-4 mb-5">
        <div className="bred-crumb">
            <Link to="/" className="text-dark text-decoration-none">Home</Link> <span className="color-red">/ List Feedback</span>
        </div>
      </div>
      <div className="container mt-4 mb-5">
      <h2 className="text-center">List of all Feedback</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Guest Name</th>
            <th>Feedback</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((data, index) => {
            return (
              <tr key={data.rating}>
                <td>
                  <span className="text-lg font-bold">{data.name}</span> <span className="text-sm">{data.rating} starts</span>
                </td>
                <td>
                  <span className="truncate">
                    {data.comment.substring(0, 50)}
                  </span>
                  {data.comment.length > 50 && (
                    <span className="more" onClick={(e) => {
                      e.preventDefault();
                      alert(data.comment);
                    }}>
                      <span className="text-blue" style={{ color: "blue", cursor: "pointer", textDecoration: "underline", fontSize: "12px" }}> More</span>
                    </span>
                  )}
                </td> 
                <td>
                    <span className="text-lg font-bold">{'⭐'.repeat(data.rating)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4">
      <nav className="flex justify-center mt-5">
        <ul className="pagination">
          {[...Array(5)].map((v, i) => {
            return (
              <li className="page-item text-black" key={i}>
                <Link to={`/listfeedback/${i+1}`} className={`${i === 0 ? "bg-gray-900" : ""} px-3 py-2 rounded-md text-black`}>{i+1}</Link>
              </li>
            );
          })}
        </ul>
      </nav>
      </div>
      </div>
    </div>
  );
};

export default ListFeedback;
