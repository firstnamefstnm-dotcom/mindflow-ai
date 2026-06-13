'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000/api/v1' })

interface Entry { id: string; content: string; mood_score: number; ai_insights: string; ai_questions: string[]; created_at: string }

export default function Home() {
  const [token, setToken] = useState<string|null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState(5)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [insight, setInsight] = useState<Entry|null>(null)

  useEffect(() => { const t = localStorage.getItem('token'); if(t){setToken(t);load(t)} }, [])

  const load = async (t: string) => {
    try { const r = await api.get('/journal/', {headers:{Authorization:`Bearer ${t}`}}); setEntries(r.data) } catch{}
  }

  const login = async () => {
    try {
      const r = await api.post('/auth/login', {email, password})
      localStorage.setItem('token', r.data.access_token)
      setToken(r.data.access_token)
      load(r.data.access_token)
    } catch { alert('Identifiants incorrects') }
  }

  const submit = async () => {
    if(!token || content.length < 10) return
    setLoading(true)
    try {
      const r = await api.post('/journal/', {content, mood_score: mood}, {headers:{Authorization:`Bearer ${token}`}})
      setInsight(r.data)
      setContent('')
      load(token)
    } catch{}
    setLoading(false)
  }

  const emoji = (s: number) => s<=2?'😢':s<=4?'😔':s<=6?'😐':s<=8?'🙂':'😊'

  if(!token) return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MindFlow AI</h1>
          <p className="text-gray-500 mt-1">Ton companion bien-être intelligent</p>
        </div>
        <div className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-violet-400"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-violet-400"/>
          <button onClick={login} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium">Se connecter</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center"><span className="text-white font-bold">M</span></div>
          <span className="font-semibold">MindFlow AI</span>
        </div>
        <button onClick={()=>{localStorage.removeItem('token');setToken(null);setEntries([])}} className="text-gray-400 text-sm">Déconnexion</button>
      </header>
      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Comment tu te sens ?</h2>
          <div className="space-y-1">
            <div className="flex justify-between"><span className="text-sm text-gray-500">Humeur</span><span className="text-2xl">{emoji(mood)}</span></div>
            <input type="range" min="1" max="10" value={mood} onChange={e=>setMood(Number(e.target.value))} className="w-full accent-violet-600"/>
            <div className="flex justify-between text-xs text-gray-400"><span>Difficile</span><span>{mood}/10</span><span>Excellent</span></div>
          </div>
          <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Écris librement... MindFlow t'écoute." className="w-full min-h-36 p-4 rounded-2xl border border-gray-200 outline-none resize-none text-gray-700"/>
          <button onClick={submit} disabled={content.length<10||loading} className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl font-medium">
            {loading ? '✨ Analyse en cours...' : 'Analyser avec MindFlow'}
          </button>
        </div>
        {insight && (
          <div className="bg-violet-600 rounded-3xl p-6 text-white space-y-3">
            <p className="font-medium">✨ MindFlow observe</p>
            <p className="text-violet-50 leading-relaxed">{insight.ai_insights}</p>
            <div className="space-y-2">
              <p className="text-violet-200 text-sm">Questions pour toi :</p>
              {insight.ai_questions?.map((q,i)=><div key={i} className="bg-white/10 rounded-xl p-3 text-sm">{q}</div>)}
            </div>
          </div>
        )}
        {entries.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Entrées récentes</h3>
            {entries.map(e=>(
              <div key={e.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between mb-2"><span className="text-xl">{emoji(e.mood_score)}</span><span className="text-xs text-gray-400">{new Date(e.created_at).toLocaleDateString('fr-FR')}</span></div>
                <p className="text-gray-700 text-sm line-clamp-2">{e.content}</p>
                {e.ai_insights && <p className="text-violet-600 text-xs mt-1 italic">{e.ai_insights.slice(0,100)}...</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
