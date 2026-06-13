'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'

const api = axios.create({ baseURL: 'https://mindflow-backend-8kws.onrender.com/api/v1' })

interface Entry { id: string; content: string; mood_score: number; ai_insights: string; ai_questions: string[]; created_at: string }

export default function Home() {
  const [token, setToken] = useState<string|null>(null)
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState(5)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [insight, setInsight] = useState<Entry|null>(null)
  const [error, setError] = useState('')

  useEffect(() => { const t = localStorage.getItem('token'); if(t){setToken(t);load(t)} }, [])

  const load = async (t: string) => {
    try { const r = await api.get('/journal/', {headers:{Authorization:`Bearer ${t}`}}); setEntries(r.data) } catch{}
  }

  const login = async () => {
    setError('')
    try {
      const r = await api.post('/auth/login', {email, password})
      localStorage.setItem('token', r.data.access_token)
      setToken(r.data.access_token)
      load(r.data.access_token)
    } catch { setError('Email ou mot de passe incorrect') }
  }

  const register = async () => {
    setError('')
    if (!firstName || !email || !password) { setError('Remplis tous les champs'); return }
    try {
      const r = await api.post('/auth/register', {email, password, first_name: firstName, last_name: lastName || ''})
      localStorage.setItem('token', r.data.access_token)
      setToken(r.data.access_token)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Erreur inscription')
    }
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

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setEntries([])
    setInsight(null)
  }

  const upgrade = async () => {
    try {
      const r = await api.post('/payments/create-checkout', {}, {headers:{Authorization:`Bearer ${token}`}})
      window.location.href = r.data.checkout_url
    } catch { alert('Erreur lors de la redirection vers le paiement') }
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
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          <button onClick={()=>{setMode('login');setError('')}}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode==='login'?'bg-white text-violet-600 shadow':'text-gray-500'}`}>
            Connexion
          </button>
          <button onClick={()=>{setMode('register');setError('')}}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode==='register'?'bg-white text-violet-600 shadow':'text-gray-500'}`}>
            Inscription
          </button>
        </div>
        <div className="space-y-3">
          {mode === 'register' && (
            <div className="flex gap-2">
              <input placeholder="Prénom *" value={firstName} onChange={e=>setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-violet-400 text-sm"/>
              <input placeholder="Nom" value={lastName} onChange={e=>setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-violet-400 text-sm"/>
            </div>
          )}
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-violet-400"/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&(mode==='login'?login():register())}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-violet-400"/>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button onClick={mode==='login'?login:register}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors">
            {mode==='login' ? 'Se connecter' : 'Créer mon compte gratuit'}
          </button>
        </div>
        {mode==='login' ? (
          <p className="text-center text-sm text-gray-400 mt-4">
            Pas de compte ?{' '}
            <button onClick={()=>setMode('register')} className="text-violet-600 font-medium">S'inscrire gratuitement</button>
          </p>
        ) : (
          <p className="text-center text-sm text-gray-400 mt-4">
            Déjà un compte ?{' '}
            <button onClick={()=>setMode('login')} className="text-violet-600 font-medium">Se connecter</button>
          </p>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">M</span>
          </div>
          <span className="font-semibold">MindFlow AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={upgrade}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors">
            ⭐ Premium 4.99$/mois
          </button>
          <button onClick={logout} className="text-gray-400 hover:text-gray-600 text-sm">Déconnexion</button>
        </div>
      </header>
      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Comment tu te sens ?</h2>
          <div className="space-y-1">
            <div className="flex justify-between"><span className="text-sm text-gray-500">Humeur</span><span className="text-2xl">{emoji(mood)}</span></div>
            <input type="range" min="1" max="10" value={mood} onChange={e=>setMood(Number(e.target.value))} className="w-full accent-violet-600"/>
            <div className="flex justify-between text-xs text-gray-400"><span>Difficile</span><span>{mood}/10</span><span>Excellent</span></div>
          </div>
          <textarea value={content} onChange={e=>setContent(e.target.value)}
            placeholder="Écris librement... MindFlow t'écoute."
            className="w-full min-h-36 p-4 rounded-2xl border border-gray-200 outline-none resize-none text-gray-700"/>
          <button onClick={submit} disabled={content.length<10||loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl font-medium transition-colors">
            {loading ? '✨ MindFlow analyse...' : 'Analyser avec MindFlow'}
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
                <div className="flex justify-between mb-2">
                  <span className="text-xl">{emoji(e.mood_score)}</span>
                  <span className="text-xs text-gray-400">{new Date(e.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
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