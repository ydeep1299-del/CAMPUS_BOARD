import { useState } from 'react'

export default function NoticeForm({ onAdd, userId }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)

    const { error } = await onAdd(title, content, userId)

    if (!error) {
      setTitle('')
      setContent('')
    }
    // no need to manually insert a notification here anymore -
    // the trg_notify_all_users_on_new_notice trigger handles it in the DB

    setSubmitting(false)
  }

  return (
    <form className="notice-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Notice title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Details (optional)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Posting...' : 'Post Notice'}
      </button>
    </form>
  )
}