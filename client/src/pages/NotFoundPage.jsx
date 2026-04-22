import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFoundPage() {
    return (
        <div className="auth-page">
            <SEO title="Page Not Found" noIndex />
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🔍</div>
                <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '8px' }}>404</h1>
                <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '32px' }}>
                    The page you're looking for doesn't exist
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Link to="/" className="btn btn-primary">Go Home</Link>
                    <Link to="/jobs" className="btn btn-secondary">Browse Jobs</Link>
                </div>
            </div>
        </div>
    );
}
