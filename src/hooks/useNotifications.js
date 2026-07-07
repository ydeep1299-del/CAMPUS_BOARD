import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error) setNotifications(data)
  }, [userId])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // realtime: only new notifications addressed to this user
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('notifications-feed-' + userId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length === 0) return

    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return { notifications, unreadCount, markAllRead }
}
