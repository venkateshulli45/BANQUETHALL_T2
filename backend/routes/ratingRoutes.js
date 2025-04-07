// In your backend routes file (e.g., routes/halls.js)

// Get all halls
router.get('/api/halls', async (req, res) => {
    try {
      const [halls] = await db.promise().query(`
        SELECT f.*, 
          COALESCE(AVG(r.rating), 0) as avg_rating,
          COUNT(r.id) as rating_count
        FROM function_halls f
        LEFT JOIN hall_ratings r ON f.id = r.hall_id
        WHERE f.statusOfHall = 1
        GROUP BY f.id
      `);
      res.json(halls);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching halls" });
    }
  });
  
  // Get user bookings
  router.get('/api/bookings', async (req, res) => {
    try {
      const { userEmail } = req.query;
      const [bookings] = await db.promise().query(`
        SELECT b.*, h.hall_name, 
          EXISTS(
            SELECT 1 FROM hall_ratings r 
            WHERE r.booking_id = b.booking_id
          ) as rated
        FROM user_hall_bookings b
        JOIN function_halls h ON b.hall_id = h.id
        WHERE b.user_email = ?
        ORDER BY b.event_date DESC
      `, [userEmail]);
      res.json(bookings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching bookings" });
    }
  });
  
  // Submit rating
  router.post('/api/ratings', async (req, res) => {
    try {
      const { hallId, bookingId, userEmail, rating, review } = req.body;
      
      // Verify booking exists and belongs to user
      const [booking] = await db.promise().query(`
        SELECT 1 FROM user_hall_bookings 
        WHERE booking_id = ? AND user_email = ?
      `, [bookingId, userEmail]);
      
      if (booking.length === 0) {
        return res.status(403).json({ message: "Invalid booking" });
      }
      
      // Check if event date has passed
      const [eventDate] = await db.promise().query(`
        SELECT event_date FROM user_hall_bookings 
        WHERE booking_id = ?
      `, [bookingId]);
      
      if (new Date(eventDate[0].event_date) > new Date()) {
        return res.status(400).json({ message: "Cannot rate before event date" });
      }
      
      // Check if already rated
      const [existingRating] = await db.promise().query(`
        SELECT 1 FROM hall_ratings 
        WHERE booking_id = ?
      `, [bookingId]);
      
      if (existingRating.length > 0) {
        return res.status(400).json({ message: "Already rated this booking" });
      }
      
      // Insert rating
      await db.promise().query(`
        INSERT INTO hall_ratings 
        (hall_id, user_email, booking_id, rating, review)
        VALUES (?, ?, ?, ?, ?)
      `, [hallId, userEmail, bookingId, rating, review]);
      
      // Update average rating in function_halls
      const [avgResult] = await db.promise().query(`
        SELECT AVG(rating) as avgRating 
        FROM hall_ratings 
        WHERE hall_id = ?
      `, [hallId]);
      
      const avgRating = Math.round(avgResult[0].avgRating * 10) / 10; // Round to 1 decimal
      
      await db.promise().query(`
        UPDATE function_halls 
        SET rating = ? 
        WHERE id = ?
      `, [avgRating, hallId]);
      
      // Send notification to vendor
      const [vendorEmail] = await db.promise().query(`
        SELECT vendor_email FROM function_halls WHERE id = ?
      `, [hallId]);
      
      if (vendorEmail[0]?.vendor_email) {
        await db.promise().query(`
          INSERT INTO notifications 
          (vendor_email, message)
          VALUES (?, ?)
        `, [vendorEmail[0].vendor_email, `New ${rating}-star rating received for your hall`]);
      }
      
      res.status(201).json({ message: "Rating submitted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error submitting rating" });
    }
  });