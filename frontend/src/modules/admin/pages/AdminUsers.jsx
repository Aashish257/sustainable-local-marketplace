import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { ADMIN } from '../../../services/endpoints';
import { SkeletonGrid } from '../../../shared/components/SkeletonLoader';

const AdminUsers = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => apiClient.get(ADMIN.USERS).then(r => r.data)
    });

    if (isLoading) return <SkeletonGrid count={4} />;
    if (isError) return <div className="text-red-500">Failed to load users.</div>;

    const users = data?.data || [];

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-8">All Users</h1>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                            <tr key={u._id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-slate-800">{u.name}</td>
                                <td className="px-6 py-4 text-slate-600">{u.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                        u.role === 'seller' ? 'bg-green-100 text-green-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
