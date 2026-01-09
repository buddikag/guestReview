import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext';

import Home from "./assets/components/Home.jsx";
import AddGuest from "./assets/components/AddGuest.jsx";
import UpdateGuest from "./assets/components/UpdateGuest.jsx";
import ReadGuest from "./assets/components/ReadGuest.jsx";
import WtNotification from "./assets/components/WtNotification.jsx";
import SimpleWtStar from "./assets/components/surveys/SimpleWtStar.jsx";
import ListFeedback from "./assets/components/ListFeedback.jsx";
import Login from "./assets/components/Login.jsx";
import UserManagement from "./assets/components/UserManagement.jsx";
import HotelManagement from "./assets/components/HotelManagement.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import './bootstrap-overrides.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
          <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/createGuest" 
                element={
                  <ProtectedRoute>
                    <AddGuest />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/read/:id" 
                element={
                  <ProtectedRoute>
                    <ReadGuest/>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/updateGuest/:guestid" 
                element={
                  <ProtectedRoute>
                    <UpdateGuest/>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wtnotification" 
                element={
                  <ProtectedRoute>
                    <WtNotification/>
                  </ProtectedRoute>
                } 
              />
              <Route path="/simplewtstar/review" element={<SimpleWtStar/>} />
              <Route 
                path="/listfeedback" 
                element={
                  <ProtectedRoute>
                    <ListFeedback/>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute requireSuperAdmin={true}>
                    <UserManagement/>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hotels" 
                element={
                  <ProtectedRoute requireSuperAdmin={true}>
                    <HotelManagement/>
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}


export default App