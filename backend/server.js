// server.js
import express from 'express';
import { db } from './config/db.js';
import Stripe from "stripe";
import { 
  createSignupTable,
  createSignupTableForBusiness,
  createBankDetailsTable,
  createFunctionHallsTable,
  createPaymentTable,
  createNotificationsTable,
  createRefundTable,
  createHallAvailabilityTable,
  createBookingTable3,
  createUserPaymentTable,
  createUserHallBookings
} from './models/signup.model.js';
import cors from "cors";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import { serialize } from "cookie";
import { userAuth, vendorAuth } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import vendorAuthRoutes from './routes/vendorAuthRoutes.js';
import forgotPasswordRoutes from'./routes/forgotPasswordRoutes.js';
import forgotPasswordVendorRoutes from './routes/forgotPasswordVendorRoutes.js';
import { format } from "date-fns";


dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true })); // ✅ Adjust the frontend origin
app.use(express.json()); // ✅ Parse JSON requests

//fetching user details
app.get("/api/users/:email", async (req, res) => {
  const email = req.params.email;
  const [user] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
  if (user.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user[0]);
});


// UPDATE user profile by email
app.put("/api/users/:email", async (req, res) => {
  const { email } = req.params; // Extract email from URL
  const { username, phone } = req.body; // Get data from request body

  if (!username || !phone) {
    return res.status(400).json({ success: false, message: "Username and phone are required" });
  }

  try {
    // Update user details in MySQL
    const [result] = await db.promise().query(
      "UPDATE users SET username = ?, phone = ? WHERE email = ?",
      [username, phone, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Profile updated successfully" });

  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ success: false, message: "Server error updating profile" });
  }
});

app.get("/api/user/protected-route", userAuth, (req, res) => {
  res.json({ message: "User Access Granted", user: req.user });
});

// Protected Vendor Route
app.get("/api/vendor/protected-route", vendorAuth, (req, res) => {
  res.json({ message: "Vendor Access Granted", vendor: req.vendor });
});
app.use("/api/auth", authRoutes);
app.use("/api/vendorAuth", vendorAuthRoutes);
app.use("/api/forgotPassword", forgotPasswordRoutes);
app.use("/api/forgotPasswordVendor", forgotPasswordVendorRoutes);


// User Signup API
// app.post("/api/users", (req, res) => {
//   console.log("Received POST request at /api/users");
//   console.log("Request body:", req.body);

//   const { username, email, phone, password } = req.body;
//   if (!username || !email || !phone || !password) {
//       console.log("Missing fields in request body");
//       return res.status(400).json({ success: false, message: "Please provide all fields" });
//   }

//   const sql = "INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?)";
  
//   db.query(sql, [username, email, phone, password], (err, result) => {
//       if (err) {
//           console.error("Error inserting user into database:", err);
//           return res.status(500).json({ success: false, message: "Database error", error: err.message });
//       }

//       console.log("User inserted successfully with ID:", result.insertId);
//       res.status(201).json({
//           success: true,
//           data: { id: result.insertId, username, email, phone }
//       });
//   });
// });





// //vendor sign up
// app.post("/api/business", (req, res) => {
//     console.log("Received POST request at /api/business");
//     console.log("Request body:", req.body);

//     const { vendorName, brandName, city, email, phone, password } = req.body;

//     if (!vendorName || !brandName || !city || !email || !phone || !password) {
//         console.log("Missing fields in request body");
//         return res.status(400).json({ success: false, message: "Please provide all fields" });
//     }

//     const sql = "INSERT INTO business (vendor_name, brand_name, city, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)";
    
//     db.query(sql, [vendorName, brandName, city, email, phone, password], (err, result) => {
//         if (err) {
//             console.error("Error inserting business:", err);
//             return res.status(500).json({ success: false, message: "Server Error" });
//         }

//         console.log("Business inserted successfully with ID:", result.insertId);
//         res.status(201).json({
//             success: true,
//             data: { id: result.insertId, vendorName, brandName, city, email, phone }
//         });
//     });
// });

// //vendor login
// app.post("/api/vendor-login", (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ success: false, message: "Please provide email and password" });
//     }

//     const sql = "SELECT * FROM business WHERE email = ? AND password = ?";
//     db.query(sql, [email, password], (err, results) => {
//         if (err) {
//             console.error("Error querying database:", err);
//             return res.status(500).json({ success: false, message: "Server Error" });
//         }

//         if (results.length > 0) {
//             const vendor = results[0];

//             res.json({
//                 success: true,
//                 message: "Login successful",
//                 vendor: {
//                     id: vendor.id, // Ensure 'id' exists in the database
//                     vendorName: vendor.vendor_name,
//                     brandName: vendor.brand_name,
//                     city: vendor.city,
//                     email: vendor.email,
//                     phone: vendor.phone
//                 }
//             });
//         } else {
//             res.status(401).json({ success: false, message: "Invalid email or password" });
//         }
//     });
// });



