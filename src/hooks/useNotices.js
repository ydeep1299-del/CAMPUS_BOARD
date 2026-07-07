import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export function useNotices() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotices = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setNotices(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  const addNotice = async (title, content, userId) => {
    const { error } = await supabase
      .from('notices')
      .insert({ title, content, user_id: userId })
    return { error }
  }

  const deleteNotice = async (id) => {
    const { error } = await supabase.from('notices').delete().eq('id', id)
    return { error }
  }

  const updateNotice = async (id, fields) => {
    const { error } = await supabase.from('notices').update(fields).eq('id', id)
    return { error }
  }

  return { notices, setNotices, loading, addNotice, deleteNotice, updateNotice, refetch: fetchNotices }
}
