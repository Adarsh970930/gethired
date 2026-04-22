export default function Header({ stats }) {
    return (
        <header className="header">
            <div className="header-inner">
                <div className="logo">
                    <span className="logo-icon">🚀</span>
                    <span>Get Hired</span>
                </div>
                <div className="header-stats">
                    <div className="header-stat">
                        <span>🟢</span>
                        <span className="num">{stats?.activeJobs || 0}</span> Active Jobs
                    </div>
                    <div className="header-stat">
                        <span>🏢</span>
                        <span className="num">{stats?.totalCompanies || 0}</span> Companies
                    </div>
                    <div className="header-stat">
                        <span>🌍</span>
                        <span className="num">{stats?.remoteJobs || 0}</span> Remote
                    </div>
                </div>
            </div>
        </header>
    );
}