// //User Login API
// app.post("/api/login", (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ success: false, message: "Please provide email and password" });
//     }

//     const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
//     db.query(sql, [email, password], (err, results) => {
//         if (err) {
//             console.error("Error querying database:", err);
//             return res.status(500).json({ success: false, message: "Server Error" });
//         }

//         if (results.length > 0) {
//             res.json({ success: true, message: "Login successful", user: results[0] });
//         } else {
//             res.status(401).json({ success: false, message: "Invalid email or password" });
//         }
//     });
// });


app.post("/api/users", (req, res) => {
  console.log("Received POST request at /api/users");
  console.log("Request body:", req.body);

  const { username, email, phone, password } = req.body;
  if (!username || !email || !phone || !password) {
      console.log("Missing fields in request body");
      return res.status(400).json({ success: false, message: "Please provide all fields" });
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
          success: false,
          message: "Invalid mobile number. Must be 10 digits and start with 6-9."
      });
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/.test(password)) {
      return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character."
      });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = "INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?)";

  db.query(sql, [username, email, phone, hashedPassword], (err, result) => {
      if (err) {
          console.error("Error inserting user into database:", err);
          return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      console.log("User inserted successfully with ID:", result.insertId);
      res.status(201).json({
          success: true,
          data: { id: result.insertId, username, email, phone }
      });
  });
});


app.post("/api/vendor", (req, res) => {
  console.log("Received POST request at /api/business");
  console.log("Request body:", req.body);

  const { vendorName, city , email, phone, password } = req.body;

  if (!vendorName || !city || !email || !phone || !password) {
      console.log("Missing fields in request body");
      return res.status(400).json({ success: false, message: "Please provide all fields" });
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
          success: false,
          message: "Invalid mobile number. Must be 10 digits and start with 6-9."
      });
  }
  
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/.test(password)) {
    return res.status(400).json({
        success: false,
        message: "Password must be 8+ characters with uppercase, lowercase, number, and special character.",
    });
 }
  
  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = "INSERT INTO business (vendor_name, city, email, phone, password) VALUES (?, ?, ?, ?, ?)";
  
  db.query(sql, [vendorName,city , email, phone, hashedPassword], (err, result) => {
      if (err) {
          console.error("Error inserting business:", err);
          return res.status(500).json({ success: false, message: "Server Error" });
      }
      console.log("Business inserted successfully with ID:", result.insertId);
      res.status(201).json({
          success: true,
          data: { id: result.insertId, vendorName, email, phone }
      });
  });
});

app.post("/api/vendor-login", async(req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
  }

  try {
      // Query user by email only (DO NOT include password in SQL query)
      const [ results ] = await db.promise().execute("SELECT * FROM business WHERE email = ?", [email]);

      if (results.length === 0) {
          return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      const user = results[0];

      // Compare hashed password
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
          return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
          { id: user.id, email: user.email, name:user.vendor_name ,phone:user.phone, city:user.city, role:'vendor'},
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
      );
      console.log("Generated JWT token:", token);

      // Set HTTP-only cookie
      const cookieOption = serialize("vendorToken", token, {
          httpOnly: false,
          secure: false, // Set to false for development
          sameSite: "strict",
          path: "/",
          maxAge: 3600,
      });

      res.setHeader("Set-Cookie", [cookieOption]);
      console.log("Set-Cookie header:", cookieOption); // Log the Set-Cookie header for debugging
      return res.json({ success: true, message: "Login successful", vendor: user, token });

  } catch (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.post("/api/user-login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
  }

  try {
      // Query user by email only (DO NOT include password in SQL query)
      const [ results ] = await db.promise().execute("SELECT * FROM users WHERE email = ?", [email]);

      if (results.length === 0) {
          return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      const user = results[0];

      // Compare hashed password
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
          return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
          { id: user.id, email: user.email, name:user.username, phone:user.phone, role: "user" },

          process.env.JWT_SECRET,
          { expiresIn: "1h" }
      );
      console.log("Generated JWT token:", token);

      // Set HTTP-only cookie
      const cookieOption = serialize("authToken", token, {
          httpOnly: false,
          secure: false, // Set to false for development
          sameSite: "strict",
          path: "/",
          maxAge: 3600,
      });

      res.setHeader("Set-Cookie", [cookieOption]);
      console.log("Set-Cookie header:", cookieOption); // Log the Set-Cookie header for debugging
      return res.json({ success: true, message: "Login successful", user, token });

  } catch (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ success: false, message: "Server Error" });
  }
});
app.post("/api/logout", (req, res) => {
  res.clearCookie("authToken");
  res.clearCookie("vendorToken");
  res.json({ message: "Logged out successfully" });
});

