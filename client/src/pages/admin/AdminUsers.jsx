import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiOutlineShieldCheck, HiOutlineBan, HiOutlineSearch } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/users');
            setUsers(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }

    async function toggleUserRole(userId) {
        if (currentUser && currentUser._id === userId) {
            return toast.error("You cannot change your own role");
        }
        if (!confirm('Change user role?')) return;
        try {
            const res = await axios.put(`/api/admin/users/${userId}/role`);
            toast.success(res.data.message);
            setUsers(users.map(u => u._id === userId ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u));
        } catch (err) {
            toast.error('Failed to update user role');
        }
    }

    async function toggleUserActive(userId) {
        if (currentUser && currentUser._id === userId) {
            return toast.error("You cannot ban yourself");
        }
        if (!confirm('Are you sure you want to ban/unban this user?')) return;
        try {
            const res = await axios.put(`/api/admin/users/${userId}/deactivate`);
            toast.success(res.data.message);
            setUsers(users.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
        } catch (err) {
            toast.error('Failed to update user status');
        }
    }

    return (
        <div className="admin-page animate-fade-in">
            <div className="admin-page-header flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-heading">Platform Users</h1>
                    <p className="text-sm text-secondary">Manage {users.length} registered accounts and their privileges.</p>
                </div>
                <div className="relative">
                    <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        className="bg-bg-input border border-border rounded-md py-2 px-10 text-sm focus:border-accent outline-none text-primary w-64"
                        placeholder="Search users by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="admin-card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-muted">Loading users...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="admin-table w-full text-sm text-left">
                            <thead className="bg-bg-secondary text-secondary text-xs uppercase border-b border-border">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(u => (
                                    <tr key={u._id} className="border-b border-border hover:bg-bg-card-hover transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-heading">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted">{u.email}</td>
                                        <td className="px-6 py-4">
                                            {u.role === 'admin' ? (
                                                <span className="px-2 py-1 rounded bg-accent-light text-accent text-xs font-bold uppercase tracking-wider">Admin</span>
                                            ) : (
                                                <span className="px-2 py-1 rounded bg-bg-secondary text-secondary border border-border text-xs font-bold uppercase tracking-wider">User</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.isActive ? (
                                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-success-light text-success">Active</span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-danger-light text-danger">Banned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className={`p-2 rounded transition-colors ${currentUser?._id === u._id ? 'opacity-30 cursor-not-allowed text-muted' : 'hover:bg-info-light text-info'}`} title="Toggle Admin Role" onClick={() => toggleUserRole(u._id)} disabled={currentUser?._id === u._id}>
                                                    <HiOutlineShieldCheck size={18} />
                                                </button>
                                                <button className={`p-2 rounded transition-colors ${currentUser?._id === u._id ? 'opacity-30 cursor-not-allowed text-muted' : (u.isActive ? 'hover:bg-warning-light text-warning' : 'hover:bg-success-light text-success')}`} title={u.isActive ? 'Ban User' : 'Unban User'} onClick={() => toggleUserActive(u._id)} disabled={currentUser?._id === u._id}>
                                                    <HiOutlineBan size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
