import React from 'react';
import styles from './Filters.module.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Filters = ({ filters = {}, onFilterChange }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className={styles.filters}>
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label>Price Range</label>
          <select 
            value={filters?.price || ""}
            onChange={(e) => onFilterChange('price', e.target.value)}
          >
            <option value="">All Prices</option>
            <option value="0-50000">Under ₹50,000</option>
            <option value="50000-100000">₹50,000 - ₹1,00,000</option>
            <option value="100000+">Above ₹1,00,000</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Capacity</label>
          <select 
            value={filters?.capacity || ""}
            onChange={(e) => onFilterChange('capacity', e.target.value)}
          >
            <option value="">All Capacities</option>
            <option value="0-200">Up to 200</option>
            <option value="201-500">201 - 500</option>
            <option value="501+">500+</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Location</label>
          <select 
            value={filters?.city || ""}
            onChange={(e) => onFilterChange('city', e.target.value)}
          >
            <option value="">All Locations</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Chennai">Chennai</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Kochi">Kochi</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Rating</label>
          <select 
            value={filters?.rating || ""}
            onChange={(e) => onFilterChange('rating', e.target.value)}
          >
            <option value="">All Ratings</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Check Availability</label>
          <DatePicker
            selected={filters?.date}
            onChange={(date) => onFilterChange('date', date)}
            dateFormat="MM/dd/yyyy"
            minDate={tomorrow}
            placeholderText="Select Date"
            className={styles.datePicker}
            isClearable
          />
        </div>
      </div>
    </div>
  );
};

export default Filters;