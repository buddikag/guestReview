import {BrowserRouter, Routes, Route} from 'react-router-dom'

import Home from "./assets/components/Home.jsx";
import AddGuest from "./assets/components/AddGuest.jsx";
import UpdateGuest from "./assets/components/UpdateGuest.jsx";
import WtNotification from "./assets/components/WtNotification.jsx";
import SimpleWtStar from "./assets/components/surveys/SimpleWtStar.jsx";
import ListFeedback from "./assets/components/ListFeedback.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import './bootstrap-overrides.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {

  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/createGuest" element={<AddGuest />} />
            <Route path="/updateGuest/:guestid" element={<UpdateGuest/>} />
            <Route path="/wtnotification" element={<WtNotification/>} />
            <Route path="/simplewtstar/review" element={<SimpleWtStar/>} />
            <Route path="/listfeedback" element={<ListFeedback/>} />
        </Routes>
    </BrowserRouter>
  )
}


export default App