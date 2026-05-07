"use client";

/*
Role: Session detail dashboard route.
What it does: Loads one session, renders status-specific views (pending/in-progress/processing/completed), and routes users into live interview flow.
Where used: Accessed from interview/session lists as the operational control page for each session.
Why it exists: Gives users a single predictable decision point before starting or reviewing a session.
*/
import { useEffect, useState } from 'react'
import Link from 'next/link'
import PendingSessionView from '../../../../components/sessions/PendingSessionView'
import AbandonedSessionView from '../../../../components/sessions/AbandonedSessionView'
import CompletedSessionView from '../../../../components/sessions/CompletedSessionView'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { CaretRight, Play, CircleNotch } from '@phosphor-icons/react'

// Session detail entry that routes to status-specific views
export default function SessionDetailPage() {
  const { sessionId } = useParams()
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [starting, setStarting] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [selectedPersona, setSelectedPersona] = useState('neutral')

  useEffect(() => {
    setMounted(true)
    let isMounted = true
    async function fetchSession() {
      try {
        const { default: axiosInstance } = await import('@/lib/axiosInstance');
        const res = await axiosInstance.get(`/sessions/${sessionId}`)
        if (isMounted) {
          setSession(res.data)
          setSelectedDifficulty(res.data?.difficulty || 'medium')
          setSelectedPersona(res.data?.interviewerPersona || 'neutral')
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) { setError(err.response?.data?.message || err.message); setLoading(false) }
      }
    }
    fetchSession()
    return () => { isMounted = false }
  }, [sessionId])

  useEffect(() => {
    if (!session || (session.status || '').toLowerCase() !== 'processing') return
    let active = true
    const timer = setInterval(async () => {
      try {
        const { default: axiosInstance } = await import('@/lib/axiosInstance')
        const res = await axiosInstance.get(`/sessions/${sessionId}`)
        if (active) setSession(res.data)
      } catch (_) {}
    }, 3000)

    return () => {
      active = false
      clearInterval(timer)
    }
  }, [session, sessionId])

  useEffect(() => {
    if (!session || (session.status || '').toLowerCase() !== 'pending') return
    if (session.difficulty) return
    try {
      const raw = localStorage.getItem('intervue-user-settings')
      if (!raw) return
      const p = JSON.parse(raw)
      if (p.defaultDifficulty === 'easy' || p.defaultDifficulty === 'medium' || p.defaultDifficulty === 'hard') {
        setSelectedDifficulty(p.defaultDifficulty)
      }
    } catch {
      /* ignore */
    }
  }, [session])

  if (!mounted) return null

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white/60">
          <CircleNotch className="w-7 h-7 animate-spin text-[#A3E635]" />
          <p className="text-sm">Loading session details...</p>
        </div>
      </div>
    )
  }
  if (error) return <div className="text-red-400 p-8">Error loading session: {error}</div>
  if (!session) return <div>No session data</div>

  const isPending = (session.status || 'pending').toLowerCase() === 'pending'
  const handleStartSession = async () => {
    setStarting(true)
    try {
      const { default: axiosInstance } = await import('@/lib/axiosInstance');
      await axiosInstance.post(`/sessions/${session.id}/generate-questions`, {
        difficulty: selectedDifficulty,
        interviewerPersona: selectedPersona,
      });
      router.push(`/interview/${session.id}/live`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setStarting(false)
    }
  }

  // Render by status
  let content = null;
  switch ((session.status || 'pending').toLowerCase()) {
    case 'pending':
      content = (
        <PendingSessionView
          session={session}
          selectedDifficulty={selectedDifficulty}
          selectedPersona={selectedPersona}
          onDifficultyChange={setSelectedDifficulty}
          onPersonaChange={setSelectedPersona}
          onStartSession={handleStartSession}
          isStarting={starting}
        />
      )
      break
    case 'in-progress':
      content = (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-2">Session in progress</h2>
          <p className="text-white/50 mb-6">
            You already started this interview. Continue from where you left off.
          </p>
          <button
            onClick={() => router.push(`/interview/${session.id}/live`)}
            className="inline-flex items-center gap-2 bg-[#A3E635] text-black font-semibold px-5 py-3 rounded-xl hover:bg-[#94d82d] transition-colors"
          >
            Continue Session
          </button>
        </div>
      )
      break
    case 'abandoned':
      content = <AbandonedSessionView session={session} />
      break
    case 'completed':
      content = <CompletedSessionView session={session} />
      break
    case 'processing':
      content = (
        <div className="bg-[#111111] border border-[#A3E635]/20 rounded-2xl p-10 text-center">
          <p className="text-white font-semibold mb-2">Evaluating your answers...</p>
          <p className="text-white/50 text-sm">This page refreshes automatically once analysis is ready.</p>
        </div>
      )
      break
    default:
      content = <div>Unknown session status</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-white/40 text-sm font-medium mb-3">
            <Link href="/dashboard/interviews" className="hover:text-white transition-colors">
              Interviews
            </Link>
            <CaretRight size={14} weight="bold" />
            {session.interviewId ? (
              <Link href={`/dashboard/interviews/${session.interviewId}`} className="hover:text-white transition-colors">
                {session.role || 'Interview'}
              </Link>
            ) : (
              <span>{session.role || 'Interview'}</span>
            )}
            <CaretRight size={14} weight="bold" />
            <span className="text-white/70">{session.title}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{session.title}</h1>
          <p className="text-white/50 text-sm mt-2">
            Session {session.order || 1} of {session.sessionCount || 1}
          </p>
        </div>

        {isPending && (
          <div className="flex items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(event) => setSelectedDifficulty(event.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button
              onClick={handleStartSession}
              disabled={starting}
              className="inline-flex items-center gap-2 bg-[#A3E635] text-black font-semibold px-5 py-3 rounded-xl hover:bg-[#94d82d] transition-colors disabled:opacity-60"
            >
              {starting ? <CircleNotch className="w-4 h-4 animate-spin" /> : <Play weight="fill" size={16} />}
              Start Session
            </button>
          </div>
        )}
      </div>

      {content}
    </div>
  )
}
