import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import VendorSignup from './pages/admin/VendorSignup';
import VendorLogin from './pages/admin/VendorLogin';
import UserSignup from './pages/User/UserSignup';
import UserLogin from './pages/User/UserLogin';
import Halldetails from './pages/admin/Halldetails';
import VendorHomePage from './pages/admin/vendorhomepage';
import Payment from "./pages/admin/Payment";
import Dashboard from './pages/Superadmin/Dashboard';
import MoreHallDetails from './pages/Superadmin/MoreHallDetails';
import RefundPage from "./pages/Superadmin/RefundPage";
import Home from './pages/Home/home';
import ForgotPassword from './Components/ForgotPassword';
import ForgotPasswordVendor from './Components/ForgotPasswordVendor';
import ProtectedRoute from './Components/protected/ProtectedRoute';
import RedirectRoute from './Components/protected/RedirectRoute';
import HomeDetails from './pages/Home/homedetails';
import UserPayment from './pages/User/UserPayment';
import HallBooking from './pages/User/HallBooking';
import AdminSignin from './pages/Superadmin/adminLogin';
import UserDashboard from './pages/User/UserDashboard';

import Navbar from './pages/Home/Navbar'; // Make sure Navbar includes theme toggle
import { ThemeProvider, useTheme } from './context/ThemeContext'; // Custom theme context

import './App.css';
import './index.css';

// ✅ Separate component to access theme context inside ThemeProvider
const AppWrapper = () => {
  const { theme } = useTheme();

  return (
    <div className={theme}> {/* Light/Dark class applied here globally */}
      <BrowserRouter>
        {/* <Navbar /> */}

        <Routes>
          {/* Public routes */}
          <Route element={<RedirectRoute />}>
            <Route path="/adminlogin" element={<AdminSignin />} />
            <Route path="/userlogin" element={<UserLogin />} />
            <Route path="/usersignup" element={<UserSignup />} />
            <Route path="/vendorsignup" element={<VendorSignup />} />
            <Route path="/vendorlogin" element={<VendorLogin />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/forgotpasswordvendor" element={<ForgotPasswordVendor />} />
          </Route>

          {/* User routes */}
          <Route element={<ProtectedRoute role="user" />}>
            <Route path="/userdashboard" element={<UserDashboard />} />
            <Route path="/hallbooking" element={<HallBooking />} />
            <Route path="/userpayment" element={<UserPayment />} />
          </Route>

          {/* Vendor routes */}
          <Route element={<ProtectedRoute role="vendor" />}>
            <Route path="/vendorhomepage" element={<VendorHomePage />} />
            <Route path="/halldetails" element={<Halldetails />} />
            <Route path="/payment" element={<Payment />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hall-details/:hallId" element={<MoreHallDetails />} />
            <Route path="/refund/:hallId" element={<RefundPage />} />
          </Route>

          {/* Public homepage routes */}
          <Route path="/" element={<Home />} />
          <Route path="/homedetails" element={<HomeDetails />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppWrapper />
    </ThemeProvider>
  );
}

export default App;
