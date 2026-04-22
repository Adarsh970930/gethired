import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SavedJobsPage from './pages/SavedJobsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminJobs from './pages/admin/AdminJobs';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSources from './pages/admin/AdminSources';
import AdminSettings from './pages/admin/AdminSettings';

import './index.css';

// User specific layout with Navbar and Footer
const MainLayout = () => (
    <div className="app-layout">
        <Navbar />
        <main className="main-content">
            <Outlet />
        </main>
        <Footer />
    </div>
);

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* User Routes */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/jobs" element={<JobsPage />} />
                        <Route path="/jobs/:id" element={<JobDetailPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/saved" element={<SavedJobsPage />} />
                        <Route path="/applications" element={<ApplicationsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>

                    {/* Admin Specific Nested Layout */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="jobs" element={<AdminJobs />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="sources" element={<AdminSources />} />
                        <Route path="settings" element={<AdminSettings />} />
                    </Route>
                </Routes>

                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        className: 'theme-toast',
                        style: {
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                        },
                        success: {
                            iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' },
                        },
                        error: {
                            iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-card)' },
                        },
                    }}
                />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
