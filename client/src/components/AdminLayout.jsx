import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineHome, HiOutlineBriefcase, HiOutlineUsers, HiOutlineLink, HiOutlineLogout, HiOutlineMenu, HiOutlineX, HiOutlineCog } from 'react-icons/hi';
import SEO from './SEO';
import ThemeToggle from './ThemeToggle';

export default function AdminLayout() {
    const { user, isAuthenticated, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) navigate('/login');
            else if (user?.role !== 'admin') navigate('/dashboard');
        }
    }, [isAuthenticated, user, navigate, loading]);

    if (loading) {
        return <div className="p-8 text-center text-muted w-full h-screen flex justify-center items-center bg-bg-primary">Loading Admin Panel...</div>;
    }

    if (!isAuthenticated || user?.role !== 'admin') return null;

    function handleLogout() {
        logout();
        navigate('/');
    }

    return (
        <div className="admin-layout">
            <SEO title="Admin Portal" description="Manage Get Hired system." noIndex />
            {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)}></div>}

            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="logo-icon" style={{ fontSize: '1.4rem' }}>🚀</span>
                        <span className="brand-text" style={{ fontSize: '1.2rem', fontWeight: 800 }}>Admin Portal</span>
                    </div>
                    <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}><HiOutlineX /></button>
                </div>
                <div className="admin-sidebar-nav">
                    <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                        <HiOutlineHome className="nav-icon" /> <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/jobs" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                        <HiOutlineBriefcase className="nav-icon" /> <span>Job Management</span>
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                        <HiOutlineUsers className="nav-icon" /> <span>User Management</span>
                    </NavLink>
                    <NavLink to="/admin/sources" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                        <HiOutlineLink className="nav-icon" /> <span>Scraper Sources</span>
                    </NavLink>
                    <NavLink to="/admin/settings" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                        <HiOutlineCog className="nav-icon" /> <span>Settings</span>
                    </NavLink>
                </div>
                <div className="admin-sidebar-footer">
                    <button className="admin-nav-link text-danger" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                        <HiOutlineLogout className="nav-icon" /> <span>Logout</span>
                    </button>
                </div>
            </aside>

            <div className="admin-main">
                <header className="admin-header">
                    <button className="admin-menu-toggle" onClick={() => setSidebarOpen(true)}>
                        <HiOutlineMenu />
                    </button>
                    <div className="admin-header-right ml-auto flex items-center gap-4">
                        <ThemeToggle />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }} className="text-heading hidden sm:block">{user.name}</span>
                        <div className="nav-user-avatar" style={{ width: '36px', height: '36px', margin: 0 }}>
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>
                <main className="admin-content-viewport bg-bg-primary">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
