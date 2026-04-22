import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineChip, HiOutlinePencil, HiOutlineCheck } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

export default function ProfilePage() {
    const { user, isAuthenticated, setUser } = useAuth();
    const navigate = useNavigate();

    const [profileForm, setProfileForm] = useState({
        name: '',
        bio: '',
        skills: '',
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (user) {
            setProfileForm({
                name: user.name || '',
                bio: user.bio || '',
                skills: (user.skills || []).join(', '),
            });
        }
    }, [user, isAuthenticated, navigate]);

    async function handleProfileSave(e) {
        e.preventDefault();
        if (!profileForm.name.trim()) {
            toast.error('Name is required');
            return;
        }
        setProfileLoading(true);
        try {
            const skills = profileForm.skills
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);

            const res = await axios.put('/api/auth/profile', {
                name: profileForm.name.trim(),
                bio: profileForm.bio.trim(),
                skills,
            });
            if (setUser) setUser(res.data.data);
            toast.success('Profile updated! ✅');
            setEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    }

    async function handlePasswordChange(e) {
        e.preventDefault();
        if (passwordForm.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setPasswordLoading(true);
        try {
            await axios.put('/api/auth/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            toast.success('Password changed successfully! 🔐');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    }

    if (!isAuthenticated) return null;

    return (
        <div className="container" style={{ maxWidth: '700px', padding: '40px 20px' }}>
            <SEO title="Profile" description="Manage your Get Hired profile, skills, and account settings." noIndex />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>👤 Profile</h1>
            <p className="text-muted" style={{ marginBottom: '32px' }}>Manage your account details</p>

            {/* Profile Info Card */}
            <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Personal Information</h2>
                    {!editing && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                            <HiOutlinePencil /> Edit
                        </button>
                    )}
                </div>

                {editing ? (
                    <form onSubmit={handleProfileSave}>
                        <div className="form-group">
                            <label className="form-label">
                                <HiOutlineUser style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                Full Name
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                placeholder="Your name"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                <HiOutlinePencil style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                Bio
                            </label>
                            <textarea
                                className="form-input"
                                value={profileForm.bio}
                                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                placeholder="Tell us about yourself..."
                                rows={3}
                                style={{ resize: 'vertical', fontFamily: 'inherit' }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                <HiOutlineChip style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                Skills (comma-separated)
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                value={profileForm.skills}
                                onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                                placeholder="React, Python, Java, Node.js..."
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                                <HiOutlineCheck /> {profileLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" className="btn btn-ghost" onClick={() => {
                                setEditing(false);
                                setProfileForm({
                                    name: user.name || '',
                                    bio: user.bio || '',
                                    skills: (user.skills || []).join(', '),
                                });
                            }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Name</div>
                            <div style={{ fontWeight: 600 }}>{user?.name}</div>
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Email</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <HiOutlineMail style={{ color: 'var(--accent)' }} />
                                {user?.email}
                            </div>
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Bio</div>
                            <div>{user?.bio || <span className="text-muted" style={{ fontStyle: 'italic' }}>No bio added</span>}</div>
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Skills</div>
                            {user?.skills?.length > 0 ? (
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {user.skills.map(s => (
                                        <span key={s} className="badge badge-skill">{s}</span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-muted" style={{ fontStyle: 'italic' }}>No skills added</span>
                            )}
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Member Since</div>
                            <div>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</div>
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Role</div>
                            <span className={`badge ${user?.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                                {user?.role || 'user'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Change Password Card */}
            <div className="card" style={{ padding: '28px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>
                    <HiOutlineLockClosed style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    Change Password
                </h2>
                <form onSubmit={handlePasswordChange}>
                    <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="Enter new password (min 6 characters)"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                        />
                    </div>
                    <button type="submit" className="btn btn-secondary" disabled={passwordLoading} style={{ marginTop: '8px' }}>
                        {passwordLoading ? 'Changing...' : '🔐 Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
