import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { loginUser } from './api'
import useAuthStore from '../../store/authStore'



const LoginPage = () => {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            login(data.data.user, data.data.token)  // save to store
            navigate('/')                   // redirect
        }
    })

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={(e) => {
                e.preventDefault()
                mutation.mutate({ email, password })
            }}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                <button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Logging in..." : "Login"}
                </button>
            </form>
            {mutation.isPending && <p>Logging in...</p>}
            {mutation.isError && (
                <p>{mutation.error?.response?.data?.message || 'Login failed'}</p>
            )}

        </div>
    )
}
export default LoginPage