// Admin login endpoint
app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
  
    if (email === "admin@example.com" && password === "admin123") {
      return res.status(200).json({ message: "Login successful" });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  });
  

app.get("/api/vendor/:id", (req, res) => {
    const vendorId = req.params.id;

    const sql = "SELECT * FROM business WHERE id = ?";
    db.query(sql, [vendorId], (err, results) => {
        if (err) {
            console.error("Error fetching vendor details:", err);
            return res.status(500).json({ success: false, message: "Server Error" });
        }

        if (results.length > 0) {
            res.json({
                success: true,
                vendor: results[0] // Send vendor details
            });
        } else {
            res.status(404).json({ success: false, message: "Vendor not found" });
        }
    });
});

app.put("/api/vendor/:id", (req, res) => {
    const vendorId = req.params.id;
    const { vendor_name,city, phone } = req.body;

    if (!vendor_name || !city || !phone) {
        return res.status(400).json({ success: false, message: "Please provide required fields " });
    }

    const sql = "UPDATE business SET vendor_name = ?, city = ?, phone = ? WHERE id = ?";

    db.query(sql, [vendor_name, city, phone, vendorId], (err, result) => {
        if (err) {
            console.error("Error updating vendor:", err);
            return res.status(500).json({ success: false, message: "Server Error" });
        }

        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Vendor profile updated successfully" });
        } else {
            res.status(404).json({ success: false, message: "Vendor not found" });
        }
    });
});


app.post("/api/add-bank-account", (req, res) => {
    console.log("Received POST request at /api/add-bank-account");
    console.log("Request body:", req.body);

    const { account_holder, account_number, ifsc_code, bank_name, email } = req.body;

    if (!email) {
        console.log("Missing email in request body");
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if bank details already exist for the given email
    const checkSql = "SELECT * FROM bank_details WHERE email = ?";
    db.query(checkSql, [email], (err, results) => {
        if (err) {
            console.error("Error checking bank details:", err);
            return res.status(500).json({ success: false, message: "Server Error" });
        }

        if (results.length > 0) {
            console.log("Bank details found. Proceeding with update.");

            // Ensure fields are properly checked
            let updateFields = [];
            let values = [];

            if (account_holder !== undefined && account_holder !== "") {
                updateFields.push("account_holder = ?");
                values.push(account_holder);
            }
            if (account_number !== undefined && account_number !== "") {
                updateFields.push("account_number = ?");
                values.push(account_number);
            }
            if (ifsc_code !== undefined && ifsc_code !== "") {
                updateFields.push("ifsc_code = ?");
                values.push(ifsc_code);
            }
            if (bank_name !== undefined && bank_name !== "") {
                updateFields.push("bank_name = ?");
                values.push(bank_name);
            }

            if (updateFields.length === 0) {
                console.log("No fields provided for update.");
                return res.status(400).json({ success: false, message: "No fields provided for update" });
            }

            values.push(email);
            const updateSql = `UPDATE bank_details SET ${updateFields.join(", ")} WHERE email = ?`;

            db.query(updateSql, values, (err, result) => {
                if (err) {
                    console.error("Error updating bank details:", err);
                    return res.status(500).json({ success: false, message: "Database update failed" });
                }

                console.log("Update result:", result);
                if (result.affectedRows > 0) {
                    console.log("Bank details updated successfully for email:", email);
                    res.status(200).json({ success: true, message: "Bank details updated successfully!" });
                } else {
                    console.log("No rows affected. Check if email exists.");
                    res.status(404).json({ success: false, message: "Bank details not found for the provided email." });
                }
            });
        } else {
            console.log("No existing bank details. Proceeding with insertion.");

            // Ensure all fields are provided for a new record
            if (!account_holder || !account_number || !ifsc_code || !bank_name) {
                console.log("Missing fields in request body");
                return res.status(400).json({ success: false, message: "Please provide all fields for new record" });
            }

            const insertSql = `
                INSERT INTO bank_details (account_holder, account_number, ifsc_code, bank_name, email)
                VALUES (?, ?, ?, ?, ?)
            `;
            db.query(insertSql, [account_holder, account_number, ifsc_code, bank_name, email], (err, result) => {
                if (err) {
                    console.error("Error inserting bank details:", err);
                    return res.status(500).json({ success: false, message: "Database insertion failed" });
                }

                console.log("Bank account added successfully with ID:", result.insertId);
                res.status(201).json({ success: true, message: "Bank account added successfully!" });
            });
        }
    });
});



app.get("/api/get-bank-details", (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    const sql = "SELECT account_holder, account_number, ifsc_code, bank_name FROM bank_details WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("Error fetching bank details:", err);
            return res.status(500).json({ success: false, message: "Server Error" });
        }

        if (results.length > 0) {
            res.json({ success: true, bankDetails: results[0] });
        } else {
            res.status(404).json({ success: false, message: "Bank details not found" });
        }
    });
});


