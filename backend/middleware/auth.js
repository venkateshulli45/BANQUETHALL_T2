import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Middleware for User Authentication
export const userAuth = (req, res, next) => {
  const token = req.cookies.authToken;
    console.log(token);
  if (!token) return res.status(401).json({ message: "Unauthorized - No User Token" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    if (decoded.role !== "user") return res.status(403).json({ message: "Forbidden - Not a User" });

    req.user = decoded;
    console.log("✅ Token verified. User:", decoded);
    next();
  });
};

// Middleware for Vendor Authentication
export const vendorAuth = (req, res, next) => {
  const token = req.cookies.vendorToken;
  if (!token) return res.status(401).json({ message: "Unauthorized - No Vendor Token" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    if (decoded.role !== "vendor") return res.status(403).json({ message: "Forbidden - Not a Vendor" });

    req.vendor = decoded;
    console.log("✅ Token verified. User:", decoded);
    next();
  });
};

