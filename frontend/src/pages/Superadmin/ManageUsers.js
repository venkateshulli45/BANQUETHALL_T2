import React, { useEffect, useState } from "react";
import styles from "./ManageUsers.module.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  // Fetch users from the database
  useEffect(() => {
    fetch("http://localhost:8500/api/users")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          console.error("Invalid data format:", data);
          setUsers([]);
        }
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  // Delete user function
  const handleDeleteUser = async (email) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`http://localhost:8500/api/users/${email}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.email !== email));
        console.log(`User with email ${email} deleted successfully.`);
      } else {
        console.error("Failed to delete user:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Manage Users</h2>
      
      {users.length === 0 ? (
        <p className={styles.noUsers}>No users found.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <button className={styles.deleteBtn} onClick={() => handleDeleteUser(user.email)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
