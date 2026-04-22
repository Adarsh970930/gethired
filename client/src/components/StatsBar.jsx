export default function StatsBar({ stats }) {
    if (!stats) return null;

    const items = [
        { icon: '📋', label: 'Total Jobs', value: stats.activeJobs || 0, color: 'purple' },
        { icon: '🎓', label: 'Internships', value: stats.jobsByType?.internship || 0, color: 'orange' },
        { icon: '💼', label: 'Full Time', value: stats.jobsByType?.['full-time'] || 0, color: 'green' },
        { icon: '🌍', label: 'Remote', value: stats.remoteJobs || 0, color: 'blue' },
        { icon: '🏢', label: 'Companies', value: stats.totalCompanies || 0, color: 'pink' },
    ];

    return (
        <div className="stats-bar">
            {items.map((item, i) => (
                <div className="stat-card" key={i}>
                    <div className={`stat-icon ${item.color}`}>{item.icon}</div>
                    <div className="stat-info">
                        <h3>{item.value}</h3>
                        <p>{item.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
