'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'

const api = axios.create({ baseURL: 'https://mindflow-backend-8kws.onrender.com/api/v1' })

interface Entry { id: string; content: string; mood_score: number; ai_insights: string; ai_questions: string[]; created_at: string }

const TRANSLATIONS = {
  fr: {
    tagline: 'Ton companion bien-être intelligent',
    login: 'Connexion', register: 'Inscription',
    firstName: 'Prénom *', lastName: 'Nom',
    email: 'Email', password: 'Mot de passe',
    loginBtn: 'Se connecter', registerBtn: 'Créer mon compte gratuit',
    noAccount: 'Pas de compte ?', signupFree: 'S\'inscrire gratuitement',
    hasAccount: 'Déjà un compte ?', connect: 'Se connecter',
    wrongCreds: 'Email ou mot de passe incorrect',
    fillFields: 'Remplis tous les champs',
    howAreYou: 'Comment tu te sens ?',
    mood: 'Humeur', hard: 'Difficile', excellent: 'Excellent',
    placeholder: 'Écris librement... MindFlow t\'écoute.',
    analyze: 'Analyser avec MindFlow', analyzing: '✨ MindFlow analyse...',
    observes: '✨ MindFlow observe', questions: 'Questions pour toi :',
    recentEntries: 'Entrées récentes', logout: 'Déconnexion',
    premium: 'Premium', perMonth: '/mois',
  },
  en: {
    tagline: 'Your intelligent wellness companion',
    login: 'Login', register: 'Sign up',
    firstName: 'First name *', lastName: 'Last name',
    email: 'Email', password: 'Password',
    loginBtn: 'Sign in', registerBtn: 'Create free account',
    noAccount: 'No account?', signupFree: 'Sign up for free',
    hasAccount: 'Already have an account?', connect: 'Sign in',
    wrongCreds: 'Wrong email or password',
    fillFields: 'Please fill all fields',
    howAreYou: 'How are you feeling today?',
    mood: 'Mood', hard: 'Hard', excellent: 'Excellent',
    placeholder: 'Write freely... MindFlow is listening.',
    analyze: 'Analyze with MindFlow', analyzing: '✨ Analyzing...',
    observes: '✨ MindFlow observes', questions: 'Questions for you:',
    recentEntries: 'Recent entries', logout: 'Logout',
    premium: 'Premium', perMonth: '/month',
  }
}

const FR_COUNTRIES = ['FR','BE','CH','LU','MC','SN','CI','CM','MG','ML','BF','NE','TD','GN','RW','BI','BJ','TG','DJ','KM','MR','SC','GA','CG','CD','CF','GQ','MU']

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
  const [priceDisplay, setPriceDisplay] = useState('...')
  const [lang, setLang] = useState<'fr'|'en'>('en')

  const t = TRANSLATIONS[lang]

  useEffect(() => {
    const t = localStorage.getItem('token')
    if(t){setToken(t);load(t)}
    api.get('/payments/pricing').then(r => {
      setPriceDisplay(r.data.price)
      const country = r.data.country || 'AU'
      setLang(FR_COUNTRIES.includes(country) ? 'fr' : 'en')
    }).catch(() => setPriceDisplay('2.99'))
  }, [])

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
    } catch { setError(t.wrongCreds) }
  }

  const register = async () => {
    setError('')
    if (!firstName || !email || !password) { setError(t.fillFields); return }
    try {
      const r = await api.post('/auth/register', {email, password, first_name: firstName, last_name: lastName || ''})
      localStorage.setItem('token', r.data.access_token)
      setToken(r.data.access_token)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Error')
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
    } catch { alert('Error redirecting to payment') }
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
          <p className="text-gray-500 mt-1">{t.tagline}</p>
        </div>
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          <button onClick={()=>{setMode('login');setError('')}}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode==='login'?'bg-white text-violet-600 shadow':'text-gray-500'}`}>
            {t.login}
          </button>
          <button onClick={()=>{setMode('register');setError('')}}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode==='register'?'bg-white text-violet-600 shadow':'text-gray-500'}`}>
            {t.register}
          </button>
        </div>
        <div className="space-y-3">
          {mode === 'register' && (
            <div className="flex gap-2">
              <input placeholder={t.firstName} value={firstName} onChange={e=>setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-violet-400 text-sm"/>
              <input placeholder={t.lastName} value={lastName} onChange={e=>setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-violet-400 text-sm"/>
            </div>
          )}
          <input type="email" placeholder={t.email} value={email} onChange={e=>setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-violet-400"/>
          <input type="password" placeholder={t.password} value={password} onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&(mode==='login'?login():register())}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-violet-400"/>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button onClick={mode==='login'?login:register}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors">
            {mode==='login' ? t.loginBtn : t.registerBtn}
          </button>
        </div>
        {mode==='login' ? (
          <p className="text-center text-sm text-gray-400 mt-4">
            {t.noAccount}{' '}
            <button onClick={()=>setMode('register')} className="text-violet-600 font-medium">{t.signupFree}</button>
          </p>
        ) : (
          <p className="text-center text-sm text-gray-400 mt-4">
            {t.hasAccount}{' '}
            <button onClick={()=>setMode('login')} className="text-violet-600 font-medium">{t.connect}</button>
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
            ⭐ {t.premium} {priceDisplay}{t.perMonth}
          </button>
          <button onClick={logout} className="text-gray-400 hover:text-gray-600 text-sm">{t.logout}</button>
        </div>
      </header>
      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">{t.howAreYou}</h2>
          <div className="space-y-1">
            <div className="flex justify-between"><span className="text-sm text-gray-500">{t.mood}</span><span className="text-2xl">{emoji(mood)}</span></div>
            <input type="range" min="1" max="10" value={mood} onChange={e=>setMood(Number(e.target.value))} className="w-full accent-violet-600"/>
            <div className="flex justify-between text-xs text-gray-400"><span>{t.hard}</span><span>{mood}/10</span><span>{t.excellent}</span></div>
          </div>
          <textarea value={content} onChange={e=>setContent(e.target.value)}
            placeholder={t.placeholder}
            className="w-full min-h-36 p-4 rounded-2xl border border-gray-200 outline-none resize-none text-gray-700"/>
          <button onClick={submit} disabled={content.length<10||loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl font-medium transition-colors">
            {loading ? t.analyzing : t.analyze}
          </button>
        </div>
        {insight && (
          <div className="bg-violet-600 rounded-3xl p-6 text-white space-y-3">
            <p className="font-medium">{t.observes}</p>
            <p className="text-violet-50 leading-relaxed">{insight.ai_insights}</p>
            <div className="space-y-2">
              <p className="text-violet-200 text-sm">{t.questions}</p>
              {insight.ai_questions?.map((q,i)=><div key={i} className="bg-white/10 rounded-xl p-3 text-sm">{q}</div>)}
            </div>
          </div>
        )}
        {entries.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">{t.recentEntries}</h3>
            {entries.map(e=>(
              <div key={e.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-xl">{emoji(e.mood_score)}</span>
                  <span className="text-xs text-gray-400">{new Date(e.created_at).toLocaleDateString()}</span>
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