import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { homeFor } from '../../app/roles';

const GuestRoute = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const role = useAuthStore((state) => state.user?.role);

    if (isAuthenticated) {
        return <Navigate to={homeFor(role)} replace />;
    }

    return <Outlet />;
};

export default GuestRoute;
