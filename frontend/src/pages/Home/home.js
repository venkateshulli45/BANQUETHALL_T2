// Home/home.js
import React, { useState, useEffect } from 'react';
import styles from './home.module.css';
import { useNavigate } from 'react-router-dom';
import Filters from './Filters';
import Navbar from './Navbar';
import Footer from './Footer';

function Home() {
    const navigate = useNavigate();
    const [allHalls, setAllHalls] = useState([]); // Store all halls from API
    const [filteredHalls, setFilteredHalls] = useState([]); // Store filtered halls
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(24);

    const [filters, setFilters] = useState({
        price: "",
        capacity: "",
        location: "",
        rating: "",
        date: null
    });

    // Fetch halls from backend
    const fetchHalls = async () => {
        try {
            const response = await fetch("http://localhost:8500/api/halls");
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("Fetched halls:", data);
    
            if (Array.isArray(data)) {
                // Filter only approved halls where statusOfHall is 1
                const approvedHalls = data.filter(hall => hall.statusOfHall === 1);
                
                setAllHalls(approvedHalls);
                setFilteredHalls(approvedHalls); // Initialize filtered halls with approved data
            } else {
                console.error("Unexpected response format:", data);
                setAllHalls([]);
                setFilteredHalls([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setAllHalls([]);
            setFilteredHalls([]);
        }
    };

    // Apply filters whenever filters state changes
    useEffect(() => {
        applyFilters();
    }, [filters, allHalls]);

    const applyFilters = () => {
        let result = [...allHalls];
        
        // Price filter
        if (filters.price) {
            if (filters.price === "100000+") {
                result = result.filter(hall => hall.price > 100000);
            } else {
                const [min, max] = filters.price.split('-').map(Number);
                result = result.filter(hall => hall.price >= min && hall.price <= max);
            }
        }
        
      // Capacity filter - fixed this section
    if (filters.capacity) {
        if (filters.capacity.endsWith('+')) {
            const min = parseInt(filters.capacity);
            result = result.filter(hall => hall.capacity >= min);
        } else {
            const [min, max] = filters.capacity.split('-').map(Number);
            result = result.filter(hall => hall.capacity >= min && hall.capacity <= max);
        }
    }
        
        // Location filter
        if (filters.city) {
            result = result.filter(hall => 
                hall.city.toLowerCase().includes(filters.city.toLowerCase())
            );
        }
        
        // Rating filter
        if (filters.rating) {
            const minRating = Number(filters.rating);
            result = result.filter(hall => hall.rating >= minRating);
        }
        
        // Date filter (you'll need to implement availability check with your backend)
        // This is a placeholder - you'll need to adjust based on your actual availability data
        if (filters.date) {
            // You would typically make an API call here to check availability
            // For now, we'll just pass all halls
            // result = result.filter(hall => isHallAvailable(hall.id, filters.date));
        }
        
        setFilteredHalls(result);
        setCurrentPage(1); // Reset to first page when filters change
    };

    useEffect(() => {
        fetchHalls();
    }, []);

    const totalPages = Math.ceil(filteredHalls.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredHalls.slice(indexOfFirstItem, indexOfLastItem);

    // Update filter state
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };


    
    return (
        <div>
            <Navbar/>
            <div className={styles.home}>
                <Filters filters={filters} onFilterChange={handleFilterChange} />

                <main className={styles.con1}>
                    {currentItems.length > 0 ? (
                        currentItems.map((hall) => (
                            <div 
                                key={hall.id} 
                                onClick={() => navigate('/HomeDetails', { state: { hall } })}
                                className={styles.hall1}
                            >
                                {hall.images ? (
                            <img
                                src={`http://localhost:8500/uploads/${hall.images[0]}`}
                                alt={hall.hall_name}
                                style={{  objectFit: 'cover' }}
                            />
                        ) : (
                            <p>No Image Available</p>
                        )}

                                <hr />
                                <div className={styles.halldata}>
                                    <h3>{hall.hall_name}</h3>
                                    <div className={styles.spec}>
                                        <div>₹{hall.price}</div>
                                        <div>⭐ {hall.rating}</div>
                                        <div>🪑 {hall.capacity}</div>
                                        <div>📍 {hall.city}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noResults}>No halls match your filters</div>
                    )}
                </main>

                {/* Pagination */}
                {filteredHalls.length > itemsPerPage && (
                    <div className={styles.pagination}>
                        <button 
                            onClick={() => setCurrentPage(currentPage - 1)} 
                            disabled={currentPage === 1} 
                            className={styles.paginationButton}
                        >
                            Previous
                        </button>
                        <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                        <button 
                            onClick={() => setCurrentPage(currentPage + 1)} 
                            disabled={currentPage === totalPages} 
                            className={styles.paginationButton}
                        >
                            Next
                        </button>
                    </div>
                )}

                <footer className={styles.footer}></footer>

                <Footer/>
            </div>
        </div>
    );
}

export default Home;