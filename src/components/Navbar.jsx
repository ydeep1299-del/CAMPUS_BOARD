import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        CampusBoard
      </Link>

      {user && (
        <div className="navbar-right">
          <NotificationBell userId={user.id} />
          <Link to="/profile">Profile</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  )
}
