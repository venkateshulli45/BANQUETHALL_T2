import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./UserPayment.module.css";

const UserPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [bookingDetails, setBookingDetails] = useState(() => {
    return (
      location.state ||
      JSON.parse(sessionStorage.getItem("bookingDetails")) ||
      {}
    );
  });

  useEffect(() => {
    if (!bookingDetails.hall) {
      navigate("/");
    } else {
      sessionStorage.setItem("bookingDetails", JSON.stringify(bookingDetails));
    }
  }, [bookingDetails, navigate]);

  if (!bookingDetails.hall) {
    return <p>Redirecting...</p>;
  }

  const handlePayment = async () => {
    
    if (!stripe || !elements) {
        alert("Stripe has not loaded yet. Please try again.");
        return;
      }

    let totalPrice = bookingDetails.hall.price;
    let additionalServices = {};
  
    if (bookingDetails.selectedServices?.length > 0) {
      bookingDetails.selectedServices.forEach(service => {
        const serviceKey = service.toLowerCase();
        if (serviceKey === "catering" && bookingDetails.hall.services.cateringPrice) {
          const cateringCost = bookingDetails.hall.services.cateringPrice * bookingDetails.formData.guests;
          additionalServices[serviceKey] = cateringCost;
          totalPrice += cateringCost;
        } else if (bookingDetails.hall.services[`${serviceKey}Price`]) {
          additionalServices[serviceKey] = bookingDetails.hall.services[`${serviceKey}Price`];
          totalPrice += bookingDetails.hall.services[`${serviceKey}Price`];
        }
      });
    }
  
    try {
        const response = await fetch("http://localhost:8500/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalPrice }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create payment intent");
        }
  
        const { clientSecret } = await response.json();
  
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: `${bookingDetails.formData?.firstname} ${bookingDetails.formData?.lastname}`,
              email: bookingDetails.formData?.email,
              phone: bookingDetails.formData?.mobile,
            },
          },
        });
  
        if (error) {
          alert("Payment failed: " + error.message);
        } else if (paymentIntent.status === "succeeded") {
        //   const bookingResponse = await fetch("http://localhost:8500/api/bookings", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({
        //       hall_id: bookingDetails.hall.id || bookingDetails.hall.hall_id,
        //       event_date: bookingDetails.bookingDate,
        //       user_email: bookingDetails.formData?.email || "",
        //       firstname: bookingDetails.formData?.firstname || "",
        //       lastname: bookingDetails.formData?.lastname || "",
        //       mobile: bookingDetails.formData?.mobile || "",
        //       alternate: bookingDetails.formData?.alternate || "",
        //       event_type: bookingDetails.formData?.event_type || "",
        //       guests: bookingDetails.formData?.guests || 0,
        //       additional_services: JSON.stringify(additionalServices),
        //       total_price: totalPrice,
        //     }),
        //   });
  

        const response = await fetch("http://localhost:8500/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData),
          });

          
      const data = await response.json();
  
      if (response.ok) {
        const bookingId = data.bookingId;
        sessionStorage.setItem("bookingId", bookingId);
        
        // 2️⃣ Step 2: Update Payment Status to "Paid"
        const paymentResponse = await fetch(`http://localhost:8500/api/update-payment-status/${bookingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        });
  
        const paymentData = await paymentResponse.json();
  
        if (paymentResponse.ok) {
          alert(`Payment successful! Booking confirmed.\nBooking ID: ${bookingId}`);
          sessionStorage.setItem("paymentSuccess", "true");
          navigate("/");
        } else {
          alert(`Payment recorded, but status update failed: ${paymentData.message}`);
        }
      } else {
        alert(`Payment failed: ${data.error}`);
      }
        
          const bookingData = await bookingResponse.json();
          if (bookingResponse.ok) {
            alert(`Payment successful! Booking confirmed.\nBooking ID: ${bookingData.bookingId}`);
            sessionStorage.setItem("bookingId", bookingData.bookingId);
            sessionStorage.setItem("paymentSuccess", "true");
            navigate("/");
          } else {
            alert(`Booking failed: ${bookingData.error}`);
          }
        }
      } catch (error) {
        alert("An error occurred: " + error.message);
      }
    const requestData = {
      hall_id: bookingDetails.hall.id || bookingDetails.hall.hall_id,
      event_date: bookingDetails.bookingDate,
      user_email: bookingDetails.formData?.email || "",
      firstname: bookingDetails.formData?.firstname || "",
      lastname: bookingDetails.formData?.lastname || "",
      mobile: bookingDetails.formData?.mobile || "",
      alternate: bookingDetails.formData?.alternate || "",
      event_type: bookingDetails.formData?.event_type || "",
      guests: bookingDetails.formData?.guests || 0,
      additional_services: JSON.stringify(additionalServices),
      total_price: totalPrice,
    };
  
    // try {
    //   // 1️⃣ Step 1: Create a Booking (Status: Pending)
    //   const response = await fetch("http://localhost:8500/api/bookings", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(requestData),
    //   });
  
    //   const data = await response.json();
  
    //   if (response.ok) {
    //     const bookingId = data.bookingId;
    //     sessionStorage.setItem("bookingId", bookingId);
        
    //     // 2️⃣ Step 2: Update Payment Status to "Paid"
    //     const paymentResponse = await fetch(`http://localhost:8500/api/update-payment-status/${bookingId}`, {
    //       method: "PUT",
    //       headers: { "Content-Type": "application/json" },
    //     });
  
    //     const paymentData = await paymentResponse.json();
  
    //     if (paymentResponse.ok) {
    //       alert(`Payment successful! Booking confirmed.\nBooking ID: ${bookingId}`);
    //       sessionStorage.setItem("paymentSuccess", "true");
    //       navigate("/");
    //     } else {
    //       alert(`Payment recorded, but status update failed: ${paymentData.message}`);
    //     }
    //   } else {
    //     alert(`Payment failed: ${data.error}`);
    //   }
    // } catch (error) {
    //   console.error("Error processing payment:", error);
    //   alert("An error occurred. Please try again later.");
    // }
  };
  

  const calculateServicePrice = (service) => {
    const serviceKey = service.toLowerCase();
    
    // Special handling for catering
    if (serviceKey === 'catering' && bookingDetails.hall.services.cateringPrice) {
      return bookingDetails.hall.services.cateringPrice * bookingDetails.formData.guests;
    }
    
    return bookingDetails.hall.services[`${serviceKey}Price`] || 0;
  };

  const calculateTotalAmount = () => {
    let total = parseFloat(bookingDetails.hall.price);
    
    if (bookingDetails.selectedServices?.length > 0) {
      bookingDetails.selectedServices.forEach(service => {
        const serviceKey = service.toLowerCase();
        if (serviceKey === 'catering' && bookingDetails.hall.services.cateringPrice) {
          total += parseFloat(bookingDetails.hall.services.cateringPrice) * parseInt(bookingDetails.formData.guests);
        } else if (bookingDetails.hall.services[`${serviceKey}Price`]) {
          total += parseFloat(bookingDetails.hall.services[`${serviceKey}Price`]);
        }
      });
    }
    
    return total.toFixed(2);
  };

  return (
    <div className={styles.container}>
      <h1>Confirm Your Booking</h1>
      <div className={styles.details}>
        <h2>Booking Details</h2>
        <p>
          <strong>Hall Name:</strong> {bookingDetails.hall.hall_name || "N/A"}
        </p>
        <p>
          <strong>Location:</strong> {bookingDetails.hall.location || "N/A"},{" "}
          {bookingDetails.hall.city || "N/A"}
        </p>
        <p>
          <strong>Date:</strong> {bookingDetails.bookingDate || "N/A"}
        </p>
        <p>
          <strong>Guests:</strong> {bookingDetails.formData?.guests || 0}
        </p>

        <h2>Pricing Breakdown</h2>
        <div className={styles.priceBreakdown}>
          <p>Hall Rental: ₹{bookingDetails.hall.price}</p>

          {bookingDetails.selectedServices?.length > 0 ? (
            <>
              <h3>Additional Services:</h3>
              <ul>
                {bookingDetails.selectedServices.map((service, index) => (
                  <li key={index}>
                    {service}: ₹{calculateServicePrice(service)}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>No additional services selected.</p>
          )}

<p className={styles.totalPrice}>
  <strong>Total Amount:</strong> ₹{calculateTotalAmount()}
</p>
        </div>

        <h2>Personal Information</h2>
        <p>
          <strong>Name:</strong> {bookingDetails.formData?.firstname || ""}{" "}
          {bookingDetails.formData?.lastname || ""}
        </p>
        <p>
          <strong>Email:</strong> {bookingDetails.formData?.email || "N/A"}
        </p>
        <p>
          <strong>Mobile:</strong> {bookingDetails.formData?.mobile || "N/A"}
        </p>

        <button className={styles.payButton} onClick={handlePayment}>
          Proceed to Payment ₹ {calculateTotalAmount()}
        </button>
      </div>
    </div>
  );
};

export default UserPayment;
