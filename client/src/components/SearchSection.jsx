import { useState } from 'react';

export default function SearchSection({ filters, filterOptions, onFilterChange, onClear }) {
    const [searchText, setSearchText] = useState(filters.q || '');

    const handleSearch = (e) => {
        e.preventDefault();
        onFilterChange('q', searchText);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onFilterChange('q', searchText);
        }
    };

    const activeFilters = Object.entries(filters).filter(([k, v]) => v && k !== 'q');

    return (
        <div className="search-section">
            <form className="search-row" onSubmit={handleSearch}>
                <div className="search-input-wrap">
                    <span className="icon">🔍</span>
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search jobs... e.g. React Developer, Data Analyst, Marketing"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <button type="submit" className="search-btn">
                    🔍 Search Jobs
                </button>
            </form>

            <div className="filters-row">
                <select
                    className="filter-select"
                    value={filters.jobType || ''}
                    onChange={e => onFilterChange('jobType', e.target.value)}
                >
                    <option value="">All Job Types</option>
                    <option value="internship">🎓 Internship</option>
                    <option value="full-time">💼 Full Time</option>
                    <option value="part-time">⏰ Part Time</option>
                    <option value="contract">📝 Contract</option>
                    <option value="freelance">🆓 Freelance</option>
                </select>

                <select
                    className="filter-select"
                    value={filters.experienceLevel || ''}
                    onChange={e => onFilterChange('experienceLevel', e.target.value)}
                >
                    <option value="">All Experience</option>
                    <option value="fresher">🌱 Fresher</option>
                    <option value="junior">📗 Junior (1-2 yr)</option>
                    <option value="mid">📘 Mid (3-5 yr)</option>
                    <option value="senior">📕 Senior (5+ yr)</option>
                    <option value="lead">⭐ Lead / Principal</option>
                    <option value="executive">👔 Executive</option>
                </select>

                <select
                    className="filter-select"
                    value={filters.category || ''}
                    onChange={e => onFilterChange('category', e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="engineering">💻 Engineering</option>
                    <option value="design">🎨 Design</option>
                    <option value="data-science">📊 Data Science</option>
                    <option value="devops">☁️ DevOps</option>
                    <option value="marketing">📢 Marketing</option>
                    <option value="sales">🤝 Sales</option>
                    <option value="finance">💰 Finance</option>
                    <option value="hr">👥 HR</option>
                    <option value="product">📦 Product</option>
                    <option value="customer-support">🎧 Support</option>
                    <option value="writing">✍️ Writing</option>
                    <option value="operations">⚙️ Operations</option>
                </select>

                <select
                    className="filter-select"
                    value={filters.remote || ''}
                    onChange={e => onFilterChange('remote', e.target.value)}
                >
                    <option value="">All Work Modes</option>
                    <option value="true">🌍 Remote Only</option>
                </select>

                <select
                    className="filter-select"
                    value={filters.postedWithin || ''}
                    onChange={e => onFilterChange('postedWithin', e.target.value)}
                >
                    <option value="">Any Time</option>
                    <option value="1">Last 24 hours</option>
                    <option value="3">Last 3 days</option>
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                    <option value="30">Last 30 days</option>
                </select>

                {Object.keys(filters).length > 0 && (
                    <button className="clear-btn" onClick={onClear}>
                        ✕ Clear All
                    </button>
                )}
            </div>

            {activeFilters.length > 0 && (
                <div className="active-filters">
                    {filters.q && (
                        <span className="filter-tag" onClick={() => { onFilterChange('q', ''); setSearchText(''); }}>
                            Search: "{filters.q}" <span className="x">✕</span>
                        </span>
                    )}
                    {activeFilters.map(([key, value]) => (
                        <span key={key} className="filter-tag" onClick={() => onFilterChange(key, '')}>
                            {key}: {value} <span className="x">✕</span>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