// Configure uploads directory
const uploadDir = path.join(__dirname, '../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Uploads directory created');
}

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Serve static files
app.use('/uploads', express.static(uploadDir));

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    console.error('Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
  next();
});


// Updated hall registration endpoint
app.post("/api/halls/register", upload.array('images', 10), async (req, res) => {
  try {
    const { 
      vendor_email,
      hallName,
      city,
      location,
      capacity,
      price,
      description,
      services
    } = req.body;

    // Validate required fields
    if (!vendor_email || !hallName || !city || !location || !capacity || !price) {
      // Clean up uploaded files if validation fails
      if (req.files?.length) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    // Process uploaded files
    const images = req.files?.map(file => ({
      filename: file.filename,
      path: file.path,
      originalname: file.originalname
    })) || [];

    // Validate vendor exists
    const [vendorCheck] = await db.promise().query(
      "SELECT id FROM business WHERE email = ?", 
      [vendor_email]
    );
    
    if (!vendorCheck.length) {
      if (req.files?.length) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      return res.status(404).json({ 
        success: false, 
        message: "Vendor not found" 
      });
    }

    // Prepare data for database
    const servicesJson = typeof services === 'string' ? JSON.parse(services) : services || {};
    const imageNames = images.map(img => img.filename);

    const query = `
      INSERT INTO function_halls (
        vendor_email, hall_name, city, location, 
        capacity, price, description, services, images
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.promise().execute(query, [
      vendor_email,
      hallName,
      city,
      location,
      Number(capacity),
      Number(price),
      description,
      JSON.stringify(servicesJson),
      JSON.stringify(imageNames)
    ]);

    // Verify images were saved
    images.forEach(img => {
      if (!fs.existsSync(img.path)) {
        console.error(`Image not saved: ${img.path}`);
      }
    });

    res.status(201).json({
      success: true,
      message: "Hall registered successfully",
      hall_id: result.insertId,
      images: imageNames
    });

  } catch (error) {
    console.error("Error registering hall:", error);
    
    // Clean up uploaded files if error occurs
    if (req.files?.length) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message
    });
  }
});

// Fetch halls for a specific vendor
app.get("/api/halls/:vendorEmail", async (req, res) => {
  const { vendorEmail } = req.params;
  try {
    const [rows] = await db.promise().execute(`
      SELECT 
        id,
        vendor_email,
        hall_name,
        city,
        location,
        capacity,
        price,
        description,
        services,
        statusOfHall,
        JSON_ARRAYAGG(CONCAT('/uploads/', image)) as images
      FROM function_halls
      CROSS JOIN JSON_TABLE(
        images,
        '$[*]' COLUMNS (
          image VARCHAR(255) PATH '$'
        )
      ) AS images
      WHERE vendor_email = ?
      GROUP BY id
    `, [vendorEmail]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "No halls found for this vendor" });
    }

    res.json({ success: true, halls: rows });
  } catch (error) {
    console.error("Error fetching halls:", error);
    res.status(500).json({ success: false, message: "Error fetching halls" });
  }
});

// DELETE a specific hall by ID
// app.delete("/api/halls/:id", async (req, res) => {
//     const {id} = req.params;
  
//     try {
//         const [result] = await db.promise().execute("DELETE FROM function_halls WHERE id = ?", [id]);

  
//       if (result.affectedRows > 0) {
//         res.json({ message: "Hall deleted successfully" });
//       } else {
//         res.status(404).json({ error: "Hall not found" });
//       }
//     } catch (error) {
//       console.error("Error deleting hall:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   });
// Delete hall only if it is not booked
app.delete("/api/halls/:id", async (req, res) => {
  const hallId = req.params.id;

  try {
    // Check if the hall is booked
    const [booked] = await db.promise().query(
      "SELECT * FROM hall_availability WHERE hall_id = ?",
      [hallId]
    );

    if (booked.length > 0) {
      return res.status(400).json({ error: "Hall cannot be deleted as it has active bookings" });
    }

    // If not booked, delete hall
    await db.promise().query("DELETE FROM function_halls WHERE id = ?", [hallId]);

    res.json({ message: "Hall deleted successfully" });
  } catch (error) {
    console.error("Error deleting hall:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//fetching users
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT username, email, phone FROM users");
    res.json({ users: rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


//delete user
app.delete("/api/users/:email", async (req, res) => {
    const { email } = req.params;
    try {
      const [result] = await db.promise().query("DELETE FROM users WHERE email = ?", [email]);
  
      if (result.affectedRows > 0) {
        res.json({ message: "User deleted successfully" });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
   

// Get all vendors
app.get("/api/vendors", async (req, res) => {
    try {
      const [vendors] = await db.promise().query("SELECT * FROM business");
      res.json({ vendors });
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Delete vendor by email
  app.delete("/api/vendors/:email", async (req, res) => {
    const { email } = req.params;
    try {
      const [result] = await db.promise().query("DELETE FROM business WHERE email = ?", [email]);
      if (result.affectedRows > 0) {
        res.json({ message: "Vendor deleted successfully" });
      } else {
        res.status(404).json({ error: "Vendor not found" });
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


//  fetching halls
 app.get("/api/halls", async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM function_halls"); // Fix here
    res.json(rows); // Send rows directly
  } catch (error) {
    console.error("Error fetching halls:", error);
    res.status(500).send("Server Error");
  }
});

 

// Save payment report to MySQL
app.post("/api/payments/saveReport", async (req, res) => {
    try {
        const { vendor_email, vendor_name, hall_name, payment_status } = req.body;
        
        const query = "INSERT INTO payment_reports (vendor_email, vendor_name, hall_name, payment_status) VALUES (?, ?, ?, ?)";
        await db.execute(query, [vendor_email, vendor_name, hall_name, payment_status]);

        res.status(201).json({ message: "Payment report saved successfully" });
    } catch (error) {
        console.error("Error saving payment report:", error);
        res.status(500).json({ error: "Failed to save payment report" });
    }
});

// Fetch all payment reports
app.get("/api/payments/getReports", async (req, res) => {
    try {
        const query = `
            SELECT p.vendor_email, v.vendor_name, p.hall_name, p.payment_status, p.date
            FROM payment_reports p
            JOIN business v ON p.vendor_email = v.email
            ORDER BY p.date DESC;
        `;

        const [reports] = await db.promise().query(query);
        res.status(200).json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
});


//fetching particular hall for more details
app.get("/api/hallss/:hallId", async (req, res) => {
    console.log("Received hallId:", req.params.hallId);
    const hallId = Number(req.params.hallId);
    
    try {
        console.log(`Executing Query: Fetching hall with payment status`);
        const query = `
            SELECT fh.*, 
                   CASE 
                       WHEN pr.payment_status = 'succeeded' THEN 'Payment Done' 
                       ELSE 'Not Done' 
                   END AS payment_status
            FROM function_halls fh
            LEFT JOIN payment_reports pr ON fh.hall_name = pr.hall_name AND fh.vendor_email = pr.vendor_email
            WHERE fh.id = ?
        `;
        
        const [hall] = await db.promise().query(query, [hallId]);

        if (hall.length === 0) {
            console.log("Hall not found in database.");
            return res.status(404).json({ error: "Hall not found" });
        }

        console.log("Hall found:", hall[0]);
        res.status(200).json(hall[0]);
    } catch (error) {
        console.error("Error fetching hall details:", error);
        res.status(500).json({ error: "Failed to fetch hall details" });
    }
});


//accepting hall
app.put("/api/halls/approve/:hallId", async (req, res) => {
    const { hallId } = req.params;

    try {
        const [hall] = await db.promise().query("SELECT * FROM function_halls WHERE id = ?", [hallId]);
        if (hall.length === 0) {
            return res.status(404).json({ error: "Hall not found" });
        }

        const vendorEmail = hall[0].vendor_email;
        const hallName = hall[0].hall_name;

        // Update Hall Status
        await db.promise().query("UPDATE function_halls SET statusOfHall = 1 WHERE id = ?", [hallId]);

        // Add Notification for Vendor
        await db.promise().query(
            "INSERT INTO notifications (vendor_email, message) VALUES (?, ?)",
            [vendorEmail, `Your hall '${hallName}' has been approved by the admin.`]
        );

        res.json({ success: true, message: "Hall approved and vendor notified!" });
    } catch (error) {
        console.error("Error approving hall:", error);
        res.status(500).json({ error: "Failed to approve hall." });
    }
});

//fetching bank details for particular vendor
app.get("/api/get-bank-details", async (req, res) => {
    const { email } = req.query;
  
    try {
      const [rows] = await db.promise().query("SELECT * FROM bank_details WHERE email = ?", [email]);
  
      if (rows.length > 0) {
        res.json({ success: true, bankDetails: rows[0] });
      } else {
        res.status(404).json({ success: false, message: "Bank details not found" });
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
      res.status(500).json({ success: false, message: "Failed to fetch bank details" });
    }
  });
  


//fetching notifications
app.get("/api/notifications/:vendorEmail", async (req, res) => {
    const { vendorEmail } = req.params;
    console.log("Fetching notifications for vendor:", vendorEmail);

    try {
        const [notifications] = await db.promise().query(
            "SELECT * FROM notifications WHERE vendor_email = ? ORDER BY created_at DESC",
            [vendorEmail]
        );

        if (notifications.length === 0) {
            return res.status(404).json({ message: "No notifications found" });
        }

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});



//Process Refund API
app.post("/api/send-notification", async (req, res) => {
  try {
    const { vendor_email, message } = req.body;

    if (!vendor_email || !message) {
      return res.status(400).json({ success: false, message: "Missing vendor email or message" });
    }

    // Save the notification to the database
    await db.promise().query("INSERT INTO notifications (vendor_email, message) VALUES (?, ?)", [vendor_email, message]);

    console.log("Notification saved for vendor:", vendor_email);
    res.json({ success: true, message: "Notification sent successfully" });

  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


  
//store notifications
  app.post("/api/notifications/add", async (req, res) => {
    const { vendor_email, message } = req.body;
  
    try {
      await db.promise().query(
        "INSERT INTO notifications (vendor_email, message) VALUES (?, ?)",
        [vendor_email, message]
      );
  
      res.status(201).json({ success: true, message: "Notification sent successfully." });
    } catch (error) {
      console.error("Error adding notification:", error);
      res.status(500).json({ error: "Failed to add notification" });
    }
  });
  


  
//storing rejection notification
  app.post("/api/send-notification", async (req, res) => {
    const { vendor_email, message } = req.body;
  
    if (!vendor_email || !message) {
      return res.status(400).json({ error: "Missing vendor email or message" });
    }
  
    try {
      await db.promise().query(
        "INSERT INTO notifications (vendor_email, message) VALUES (?, ?)",
        [vendor_email, message]
      );
      res.status(201).json({ success: true, message: "Notification sent successfully!" });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });
  
//rejecting the hall api to reflect the immediate changes 
app.put("/api/halls/reject", async (req, res) => {
  const { hall_id, hall_name } = req.body; // Extract both hall_id and hall_name

  if (!hall_id && !hall_name) {
    return res.status(400).json({ success: false, message: "Hall ID or Hall Name is required" });
  }

  try {
    let query;
    let param;

    if (hall_id) {
      query = "UPDATE function_halls SET statusOfHall = 0 WHERE id = ?";
      param = [hall_id];
    } else {
      query = "UPDATE function_halls SET statusOfHall = 0 WHERE hall_name = ?";
      param = [hall_name];
    }

    const [result] = await db.promise().query(query, param);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Hall not found" });
    }

    res.json({ success: true, message: "Hall rejected successfully" });
  } catch (error) {
    console.error("Error updating hall status:", error);
    res.status(500).json({ success: false, message: "Server error updating hall status" });
  }
});



  
//process refund
app.post("/api/process-refund", async (req, res) => {
  try {
    const { vendor_email, hall_name, amount } = req.body;

    if (!vendor_email || !hall_name || !amount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const dbPromise = db.promise();

    // 1️⃣ *Check if Hall Exists*
    const [hall] = await dbPromise.query(
      "SELECT * FROM function_halls WHERE hall_name = ? AND vendor_email = ?",
      [hall_name, vendor_email]
    );

    if (hall.length === 0) {
      return res.status(404).json({ success: false, message: "Hall not found" });
    }

    // 2️⃣ *Check if Refund Already Exists*
    const [existingRefund] = await dbPromise.query(
      "SELECT * FROM refunds WHERE vendor_email = ? AND hall_name = ?",
      [vendor_email, hall_name]
    );

    if (existingRefund.length > 0) {
      return res.status(400).json({ success: false, message: "Refund already processed for this hall." });
    }

    // 3️⃣ *Update Hall Status to "Rejected"*
    await dbPromise.query(
      "UPDATE function_halls SET statusOfHall = ? WHERE hall_name = ?",
      [0, hall_name]
    );

    // 4️⃣ *Insert Refund Record*
    await dbPromise.query(
      "INSERT INTO refunds (vendor_email, hall_name, amount) VALUES (?, ?, ?)",
      [vendor_email, hall_name, amount]
    );

    // 5️⃣ *Check if Notification Already Exists*
    const [existingNotification] = await dbPromise.query(
      "SELECT * FROM notifications WHERE vendor_email = ? AND message LIKE ?",
      [vendor_email, `%Your hall '${hall_name}' has been rejected%`]
    );

    if (existingNotification.length === 0) {
      // Only insert if notification doesn't exist
      await dbPromise.query(
        "INSERT INTO notifications (vendor_email, message) VALUES (?, ?)",
        [vendor_email,`Your hall '${hall_name}' has been rejected by the admin. A refund of ₹${amount} has been processed.`]
      );
    }

    res.json({ success: true, message: "Refund processed & notification sent successfully" });

  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({ success: false, message: "Server error while processing refund" });
  }
});



// // Check hall availability
// app.get("/api/halls/:hallId/availability", async (req, res) => {
//   const { hallId } = req.params;
//   try {
//     const [bookedDates] = await db.promise().query(
//       "SELECT booked_date FROM hall_availability WHERE hall_id = ?",
//       [hallId]
//     );
//     res.json(bookedDates.map(date => date.booked_date));
//   } catch (error) {
//     console.error("Error fetching booked dates:", error);
//     res.status(500).json({ error: "Failed to fetch availability" });
//   }
// });

// // Check specific date availability
// app.get("/api/halls/:hallId/check-availability", async (req, res) => {
//   const { hallId } = req.params;
//   const { date } = req.query;
  
//   if (!date) {
//     return res.status(400).json({ error: "Date parameter is required" });
//   }

//   try {
//     const [result] = await db.promise().query(
//       "SELECT 1 FROM hall_availability WHERE hall_id = ? AND booked_date = ?",
//       [hallId, date]
//     );
//     res.json({ available: result.length === 0 });
//   } catch (error) {
//     console.error("Error checking date availability:", error);
//     res.status(500).json({ error: "Failed to check availability" });
//   }
// });

// Check hall availability
app.get("/api/halls/:hallId/availability", async (req, res) => {
  const { hallId } = req.params;
  try {
    // First check if hall exists
    const [hall] = await db.promise().query("SELECT id FROM function_halls WHERE id = ?", [hallId]);
    if (!hall.length) {
      return res.status(404).json({ error: "Hall not found" });
    }

    const [bookedDates] = await db.promise().query(
      "SELECT booked_date FROM hall_availability WHERE hall_id = ?",
      [hallId]
    );
    res.json(bookedDates.map(date => format(new Date(date.booked_date), 'yyyy-MM-dd')));
  } catch (error) {
    console.error("Error fetching booked dates:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// Check specific date availability
app.get("/api/halls/:hallId/check-availability", async (req, res) => {
  const { hallId } = req.params;
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({ error: "Date parameter is required" });
  }

  try {
    // First check if hall exists
    const [hall] = await db.promise().query("SELECT id FROM function_halls WHERE id = ?", [hallId]);
    if (!hall.length) {
      return res.status(404).json({ error: "Hall not found" });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    const [result] = await db.promise().query(
      "SELECT 1 FROM hall_availability WHERE hall_id = ? AND booked_date = ?",
      [hallId, date]
    );
    
    res.json({ 
      available: result.length === 0,
      message: result.length === 0 ? "Date is available" : "Date is already booked"
    });
  } catch (error) {
    console.error("Error checking date availability:", error);
    res.status(500).json({ 
      error: "Failed to check availability",
      details: error.message 
    });
  }
});


app.get("/api/user1/:userEmail", async (req, res) => {
  const userEmail = req.params.userEmail;

  try {
    const sql = "SELECT id, username, email, phone FROM users WHERE email = ?";
    const [user] = await db.promise().query(sql, [userEmail]);

    if (user.length > 0) {
      res.json(user[0]); // Return the first user
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.put("/api/user1/:userEmail", async (req, res) => {
  const { userEmail } = req.params;
  const { username, email, phone } = req.body;

  try {
    const sql = "UPDATE users SET username = ?, email = ?, phone = ? WHERE email = ?";
    const [result] = await db.promise().query(sql, [username, email, phone, userEmail]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "User updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Submit a booking
app.post("/api/bookings", async (req, res) => {
  try {
    const { 
      hall_id,
      event_date,
      user_email,
      firstname,
      lastname,
      mobile,
      alternate,
      event_type,
      guests,
      additional_services,
      total_price
    } = req.body;

    // Validate required fields
    if (!hall_id || !event_date || !user_email || !firstname || !lastname || !mobile || !guests) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get hall price
    const [hall] = await db.promise().query(
      "SELECT price FROM function_halls WHERE id = ?", 
      [hall_id]
    );
    
    if (!hall.length) {
      return res.status(404).json({ error: "Hall not found" });
    }

    // Calculate total price
    let calculatedTotal = parseFloat(hall[0].price);
    
    // Parse additional services if they exist
    if (additional_services) {
      try {
        const services = typeof additional_services === 'string' 
          ? JSON.parse(additional_services) 
          : additional_services;
        
        // Sum all service prices
        Object.values(services).forEach(price => {
          calculatedTotal += parseFloat(price);
        });
      } catch (e) {
        console.error("Error parsing additional services:", e);
      }
    }

    // Start transaction
    await db.promise().beginTransaction();

    try {
      // Create booking with calculated total
      const [bookingResult] = await db.promise().query(
        `INSERT INTO user_hall_bookings (
          hall_id, user_email, firstname, lastname, mobile, alternate,
          event_type, guests, event_date, additional_services, total_price, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          hall_id, 
          user_email, 
          firstname, 
          lastname, 
          mobile, 
          alternate,
          event_type, 
          guests, 
          event_date, 
          additional_services ? JSON.stringify(additional_services) : null,
          calculatedTotal, // Use the calculated total
          'pending'
        ]
      );

      // Mark date as booked
      await db.promise().query(
        "INSERT INTO hall_availability (hall_id, booked_date) VALUES (?, ?)",
        [hall_id, event_date]
      );

      // Commit transaction
      await db.promise().commit();

      res.status(201).json({
        success: true,
        bookingId: bookingResult.insertId,
        totalAmount: calculatedTotal,
        message: "Booking created successfully"
      });

    } catch (error) {
      // Rollback on error
      await db.promise().rollback();
      throw error;
    }

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ 
      error: "Failed to create booking",
      details: error.message 
    });
  }
});




