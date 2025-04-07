// Home/home.js
import React, { useState, useEffect } from 'react';
import styles from './home.module.css';
import { useNavigate } from 'react-router-dom';
import Filters from './Filters';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from '../../context/ThemeContext'; // ⬅️ Theme context

function Home() {
    const navigate = useNavigate();
    const { theme } = useTheme(); // ⬅️ Get current theme
    const [allHalls, setAllHalls] = useState([]);
    const [filteredHalls, setFilteredHalls] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(24);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        price: "",
        capacity: "",
        location: "", // ⬅️ Fixed to use 'location' instead of 'city'
        rating: "",
        date: null
    });

    const fetchHalls = async () => {
        try {
            const response = await fetch("http://localhost:8500/api/halls");

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched halls:", data);

            if (Array.isArray(data)) {
                const approvedHalls = data.filter(hall => hall.statusOfHall === 1);
                setAllHalls(approvedHalls);
                setFilteredHalls(approvedHalls);
            } else {
                console.error("Unexpected response format:", data);
                setAllHalls([]);
                setFilteredHalls([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setAllHalls([]);
            setFilteredHalls([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHalls();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, allHalls]);

    const applyFilters = () => {
        let result = [...allHalls];

        // Price
        if (filters.price) {
            if (filters.price === "100000+") {
                result = result.filter(hall => hall.price > 100000);
            } else {
                const [min, max] = filters.price.split('-').map(Number);
                result = result.filter(hall => hall.price >= min && hall.price <= max);
            }
        }

        // Capacity
        if (filters.capacity) {
            if (filters.capacity.endsWith('+')) {
                const min = parseInt(filters.capacity);
                result = result.filter(hall => hall.capacity >= min);
            } else {
                const [min, max] = filters.capacity.split('-').map(Number);
                result = result.filter(hall => hall.capacity >= min && hall.capacity <= max);
            }
        }

        // Location (was 'city' before - fixed to use 'location')
        if (filters.location) {
            result = result.filter(hall =>
                hall.city.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        // Rating
        if (filters.rating) {
            const minRating = Number(filters.rating);
            result = result.filter(hall => hall.rating >= minRating);
        }

        // Date (placeholder for future API availability check)
        if (filters.date) {
            // Placeholder logic
        }

        setFilteredHalls(result);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filteredHalls.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredHalls.slice(indexOfFirstItem, indexOfLastItem);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    return (
        <div className={theme}> {/* ⬅️ Apply global theme */}
            <Navbar />
            <div className={styles.home}>
                <Filters filters={filters} onFilterChange={handleFilterChange} />

                <main className={styles.con1}>
                    {loading ? (
                        <p>Loading halls...</p>
                    ) : currentItems.length > 0 ? (
                        currentItems.map((hall) => (
                            <div
                                key={hall._id || hall.id}
                                onClick={() => navigate('/HomeDetails', { state: { hall } })}
                                className={styles.hall1}
                            >
                                {hall.images && hall.images.length > 0 ? (
                                    <img
                                        src={`http://localhost:8500/uploads/${hall.images[0]}`}
                                        alt={hall.hall_name}
                                        style={{ objectFit: 'cover', width: '100%', height: '200px' }}
                                    />
                                ) : (
                                    <div style={{ height: '200px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <p>No Image Available</p>
                                    </div>
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
                <Footer />
            </div>
        </div>
    );
}

export default Home;
