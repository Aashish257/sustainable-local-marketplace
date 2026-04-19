import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const Navbar = () => {
    const token = useAuthStore((state) => state.token)
    const logout = useAuthStore((state) => state.logout)
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }


    return (
        <nav>
            <span>🌱 Sustainable Marketplace</span>
            <div>
                {token ? (
                    <button onClick={handleLogout}>Logout</button>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>

    )
}

export default Navbar
