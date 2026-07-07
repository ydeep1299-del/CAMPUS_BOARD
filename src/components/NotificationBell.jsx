import { useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import { formatDate } from '../utils/formatDate'

export default function NotificationBell({ userId }) {
  const { notifications, unreadCount, markAllRead } = useNotifications(userId)
  const [open, setOpen] = useState(false)

  const toggleOpen = () => {
    setOpen((prev) => !prev)
    if (!open && unreadCount > 0) markAllRead()
  }

  return (
    <div className="bell-wrapper">
      <button className="bell-button" onClick={toggleOpen}>
        🔔 {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="bell-dropdown">
          {notifications.length === 0 && <p>No notifications yet.</p>}
          {notifications.map((n) => (
            <div key={n.id} className="bell-item">
              <p>{n.message}</p>
              <small>{formatDate(n.created_at)}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
