import { jwtDecode } from 'jwt-decode';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const UserProfile = () => {
  const navigate = useNavigate();
  const [cookies]=useCookies(['authToken']);
  const user = jwtDecode(cookies.authToken);
  const userEmail = user?.email;

  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null); // Change from empty object to `null`

  useEffect(() => {
    if (!userEmail) {
      console.error("User email not found. Redirecting to login...");
      navigate('/');
      return;
    }

    console.log("User Email:", userEmail);

    fetch(`http://localhost:8500/api/users/${userEmail}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched User Data from API:", data);
        if (data.error) {
          console.error("Error fetching user:", data.error);
        } else {
          setUserData(data);
        }
      })
      .catch((error) => console.error("Fetch error:", error));
  }, [userEmail, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSave = () => {
    fetch(`http://localhost:8500/api/users/${userEmail}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: userData.name,
        phone: userData.phone,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Update error:", data.error);
        } else {
          alert("Profile updated successfully!");
          setIsEditing(false);
        }
      })
      .catch((error) => console.error("Update error:", error));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate('/');
  };

  return (
    <div className='ProfilePage'>
      <h1>Profile</h1>

      {userData ? (
        <>
          <h2>Username: {isEditing ? (
            <input type='text' name='username' value={userData.username} onChange={handleChange} />
          ) : userData.username || "No Username"}</h2>

          <h2>Email: {userData.email} (cannot be changed)</h2>

          <h2>Phone: {isEditing ? (
            <input type='text' name='phone' value={userData.phone} onChange={handleChange} />
          ) : userData.phone || "No Phone"}</h2>

          <div className='profile-buttons'>
            {isEditing ? (
              <button onClick={handleSave}>Save</button>
            ) : (
              <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
            <button onClick={handleLogout}>Logout</button>
          </div>
        </>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
};

export default UserProfile;
