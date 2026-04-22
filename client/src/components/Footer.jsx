import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div>
                        <div className="footer-brand">🚀 Get Hired</div>
                        <p className="footer-text" style={{ marginTop: '8px' }}>
                            India's #1 Job Aggregator for Engineers & Students
                        </p>
                    </div>
                    <div className="footer-links">
                        <Link to="/jobs" className="footer-link">Browse Jobs</Link>
                        <Link to="/register" className="footer-link">Sign Up</Link>
                    </div>
                    <div className="footer-text">
                        © 2026 Get Hired. Built with ❤️ in India
                    </div>
                </div>
            </div>
        </footer>
    );
}
