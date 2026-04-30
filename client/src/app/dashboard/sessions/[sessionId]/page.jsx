"use client";
import { useEffect, useState } from 'react'
import PendingSessionView from '../../../../components/sessions/PendingSessionView'
import AbandonedSessionView from '../../../../components/sessions/AbandonedSessionView'
import CompletedSessionView from '../../../../components/sessions/CompletedSessionView'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

// Session detail entry that routes to status-specific views
export default function SessionDetailPage() {
  const { sessionId } = useParams()
  const router = useRouter()
  const [session, setSession] = useState(null)
const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let isMounted = true
    async function fetchSession() {
      try {
        const { default: axiosInstance } = await import('@/lib/axiosInstance');
        const res = await axiosInstance.get(`/sessions/${sessionId}`)
        if (isMounted) {
          setSession(res.data)
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) { setError(err.response?.data?.message || err.message); setLoading(false) }
      }
    }
    fetchSession()
    return () => { isMounted = false }
  }, [sessionId])

  if (!mounted) return null

  if (loading) return <div>Loading session...</div>
  if (error) return <div>Error loading session: {error}</div>
  if (!session) return <div>No session data</div>

  // Render by status
  switch ((session.status || 'pending').toLowerCase()) {
    case 'pending':
      return <PendingSessionView session={session} />
    case 'abandoned':
      return <AbandonedSessionView session={session} />
    case 'completed':
      return <CompletedSessionView session={session} />
    default:
      return <div>Unknown session status</div>
  }
}
