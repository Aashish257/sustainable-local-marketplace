import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { registerUser } from './api'

const RegisterPage = () => {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const mutation = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            navigate('/login')
        }
    })

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={(e) => {
                e.preventDefault()
                mutation.mutate({ name, email, password })
            }}>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                <button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Registering...' : 'Register'}
                </button>
            </form>
            {mutation.isPending && <p>Registering...</p>}
            {mutation.isError && (
                <p>{mutation.error?.response?.data?.message || 'Registration failed'}</p>
            )}
        </div>
    )
}

export default RegisterPage
