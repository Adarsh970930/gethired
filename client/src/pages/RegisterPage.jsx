import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) { navigate('/dashboard', { replace: true }); return null; }

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (form.password !== form.confirm) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await register(form.name, form.email, form.password);
            toast.success('Welcome to Get Hired! 🎉');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally { setLoading(false); }
    }

    return (
        <div className="auth-page">
            <SEO title="Create Account" description="Join Get Hired — India's #1 job aggregator for engineers and students. Sign up free to track applications and save jobs." noIndex />
            <div className="card auth-card">
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Start tracking your dream job today</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" name="name" className="form-input" placeholder="John Doe" value={form.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" className="form-input" placeholder="At least 6 characters" value={form.password} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input type="password" name="confirm" className="form-input" placeholder="Repeat your password" value={form.confirm} onChange={handleChange} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