//fetching payment details for user
app.get("/api/payments/:userEmail", async (req, res) => {
  try {
    const { userEmail } = req.params;

    const [payments] = await db.promise().query(
      "SELECT booking_id, hall_id, event_type, event_date, total_price, status FROM user_hall_bookings WHERE user_email = ? AND status = 'paid'",
      [userEmail]
    );

    res.json({ success: true, payments });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ success: false, message: "Server error while fetching payments" });
  }
});


//this end point is used to full fill the history section in vendor page
app.get("/api/vendor/bookings/:vendorEmail", async (req, res) => {
  try {
    const { vendorEmail } = req.params;
    
    // Get all halls owned by the vendor
    const [halls] = await db.promise().query(
      "SELECT id, hall_name FROM function_halls WHERE vendor_email = ?",
      [vendorEmail]
    );

    if (halls.length === 0) {
      return res.json({ bookings: [] }); // No halls found for this vendor
    }

    // Extract hall IDs
    const hallIds = halls.map(hall => hall.id);
    
    // Fetch bookings for the vendor's halls with more details
    const [bookings] = await db.promise().query(
      `SELECT uhb.booking_id, uhb.event_type, uhb.event_date, uhb.status, 
              uhb.firstname, uhb.lastname, uhb.mobile, uhb.alternate, 
              uhb.guests, uhb.total_price, uhb.additional_services, uhb.user_email ,fh.hall_name
       FROM user_hall_bookings uhb
       JOIN function_halls fh ON uhb.hall_id = fh.id
       WHERE uhb.hall_id IN (?)`,
      [hallIds]
    );

    res.json({ bookings });
  } catch (error) {
    console.error("Error fetching vendor bookings:", error);
    res.status(500).json({ error: "Failed to fetch vendor bookings" });
  }
});


