import React, { useState } from "react";
import styles from "./Dashboard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faUsers,
  faStore,
  faExclamationCircle,
  faBuilding,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import ManageUsers from "./ManageUsers";
import ManageVendors from "./ManageVendors";
import IssuesDisplay from "./IssuesDisplay";
import ManageUser from "./ManageHalls";

const Dashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState("managehalls");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:8500/api/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/adminlogin";
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <div 
      className={styles.container}
      style={{
        gridTemplateColumns: `${isSidebarOpen ? 'var(--sidebar-width)' : '60px'} 1fr`
      }}
    >
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.menuButton} onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        <h1>Admin Dashboard</h1>
      </header>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarClosed : ''}`}>
        <nav>
          <ul className={styles.navMenu}>
            <li 
              className={styles.navItem}
              onClick={() => setSelectedMenu("manageUsers")}
            >
              <FontAwesomeIcon icon={faUsers} />
              <span>Manage Users</span>
            </li>
            <li 
              className={styles.navItem}
              onClick={() => setSelectedMenu("manageVendors")}
            >
              <FontAwesomeIcon icon={faStore} />
              <span>Manage Vendors</span>
            </li>
            <li 
              className={styles.navItem}
              onClick={() => setSelectedMenu("managehalls")}
            >
              <FontAwesomeIcon icon={faBuilding} />
              <span>Manage Halls</span>
            </li>
            <li 
              className={styles.navItem}
              onClick={() => setSelectedMenu("issues")}
            >
              <FontAwesomeIcon icon={faExclamationCircle} />
              <span>Payment Display</span>
            </li>
            <li
            className={styles.navItem}
            ><button onClick={handleLogout}>
              <FontAwesomeIcon icon={faRightFromBracket} />
              <span>Logout</span>
            </button>

            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.content}>
        <div className={styles.contentInner}>
          {selectedMenu === "manageUsers" && <ManageUsers />}
          {selectedMenu === "manageVendors" && <ManageVendors />}
          {selectedMenu === "managehalls" && <ManageUser />}
          {selectedMenu === "issues" && <IssuesDisplay />}
          {selectedMenu === "logout"}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;