import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VendorSignup from './pages/admin/VendorSignup';
import VendorLogin from './pages/admin/VendorLogin';
import UserSignup from './pages/User/UserSignup';
import UserLogin from './pages/User/UserLogin';
import UserProfile from './pages/User/UserProfile';
import Home from './pages/Home/home';
import Navbar from './pages/Home/Navbar';
import HallBooking from './pages/User/HallBooking';
import './App.css';
import HomeDetails from './pages/Home/homedetails';
import UserPayment from './pages/User/UserPayment';
// import FilterComponent from './Components/FilterComponent';
import Footer from './pages/Home/Footer'
// import HallRegistration from './pages/admin/HallRegistration';
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/VendorSignup" element={<VendorSignup />} />
        <Route path="/VendorLogin" element={<VendorLogin />} />
        <Route path="/UserSignup" element={<UserSignup />} />
        <Route path="/UserLogin" element={<UserLogin />} />
        <Route path='/UserProfile' element={<UserProfile/>}/>
        <Route path="/HomeDetails" element={<HomeDetails />} />
        <Route path="/HallBooking" element={<HallBooking />} />
        <Route path='/UserPayment' element={<UserPayment/>}/>
        {/* <Route path='/FilterComponent' element={<FilterComponent/>}/> */}
        {/* <Route path="/HallRegistration" element={<HallRegistration />} /> */}
      </Routes>
      <Footer/>
    </BrowserRouter>
  );
}

export default App;