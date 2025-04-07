import React, { useEffect, useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import styles from './ManageHalls.module.css';
 
 const ManageHalls = () => {
   const [halls, setHalls] = useState([]);
   const navigate = useNavigate();
 
   useEffect(() => {
     const fetchHalls = async () => {
       try {
         const response = await fetch("http://localhost:8500/api/halls");
         const data = await response.json();
         setHalls(data);
       } catch (error) {
         console.error("Error fetching halls:", error);
       }
     };
 
     fetchHalls();
   }, []);
 
   const handleViewDetails = (hallId) => {
     navigate(`/hall-details/${hallId}`);
   };
 
   return (
     <div className={styles.container}>
       <h2 className={styles.title}>Manage Halls</h2>
       <div className={styles.tableWrapper}>
         <table className={styles.table}>
           <thead>
             <tr>
               <th>Hall Name</th>
               <th>Email</th>
               <th>Capacity</th>
               <th>City</th>
               <th>Status</th>
               <th>Full Details</th>
             </tr>
           </thead>
           <tbody>
             {halls.map((hall) => (
               <tr key={hall.id}>
                 <td>{hall.hall_name}</td>
                 <td>{hall.vendor_email}</td>
                 <td>{hall.capacity}</td>
                 <td>{hall.city}</td>
                 <td className={
                     hall.statusOfHall === 1 
                       ? styles.approved 
                       : hall.statusOfHall === 0 
                         ? styles.rejected 
                         : styles.pending
                   }>
                     {hall.statusOfHall === 1 
                       ? "Approved" 
                       : hall.statusOfHall === 0 
                         ? "Rejected" 
                         : "Under Process"}
                 </td>
 
                 <td>
                   <button
                     type="button"
                     className={styles.detailButton}
                     onClick={() => handleViewDetails(hall.id)}
                   >
                     Click Here
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </div>
   );
 };
 
 export default ManageHalls;