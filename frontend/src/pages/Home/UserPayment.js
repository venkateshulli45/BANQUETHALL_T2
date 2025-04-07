import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./UserPayment.module.css";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Load Stripe with your public key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || "pk_test_51R4EklB9XN3CkWjBoe57zgvBheIbAlPkpe0DXZcDKzyq2XN9P3jnw3A6rZB8X2PHRqw888d7LyJoyeghp3CApKIG00aqZegtZT");

const UserPaymentComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [bookingDetails, setBookingDetails] = React.useState(() => {
    return (
      location.state ||
      JSON.parse(sessionStorage.getItem("bookingDetails")) ||
      {}
    );
  });

  React.useEffect(() => {
    if (!bookingDetails.hall) {
      navigate("/");
    } else {
      sessionStorage.setItem("bookingDetails", JSON.stringify(bookingDetails));
    }
  }, [bookingDetails, navigate]);

  if (!bookingDetails.hall) {
    return <p>Redirecting...</p>;
  }

  const calculateServicePrice = (service) => {
    // Convert display name back to service key
    const serviceKey = service === "D'Orchestras" ? 'djOrchestras' : service.toLowerCase();
    
    if (serviceKey === 'catering' && bookingDetails.hall.services.cateringPrice) {
      return bookingDetails.hall.services.cateringPrice * bookingDetails.formData.guests;
    }
    
    return bookingDetails.hall.services[`${serviceKey}Price`] || 0;
  };

  const calculateTotalAmount = () => {
    let total = parseFloat(bookingDetails.hall.price);
    
    if (bookingDetails.selectedServices?.length > 0) {
      bookingDetails.selectedServices.forEach(service => {
        const serviceKey = service === "D'Orchestras" ? 'djOrchestras' : service.toLowerCase();
        if (serviceKey === 'catering' && bookingDetails.hall.services.cateringPrice) {
          total += parseFloat(bookingDetails.hall.services.cateringPrice) * parseInt(bookingDetails.formData.guests);
        } else if (bookingDetails.hall.services[`${serviceKey}Price`]) {
          total += parseFloat(bookingDetails.hall.services[`${serviceKey}Price`]);
        }
      });
    }
    
    return total.toFixed(2);
  };

  const handlePayment = async () => {
    if (!stripe || !elements) {
      alert("Stripe has not loaded yet. Please try again.");
      return;
    }

    // Calculate total amount in rupees and convert to paise
    const totalAmount = calculateTotalAmount();
    const amountInPaise = Math.round(parseFloat(totalAmount) * 100);

    try {
      // 1. Create Payment Intent
      const response = await fetch("http://localhost:8500/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInPaise }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment intent");
      }

      const { clientSecret } = await response.json();

      // 2. Confirm Card Payment
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
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // 3. Create Booking Record
        const bookingResponse = await fetch("http://localhost:8500/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hall_id: bookingDetails.hall.id || bookingDetails.hall.hall_id,
            event_date: bookingDetails.bookingDate,
            user_email: bookingDetails.formData?.email || "",
            firstname: bookingDetails.formData?.firstname || "",
            lastname: bookingDetails.formData?.lastname || "",
            mobile: bookingDetails.formData?.mobile || "",
            alternate: bookingDetails.formData?.alternate || "",
            event_type: bookingDetails.formData?.event_type || "",
            guests: bookingDetails.formData?.guests || 0,
            additional_services: JSON.stringify(bookingDetails.additionalServices || {}),
            total_price: totalAmount,
          }),
        });

        const bookingData = await bookingResponse.json();

        if (!bookingResponse.ok) {
          throw new Error(bookingData.error || "Failed to create booking");
        }

        // 4. Update Payment Status
        const paymentResponse = await fetch(
          `http://localhost:8500/api/update-payment-status/${bookingData.bookingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          throw new Error(paymentData.message || "Failed to update payment status");
        }

        // 5. Clear session and redirect
        sessionStorage.setItem("bookingId", bookingData.bookingId);
        sessionStorage.setItem("paymentSuccess", "true");
        alert(`Payment successful! Booking ID: ${bookingData.bookingId}`);
        navigate("/");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed: " + error.message);
    }
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
                {bookingDetails.selectedServices.map((service, index) => {
                  const serviceKey = service === "D'Orchestras" ? 'djOrchestras' : service.toLowerCase();
                  return (
                    <li key={index}>
                      {service}: ₹{calculateServicePrice(service)}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p>No additional services selected.</p>
          )}

          <p className={styles.totalPrice}>
            <strong>Total Amount:</strong> ₹{calculateTotalAmount()}
          </p>
        </div>

        <h2>Payment Information</h2>
        <div className={styles.cardElement}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>

        <button className={styles.payButton} onClick={handlePayment}>
          Pay ₹{calculateTotalAmount()}
        </button>
      </div>
    </div>
  );
};

const UserPayment = () => (
  <Elements stripe={stripePromise}>
    <UserPaymentComponent />
  </Elements>
);

export default UserPayment;