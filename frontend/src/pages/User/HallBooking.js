import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HallBooking = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        mobile: "",
        alternate: "",
        type: "",
        guests: "",
        date: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePayment = (e) => {
        e.preventDefault();
        console.log("Navigating with data:", formData); // Debugging log

        // Store data in sessionStorage
        sessionStorage.setItem("bookingDetails", JSON.stringify(formData));

        navigate('/UserPayment', { state: { bookingDetails: formData } });
        alert("Do not close the window");
    };

    return (
        <div className='Booking'>
            <form className='bookingform' onSubmit={handlePayment}>
                <h1>Book your moments</h1>
                <label>First Name: </label>
                <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} required /><br />

                <label>Last Name: </label>
                <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} required /><br />

                <label>Email: </label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required /><br />

                <label>Mobile Number: </label>
                <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required /><br />

                <label>Alternate Mobile: </label>
                <input type="text" name="alternate" value={formData.alternate} onChange={handleChange} /><br />

                <label>Type of Event: </label>
                <input type="text" name="type" value={formData.type} onChange={handleChange} placeholder="Marriage, Birthday, etc." /><br />

                <label>Number of Guests: </label>
                <input type="number" name="guests" value={formData.guests} onChange={handleChange} required /><br />

                <label>Event Date: </label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required /><br />

                <button type="submit">Continue to Payment</button>
            </form>
        </div>
    );
};

export default HallBooking;
