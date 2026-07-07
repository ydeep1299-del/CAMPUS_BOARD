import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AvatarUpload({ userId, currentUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')

    const filePath = `${userId}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('id', userId)

    setUploading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    onUploaded(data.publicUrl)
  }

  return (
    <div className="avatar-upload">
      {currentUrl ? (
        <img src={currentUrl} alt="avatar" className="avatar-preview" />
      ) : (
        <div className="avatar-placeholder">No photo</div>
      )}

      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />

      {uploading && <p>Uploading...</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
