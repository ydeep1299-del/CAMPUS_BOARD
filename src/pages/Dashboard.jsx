import { useAuth } from '../context/AuthContext'
import { useNotices } from '../hooks/useNotices'
import { useRealtimeNotices } from '../hooks/useRealtimeNotices'
import Navbar from '../components/Navbar'
import NoticeForm from '../components/NoticeForm'
import NoticeCard from '../components/NoticeCard'

export default function Dashboard() {
  const { user } = useAuth()
  const { notices, setNotices, loading, addNotice, deleteNotice } = useNotices()

  // keeps `notices` state live-synced with DB changes from any user
  useRealtimeNotices(setNotices)

  const handleDelete = async (id) => {
    await deleteNotice(id)
    // no need to manually update state here - the realtime DELETE
    // subscription in useRealtimeNotices will remove it from state
  }

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h2>Notice Board</h2>

        <NoticeForm onAdd={addNotice} userId={user.id} />

        {loading ? (
          <p>Loading notices...</p>
        ) : notices.length === 0 ? (
          <p>No notices yet. Be the first to post!</p>
        ) : (
          <div className="notice-list">
            {notices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                currentUserId={user.id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
