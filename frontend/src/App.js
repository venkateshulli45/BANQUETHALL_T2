import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VendorSignup from './pages/admin/VendorSignup';
import VendorLogin from './pages/admin/VendorLogin';
import UserSignup from './pages/User/UserSignup';
import UserLogin from './pages/User/UserLogin';
import Halldetails from './pages/admin/Halldetails';
import VendorHomePage from './pages/admin/vendorhomepage';
import Payment from "./pages/admin/Payment.js";
import Dashboard from './pages/Superadmin/Dashboard';
import MoreHallDetails from './pages/Superadmin/MoreHallDetails';
import RefundPage from "./pages/Superadmin/RefundPage"; // Import RefundPage
import Home from './pages/Home/home.js';
import ForgotPassword from './Components/ForgotPassword';
import ForgotPasswordVendor from './Components/ForgotPasswordVendor';
import ProtectedRoute from './Components/protected/ProtectedRoute.js';
import RedirectRoute from './Components/protected/RedirectRoute.js';

import HomeDetails from './pages/Home/homedetails';
import UserPayment from './pages/User/UserPayment';
// import UserProfile from './pages/User/UserProfile';
import HallBooking from './pages/User/HallBooking';

import UserDashboard from './pages/User/UserDashboard';
import './App.css';



function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route element={<RedirectRoute />}>
          <Route path="/userlogin" element={<UserLogin />} />
          <Route path="/usersignup" element={<UserSignup />} />
          <Route path="/VendorSignup" element={<VendorSignup />} />
          <Route path="/VendorLogin" element={<VendorLogin />} />
          <Route path='/forgotpassword' element={<ForgotPassword/>}/>
          <Route path='/forgotpasswordvendor' element={<ForgotPasswordVendor/>}/>
        </Route>

        <Route element={<ProtectedRoute role="user" />}>
          <Route path="/userdashboard" element={<UserDashboard />} />
          {/* <Route path='/UserProfile' element={<UserProfile/>}/> */}
          <Route path="/HallBooking" element={<HallBooking />} />
          <Route path='/UserPayment' element={<UserPayment/>}/>
        </Route>

        <Route element={<ProtectedRoute role="vendor" />}>
          <Route path="/vendorhomepage" element={<VendorHomePage />} />
          <Route path="/Halldetails" element={<Halldetails />} />
        </Route>
        
        
        
        
      
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/payment" element={<Payment />} />
        <Route path="/hall-details/:hallId" element={<MoreHallDetails />} />
        <Route path="/refund/:hallId" element={<RefundPage />} />  {/* Refund Page Route */}
        
       

        <Route path="/" element={<Home />} />
        {/* <Route path="/VendorSignup" element={<VendorSignup />} />
        <Route path="/VendorLogin" element={<VendorLogin />} />
        <Route path="/UserSignup" element={<UserSignup />} />
        <Route path="/UserLogin" element={<UserLogin />} /> */}
        <Route path="/HomeDetails" element={<HomeDetails />} />
        
        {/* <Route path='/FilterComponent' element={<FilterComponent/>}/> */}
        {/* <Route path="/HallRegistration" element={<HallRegistration />} /> */}
        {/* <Route path="Homes" element={<Homes />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;