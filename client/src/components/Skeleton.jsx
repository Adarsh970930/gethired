export function SkeletonCard() {
    return (
        <div className="card skeleton-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                    <div className="skeleton skeleton-line" style={{ width: '220px', height: '18px', marginBottom: '8px' }} />
                    <div className="skeleton skeleton-line" style={{ width: '140px', height: '14px' }} />
                </div>
                <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <div className="skeleton skeleton-badge" style={{ width: '70px', height: '24px', borderRadius: '12px' }} />
                <div className="skeleton skeleton-badge" style={{ width: '55px', height: '24px', borderRadius: '12px' }} />
                <div className="skeleton skeleton-badge" style={{ width: '80px', height: '24px', borderRadius: '12px' }} />
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                <div className="skeleton skeleton-badge" style={{ width: '50px', height: '22px', borderRadius: '6px' }} />
                <div className="skeleton skeleton-badge" style={{ width: '60px', height: '22px', borderRadius: '6px' }} />
                <div className="skeleton skeleton-badge" style={{ width: '40px', height: '22px', borderRadius: '6px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="skeleton skeleton-line" style={{ width: '100px', height: '14px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="skeleton" style={{ width: '24px', height: '24px', borderRadius: '6px' }} />
                    <div className="skeleton" style={{ width: '24px', height: '24px', borderRadius: '6px' }} />
                </div>
            </div>
        </div>
    );
}

export function SkeletonDetail() {
    return (
        <div className="container" style={{ maxWidth: '900px', padding: '40px 20px' }}>
            <div className="skeleton skeleton-line" style={{ width: '120px', height: '16px', marginBottom: '20px' }} />
            <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <div className="skeleton skeleton-line" style={{ width: '300px', height: '24px', marginBottom: '10px' }} />
                        <div className="skeleton skeleton-line" style={{ width: '180px', height: '16px', marginBottom: '12px' }} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div className="skeleton skeleton-badge" style={{ width: '70px', height: '26px', borderRadius: '12px' }} />
                            <div className="skeleton skeleton-badge" style={{ width: '55px', height: '26px', borderRadius: '12px' }} />
                            <div className="skeleton skeleton-badge" style={{ width: '80px', height: '26px', borderRadius: '12px' }} />
                        </div>
                    </div>
                    <div className="skeleton" style={{ width: '50px', height: '50px', borderRadius: '12px' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <div className="skeleton" style={{ width: '200px', height: '44px', borderRadius: '10px' }} />
                    <div className="skeleton" style={{ width: '90px', height: '44px', borderRadius: '10px' }} />
                    <div className="skeleton" style={{ width: '80px', height: '44px', borderRadius: '10px' }} />
                </div>
            </div>
            <div className="card" style={{ padding: '28px' }}>
                <div className="skeleton skeleton-line" style={{ width: '160px', height: '20px', marginBottom: '16px' }} />
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="skeleton skeleton-line" style={{ width: `${90 - i * 8}%`, height: '14px', marginBottom: '10px' }} />
                ))}
            </div>
        </div>
    );
}

export function SkeletonStats() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="card" style={{ padding: '20px' }}>
                    <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '10px', marginBottom: '12px' }} />
                    <div className="skeleton skeleton-line" style={{ width: '80px', height: '24px', marginBottom: '6px' }} />
                    <div className="skeleton skeleton-line" style={{ width: '100px', height: '14px' }} />
                </div>
            ))}
        </div>
    );
}
