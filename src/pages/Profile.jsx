import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import Navbar from '../components/Navbar'
import AvatarUpload from '../components/AvatarUpload'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      // maybeSingle() returns null instead of throwing when 0 rows match
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        setLoading(false)
        return
      }

      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
        setBio(data.bio || '')
        setLoading(false)
        return
      }

      // no profile row yet (e.g. it wasn't created at signup) - create one now
      const { data: created, error: createError } = await supabase
        .from('profiles')
        .insert({ id: user.id, full_name: '' })
        .select()
        .single()

      if (!createError && created) {
        setProfile(created)
        setFullName(created.full_name || '')
        setBio(created.bio || '')
      }

      setLoading(false)
    }

    fetchProfile()
  }, [user.id])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, bio, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    setSaving(false)
    setMessage(error ? error.message : 'Profile updated.')
  }

  if (loading) return <p className="center-text">Loading profile...</p>

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h2>My Profile</h2>

        <AvatarUpload
          userId={user.id}
          currentUrl={profile?.avatar_url}
          onUploaded={(url) => setProfile((prev) => ({ ...prev, avatar_url: url }))}
        />

        <form className="profile-form" onSubmit={handleSave}>
          <label>Email</label>
          <input type="text" value={user.email} disabled />

          <label>Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <label>Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {message && <p className="info-text">{message}</p>}
        </form>
      </div>
    </div>
  )
}