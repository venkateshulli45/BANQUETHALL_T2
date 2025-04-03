// module.js

import { db } from '../config/db.js';

export const createSignupTable = async () => {
  try {
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(15) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);
    console.log("Users table created successfully.");
  } catch (err) {
    console.error("Error creating users table:", err);
  }
};


export const createSignupTableForBusiness = async () => {
  try {
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS business (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendor_name VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(15) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);
    console.log("Business table created successfully.");
  } catch (err) {
    console.error("Error creating business table:", err);
  }
};





export const createBankDetailsTable = async () => {
  try {
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS bank_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        account_holder VARCHAR(255) NOT NULL,
        account_number VARCHAR(255) UNIQUE NOT NULL,
        ifsc_code VARCHAR(20) NOT NULL,
        bank_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        FOREIGN KEY (email) REFERENCES business(email) ON DELETE CASCADE
      )
    `);
    console.log("Bank Details table created successfully.");
  } catch (err) {
    console.error("Error creating bank_details table:", err);
  }
};


// export const createFunctionHallsTable = async () => {
//   try {
//     await db.promise().query(`
//       CREATE TABLE IF NOT EXISTS function_halls (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         vendor_email VARCHAR(255) NOT NULL,
//         hall_name VARCHAR(255) NOT NULL,
//         city VARCHAR(255) NOT NULL,
//         location VARCHAR(255) NOT NULL,
//         capacity INT NOT NULL,
//         price DECIMAL(10,2) NOT NULL,
//         description TEXT NOT NULL,
//         services JSON NOT NULL,
//         images JSON NOT NULL,
//         FOREIGN KEY (vendor_email) REFERENCES business(email) ON DELETE CASCADE
//       )
//     `);
//     console.log("Function Halls table created successfully.");
//   } catch (err) {
//     console.error("Error creating function_halls table:", err);
//   }
// };

export const createFunctionHallsTable = async () => {
  try {
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS function_halls (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendor_email VARCHAR(255) NOT NULL,
        hall_name VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        capacity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        services JSON NOT NULL,
        images JSON NOT NULL,
        statusOfHall TINYINT DEFAULT 2,
        rating int DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (vendor_email) REFERENCES business(email) ON DELETE CASCADE
      )
    `);
    console.log("Function Halls table created successfully.");
  } catch (err) {
    console.error("Error creating function_halls table:", err);
  }
};
export const createPaymentTable=async()=>{
  try{
    await db.promise().query(`
        CREATE TABLE IF NOT EXISTS payment_reports (
          id INT AUTO_INCREMENT PRIMARY KEY,
          vendor_email VARCHAR(255) NOT NULL,
          vendor_name VARCHAR(255) NOT NULL,
          hall_name VARCHAR(255) NOT NULL,
          payment_status VARCHAR(50) NOT NULL,
          date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      
    `);
    console.log("Payment table created successfully.");
  }
  catch(err){
    console.error("Error creating Payment table:",err)
  }
}


export const createNotificationsTable = async () => {
  try {
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendor_email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('unread', 'read') DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_email) REFERENCES business(email) ON DELETE CASCADE
      )
    `);
    console.log("Notifications table created successfully.");
  } catch (err) {
    console.error("Error creating notifications table:", err);
  }
};


export const createRefundTable = async () => {
  try {
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS refunds (
          id INT AUTO_INCREMENT PRIMARY KEY,
          vendor_email VARCHAR(255) NOT NULL,
          hall_name VARCHAR(255) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Refund table created successfully.");
  } catch (err) {
    console.error("Error creating refund table:", err);
  }
};


// export const createFunctionHallsTable2 = async () => {
//   try {
//     await db.promise().query(`
//       CREATE TABLE IF NOT EXISTS function_halls2 (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         vendor_email VARCHAR(255) NOT NULL,
//         hall_name VARCHAR(255) NOT NULL,
//         city VARCHAR(255) NOT NULL,
//         location VARCHAR(255) NOT NULL,
//         capacity INT NOT NULL,
//         price DECIMAL(10,2) NOT NULL,
//         description TEXT NOT NULL,
//         services JSON NOT NULL,
//         images LONGBLOB NOT NULL,  -- Store images as BLOB
//         FOREIGN KEY (vendor_email) REFERENCES business(email) ON DELETE CASCADE
//       )
//     `);
//     console.log("Function Halls table created successfully.");
//   } catch (err) {
//     console.error("Error creating function_halls table:", err);
//   }
// };



export const createBookingTable3 = async () => {
  try {
    await db.promise().query(`
      CREATE TABLE user_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    email VARCHAR(255),
    mobile VARCHAR(20),
    alternate VARCHAR(20),
    event_type VARCHAR(255),
    guests INT,
    event_date DATE,
    user_email VARCHAR(255),
    hall_name VARCHAR(255),
    hall_id INT,
    vendor_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


    `);
    console.log("bookings3 table created successfully.");
  } catch (err) {
    console.error("Error creating bookings3 table:", err);
  }
};


export const createUserPaymentTable = async () => {
  try {
    await db.promise().query(`
      CREATE TABLE user_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userEmail VARCHAR(255) NOT NULL,
    hallId INT NOT NULL,
    hallName VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paymentStatus ENUM('Pending', 'Completed', 'Failed') NOT NULL DEFAULT 'Completed',
    transactionId VARCHAR(255) UNIQUE NOT NULL
);

    `);
    console.log("user payment table created successfully.");
  } catch (err) {
    console.error("Error creating user payment table:", err);
  }
};


export const createHallAvailabilityTable = async () => {
  try {
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS hall_availability (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hall_id INT NOT NULL,
        booked_date DATE NOT NULL,
        FOREIGN KEY (hall_id) REFERENCES function_halls(id) ON DELETE CASCADE,
        UNIQUE KEY unique_booking (hall_id, booked_date)
      )
    `);
    console.log("Hall availability table created successfully.");
  } catch (err) {
    console.error("Error creating hall_availability table:", err);
  }
};

// In signup.model.js
export const createUserNotificationsTable = async () => {
  try {
    await db.promise().query(`
      CREATE TABLE IF user_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('unread', 'read') DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
      )
    `);
    console.log("User notifications table created successfully.");
  } catch (err) {
    console.error("Error creating user_notifications table:", err);
  }
};





export const createUserHallBookings= async () => {
  try {
    await db.promise().query(`
      CREATE TABLE user_hall_bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    hall_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    mobile VARCHAR(20),
    alternate VARCHAR(20),
    event_type VARCHAR(100),
    guests INT,
    event_date DATE NOT NULL,
    additional_services JSON,
    total_price DECIMAL(10,2),
    status ENUM('pending', 'paid') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hall_id) REFERENCES function_halls(id) ON DELETE CASCADE
);

    `);
    console.log("User Hall Booking table created successfully.");
  } catch (err) {
    console.error("Error creating User Hall Booking table:", err);
  }
};