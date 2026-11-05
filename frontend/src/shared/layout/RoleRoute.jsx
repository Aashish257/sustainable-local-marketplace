import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { homeFor } from '../../app/roles';

/**
 * Route guard by role.
 *  - allow:  roles that may open these pages (omit = any logged-in user)
 *  - guests: true = logged-out visitors may open them too (public shop pages)
 * Wrong role -> that role's home page. Not logged in -> /login, then back here.
 */
const RoleRoute = ({ allow, guests = false }) => {
    const token = useAuthStore((s) => s.token);
    const role = useAuthStore((s) => s.user?.role);
    const location = useLocation();

    if (!token) {
        return guests
            ? <Outlet />
            : <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
    }
    if (allow && !allow.includes(role)) return <Navigate to={homeFor(role)} replace />;
    return <Outlet />;
};

export default RoleRoute;
