import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "./vendorstyles/Payment.module.css";
import axios from "axios";

// Initialize Stripe
const stripePromise = loadStripe("pk_test_51R4EklB9XN3CkWjBoe57zgvBheIbAlPkpe0DXZcDKzyq2XN9P3jnw3A6rZB8X2PHRqw888d7LyJoyeghp3CApKIG00aqZegtZT");

const PaymentForm = ({ formData, vendorEmail, vendorName }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const fixedPrice = 2000; // Fixed price for the hall
  const handlePaymentSuccess = async (event) => {
    event.preventDefault();
    console.log("Payment form submitted");


    try {
      // Step 1: Create a payment intent
      console.log("Creating payment intent...");
      const response = await axios.post("http://localhost:8500/api/payment/create-payment-intent", {
        amount: fixedPrice * 100, // Convert to smallest currency unit (paise)
      });

      console.log("Payment intent response:", response.data);
      const { clientSecret } = response.data;
      console.log("Client Secret:", clientSecret);

      if (!clientSecret) {
        throw new Error("Failed to retrieve client secret from backend");
      }

      // Step 2: Confirm the payment
      console.log("Confirming payment...");
      if (!stripe || !elements) {
        throw new Error("Stripe or Elements not initialized.");
      }

      const cardElement = elements.getElement(CardElement);
      console.log("Card Element:", cardElement);

      if (!cardElement) {
        throw new Error("Card Element is not initialized. Please check your setup.");
      }

      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: vendorName || "Unknown Vendor",
            email: vendorEmail || "unknown@example.com",
          },
        },
      });

      console.log("Payment Result:", paymentResult);

      if (paymentResult.error) {
        console.error("Payment failed:", paymentResult.error.message);
        throw new Error(`Payment failed: ${paymentResult.error.message}`);
      }

      if (paymentResult.paymentIntent.status === "succeeded") {
        console.log("Payment succeeded. Registering hall...");
        setMessage("Payment Successful!");
        setIsError(false);

        // Step 3: Save the payment report
        console.log("Saving payment report...");
        const saveReportResponse = await axios.post("http://localhost:8500/api/payments/saveReport", {
          vendor_email: vendorEmail,
          vendor_name: vendorName,
          hall_name: formData.hallName,
          payment_id: paymentResult.paymentIntent.id,
          payment_status: paymentResult.paymentIntent.status,
        });

        console.log("Save Report Response:", saveReportResponse.data);

        if (saveReportResponse.data.success) {
          console.log("Payment report saved successfully");
        } else {
          console.error("Failed to save payment report");
        }

        // Step 4: Register the hall
        const formDataToSend = new FormData();
        formDataToSend.append("vendor_email", vendorEmail);
        formDataToSend.append("hallName", formData.hallName);
        formDataToSend.append("city", formData.city);
        formDataToSend.append("location", formData.location);
        formDataToSend.append("capacity", formData.capacity);
        formDataToSend.append("price", formData.price);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("services", JSON.stringify(formData.services));

        formData.images.forEach((image) => {
          console.log("Appending image to formData:", image);
          formDataToSend.append("images", image);
        });

        console.log("Sending hall registration request...");
        const registerResponse = await axios.post(
          "http://localhost:8500/api/halls/register",
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        console.log("Hall registration response:", registerResponse.data);

        if (registerResponse.data.success) {
          console.log("Hall registered successfully");
          setMessage("Function Hall Registered Successfully!");
          setIsError(false);

          setTimeout(() => {
            navigate("/vendorhomepage");
          }, 1000);
        } else {
          throw new Error("Failed to register hall");
        }
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setMessage("Failed to process payment. Please try again.");
      setIsError(true);
    }
  };

  return (
    <form onSubmit={handlePaymentSuccess} className={styles.paymentForm}>
      <div className={styles.paymentHeader}>
        <FontAwesomeIcon icon={faCreditCard} className={styles.cardIcon} />
        <h2>Complete Your Payment</h2>
      </div>
      <div className={styles.paymentDetails}>
        <div className={styles.detailRow}>
          <span>Hall Name:</span>
          <span>{formData.hallName || "N/A"}</span>
        </div>
        <div className={styles.detailRow}>
          <span>Amount:</span>
          <span className={styles.amount}>₹{fixedPrice}</span>
        </div>
      </div>
      <CardElement className={styles.cardElement} options={{ hidePostalCode: true }} />
      <button type="submit" className={styles.payBtn}>
        <FontAwesomeIcon icon={faCreditCard} /> Pay Now
      </button>
      {message && <p className={`${styles.message} ${isError ? styles.error : ""}`}>{message}</p>}
    </form>
  );
};

const Payment = () => {
  console.log("Payment component loaded");

  const location = useLocation();
  const { formData = {}, vendorEmail = "", vendorName = "" } = location.state || {};

  console.log("Location state:", location.state);
  console.log("Form Data:", formData);
  console.log("Vendor Email:", vendorEmail);
  console.log("Vendor Name:", vendorName);

  if (!formData || !vendorEmail) {
    console.log("Missing formData or vendorEmail. Redirecting...");
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Loading payment information...</p>
      </div>
    );
  }

  console.log("Rendering payment form...");
  return (
    <Elements stripe={stripePromise}>
      <div className={styles.paymentContainer}>
        <PaymentForm formData={formData} vendorEmail={vendorEmail} vendorName={vendorName} />
      </div>
    </Elements>
  );
};

export default Payment;