import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCookie } from '../../Utils/auth';
import { jwtDecode } from "jwt-decode"; // Updated import for jwt-decode

const RedirectRoute = () => {
  const userToken = getCookie("authToken");
  const vendorToken = getCookie("vendorToken");
  const adminToken = getCookie("adminToken");

  // Check if the token exists and is a valid string
  if ((userToken && typeof userToken === "string") || (vendorToken && typeof vendorToken === "string")) {
    return <Navigate to={userToken ? "/userdashboard" : "/vendorhomepage"} replace />;
  }
  if(adminToken && typeof adminToken == "string"){
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RedirectRoute;