//this end point is used to display the my booking details in user dashboard(my bookings)
app.get("/api/user/bookings/:userEmail", async (req, res) => {
  try {
    const { userEmail } = req.params;

    const [bookings] = await db.promise().query(
      `SELECT uhb.booking_id, uhb.event_type, uhb.event_date, uhb.total_price, 
              uhb.status, fh.hall_name 
       FROM user_hall_bookings uhb
       JOIN function_halls fh ON uhb.hall_id = fh.id
       WHERE uhb.user_email = ?`,
      [userEmail]
    );

    res.json({ bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ error: "Failed to fetch user bookings" });
  }
});

// Get all booked halls
app.get("/api/booked-halls", async (req, res) => {
  try {
    const [bookings] = await db.promise().query("SELECT DISTINCT hall_id FROM hall_availability");

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching booked halls:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// MySQL Connection & Server Start
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
app.post("/api/payment/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
      payment_method_types: ["card"],
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});


app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body; // This should already be in paise
    
    // Validate amount is an integer
    if (!Number.isInteger(amount)) {
      return res.status(400).json({ error: "Amount must be an integer representing paise" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Use the amount directly (already in paise)
      currency: 'inr',
      payment_method_types: ['card'],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.put("/api/update-payment-status/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const [result] = await db.promise().query(
      "UPDATE user_hall_bookings SET status = 'paid' WHERE booking_id = ?",
      [bookingId]
    );

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Payment status updated successfully" });
    } else {
      res.status(404).json({ success: false, message: "Booking not found" });
    }
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body; // Amount in the smallest unit (e.g., cents)

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects the amount in cents
      currency: 'inr', // Adjust according to your desired currency
    });
    console.log("success")
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err);
        process.exit(1);
    }
    console.log("MySQL Connected");

    createSignupTable();
    createSignupTableForBusiness();
    createBankDetailsTable();
    createFunctionHallsTable();
    createPaymentTable()
    createNotificationsTable()
    createRefundTable()
    createHallAvailabilityTable(); // Add this line
    createBookingTable3(); // Also ensure this is called
    createUserPaymentTable(); // And this one



    createUserHallBookings()

    const port = 8500;
    app.listen(port, () => {
        console.log(`Server started at http://localhost:${port}`);
    });
});
