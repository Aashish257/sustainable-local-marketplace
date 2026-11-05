import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { ADMIN } from '../../../services/endpoints';
import { SkeletonGrid } from '../../../shared/components/SkeletonLoader';
import EmptyState from '../../../shared/components/EmptyState';
import toast from 'react-hot-toast';
import { Users, Shield, Trash2, Search, UserCheck, Mail, Calendar, ShieldAlert, Ban } from 'lucide-react';

const AdminUsers = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => apiClient.get(ADMIN.USERS).then(r => r.data)
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ id, role }) => 
            apiClient.patch(`/admin/users/${id}/role`, { role }).then(r => r.data),
        onSuccess: () => {
            toast.success('User role permission updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Failed to update user role.');
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id) => 
            apiClient.delete(`/admin/users/${id}`).then(r => r.data),
        onSuccess: () => {
            toast.success('User deleted');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Could not delete the user.');
        }
    });

    // Suspend (active: false) or reactivate a user; suspension logs them out everywhere
    const statusMutation = useMutation({
        mutationFn: ({ id, active }) =>
            apiClient.patch(`/admin/users/${id}/status`, { active }).then(r => r.data),
        onSuccess: (_, { active }) => {
            toast.success(active ? 'Account reactivated' : 'Account suspended and signed out');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (err) => toast.error(err.response?.data?.error || 'Failed to update account status.')
    });

    if (isLoading) return <div className="container mx-auto py-12"><SkeletonGrid count={4} /></div>;
    if (isError) return (
        <div className="glass-card p-8 rounded-3xl border border-rose-500/30 text-rose-500 text-sm font-mono flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>FAILED TO LOAD USER CLAIMS. Verify admin privileges.</span>
        </div>
    );

    const users = data?.data || [];

    const filteredUsers = users.filter(u => {
        const matchesSearch = 
            (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleRoleChange = (id, role) => {
        updateRoleMutation.mutate({ id, role });
    };

    const handleDelete = (id, name) => {
        if (!window.confirm(`Delete user "${name}"? This action cannot be undone.`)) return;
        deleteUserMutation.mutate(id);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        IDENTITY &amp; CLAIMS DIRECTORY
                    </div>
                    <h1 className="text-3xl font-display font-extrabold text-[var(--text-main)]">Users</h1>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {users.length} registered participant identities across the ecosystem
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-all w-48 sm:w-60"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-emerald-500 font-medium transition-all"
                    >
                        <option value="all">All Roles</option>
                        <option value="buyer">Buyers</option>
                        <option value="seller">Sellers</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>
            
            {/* Users Table */}
            {filteredUsers.length === 0 ? (
                <EmptyState
                    title="No users found"
                    message={searchTerm ? "No user accounts match your search criteria." : "No registered accounts on the platform yet."}
                />
            ) : (
                <div className="glass-card rounded-3xl border border-[var(--border-card)] overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[var(--text-muted)] border-b border-[var(--border-card)] font-bold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4">USER IDENTITY</th>
                                    <th className="px-6 py-4">CONTACT CREDENTIAL</th>
                                    <th className="px-6 py-4">ACCESS PRIVILEGE</th>
                                    <th className="px-6 py-4 hidden md:table-cell">REGISTERED</th>
                                    <th className="px-6 py-4 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-card)] font-medium">
                                {filteredUsers.map(u => {
                                    const initials = u.name ? u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';
                                    return (
                                        <tr key={u._id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[var(--text-main)] text-sm">{u.name}</p>
                                                        {u.isActive === false && (
                                                            <span className="text-xs px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-semibold">Suspended</span>
                                                        )}
                                                        <p className="text-xs font-mono text-[var(--text-muted)]">ID: #{u._id.slice(-6).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                                                    <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                                    <span>{u.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                    disabled={updateRoleMutation.isPending}
                                                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all cursor-pointer bg-[var(--bg-card)] ${
                                                        u.role === 'admin' 
                                                            ? 'border-amber-500/40 text-amber-600 dark:text-amber-400' 
                                                            : u.role === 'seller'
                                                            ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                                                            : 'border-[var(--border-card)] text-[var(--text-main)]'
                                                    }`}
                                                >
                                                    <option value="buyer">Buyer</option>
                                                    <option value="seller">Seller</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-[var(--text-muted)] text-xs hidden md:table-cell">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => statusMutation.mutate({ id: u._id, active: u.isActive === false })}
                                                    disabled={statusMutation.isPending}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 mr-1 rounded-xl text-xs font-semibold text-amber-600 hover:bg-amber-500/10 border border-transparent transition-all cursor-pointer disabled:opacity-40"
                                                    title={u.isActive === false ? 'Reactivate account' : 'Suspend account'}
                                                >
                                                    <Ban className="w-3.5 h-3.5" />
                                                    <span>{u.isActive === false ? 'Reactivate' : 'Suspend'}</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u._id, u.name)}
                                                    disabled={deleteUserMutation.isPending}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer disabled:opacity-40"
                                                    title="Delete user"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;

