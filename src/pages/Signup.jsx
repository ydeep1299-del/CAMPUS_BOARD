import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    const { data, error } = await signUp(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // create matching profile row (only works once user.id exists).
    // Note: if "Confirm email" is ON in Supabase Auth settings, there's no
    // active session yet at this point, so this insert may be blocked by
    // RLS. That's fine - Profile.jsx creates the row on first visit instead.
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
      })
      if (profileError) {
        console.warn('Profile row not created at signup (will be created on first Profile visit):', profileError.message)
      }
    }

    setLoading(false)

    // if email confirmation is ON in your Supabase auth settings,
    // there will be no session yet - tell the user to check inbox
    if (!data.session) {
      setInfo('Account created. Please check your email to confirm, then log in.')
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>

        {error && <p className="error-text">{error}</p>}
        {info && <p className="info-text">{info}</p>}

        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}