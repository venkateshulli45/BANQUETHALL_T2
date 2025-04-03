import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCookie } from '../../Utils/auth';
import { jwtDecode } from "jwt-decode"; // Ensure correct import

const ProtectedRoute = ({ role }) => {
    const userToken = getCookie("authToken") || null;
    const vendorToken = getCookie("vendorToken") || null;

    // If no valid token exists, redirect
    if (role === "user" && !userToken) {
        return <Navigate to="/userlogin" replace />;
    }
    if (role === "vendor" && !vendorToken) {
        return <Navigate to="/vendorlogin" replace />;
    }

    try {
        // Decode only if token exists and is a valid string
        if (role === "user" && typeof userToken === "string" && userToken.trim() !== "") {
            jwtDecode(userToken);
        }
        if (role === "vendor" && typeof vendorToken === "string" && vendorToken.trim() !== "") {
            jwtDecode(vendorToken);
        }
    } catch (error) {
        console.error("Error decoding token:", error);
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
