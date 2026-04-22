import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HiOutlineBriefcase, HiOutlineBookmark, HiOutlineViewGrid, HiOutlineLogin, HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiOutlineUser, HiOutlineClipboardList } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleLogout() {
        logout();
        setShowDropdown(false);
        navigate('/');
    }

    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="navbar-brand">
                    <span className="logo-icon">🚀</span>
                    <span className="brand-text">Get Hired</span>
                </Link>

                <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
                </button>

                <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
                    {user?.role !== 'admin' && (
                        <NavLink to="/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setMobileOpen(false)}>
                            <HiOutlineBriefcase className="nav-icon" />
                            <span>Jobs</span>
                        </NavLink>
                    )}

                    {isAuthenticated && user?.role !== 'admin' && (
                        <>
                            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}>
                                <HiOutlineViewGrid className="nav-icon" />
                                <span>Dashboard</span>
                            </NavLink>
                            <NavLink to="/saved" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}>
                                <HiOutlineBookmark className="nav-icon" />
                                <span>Saved</span>
                            </NavLink>
                        </>
                    )}

                    <div className="flex items-center mx-2">
                        <ThemeToggle />
                    </div>

                    {isAuthenticated ? (
                        <div className="nav-user-menu" ref={dropdownRef}>
                            <button className="nav-user-btn" onClick={() => setShowDropdown(!showDropdown)}>
                                <div className="nav-user-avatar">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span style={{ fontSize: '0.9rem' }}>{user?.name?.split(' ')[0]}</span>
                            </button>
                            {showDropdown && (
                                <div className="nav-dropdown">
                                    {user?.role !== 'admin' && (
                                        <>
                                            <Link to="/dashboard" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                                                <HiOutlineViewGrid /> Dashboard
                                            </Link>
                                            <Link to="/saved" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                                                <HiOutlineBookmark /> Saved Jobs
                                            </Link>
                                            <Link to="/applications" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                                                <HiOutlineClipboardList /> Applications
                                            </Link>
                                        </>
                                    )}
                                    {user?.role === 'admin' && (
                                        <Link to="/admin" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                                            <HiOutlineViewGrid /> Admin Panel
                                        </Link>
                                    )}
                                    <Link to="/profile" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                                        <HiOutlineUser /> Profile
                                    </Link>
                                    <div className="nav-dropdown-divider" />
                                    <button className="nav-dropdown-item" onClick={handleLogout}>
                                        <HiOutlineLogout /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="nav-btn nav-btn-outline" onClick={() => setMobileOpen(false)}>
                                <HiOutlineLogin /> Login
                            </Link>
                            <Link to="/register" className="nav-btn nav-btn-primary" onClick={() => setMobileOpen(false)}>
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
