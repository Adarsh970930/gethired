export default function Sidebar({ trendingSkills, stats, onSkillClick }) {
    const sourceNames = {
        adzuna: 'Adzuna',
        remotive: 'Remotive',
        remoteok: 'RemoteOK',
        arbeitnow: 'Arbeitnow',
        themuse: 'The Muse',
        jsearch: 'JSearch',
    };

    return (
        <div className="sidebar">
            {/* Trending Skills */}
            <div className="sidebar-card">
                <div className="sidebar-title">🔥 Trending Skills</div>
                {trendingSkills.map((skill, i) => (
                    <div
                        key={i}
                        className="trending-skill"
                        onClick={() => onSkillClick(skill.skill)}
                    >
                        <span className="name">{skill.skill}</span>
                        <span className="count">{skill.count}</span>
                    </div>
                ))}
                {trendingSkills.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Loading...</div>
                )}
            </div>

            {/* Sources */}
            {stats?.jobsBySource && (
                <div className="sidebar-card">
                    <div className="sidebar-title">📡 Data Sources</div>
                    {Object.entries(stats.jobsBySource).map(([source, count]) => (
                        <div key={source} className="source-item">
                            <div className="source-dot"></div>
                            <span className="source-name">{sourceNames[source] || source}</span>
                            <span className="source-count">{count} jobs</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Filters */}
            <div className="sidebar-card">
                <div className="sidebar-title">⚡ Quick Filters</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                        { emoji: '🎓', label: 'Freshers Only', action: () => onSkillClick('') },
                        { emoji: '🌍', label: 'Remote Worldwide', action: () => { } },
                        { emoji: '💰', label: 'High Salary', action: () => { } },
                        { emoji: '🆕', label: 'Posted Today', action: () => { } },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="trending-skill"
                            onClick={item.action}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="name">{item.emoji} {item.label}</span>
                            <span style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>→</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
