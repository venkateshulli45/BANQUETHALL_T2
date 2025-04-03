import React, { useState } from "react";
import styles from "./Dashboard.module.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUsers, faStore, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
    </>
  );
};

export default Dashboard;
