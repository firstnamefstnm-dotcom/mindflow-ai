'use client'
import { useState } from 'react'

export default function Landing() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-semibold text-gray-900">MindFlow AI</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/app" className="text-gray-500 hover:text-gray-900 text-sm">Connexion</a>
          <a href="/app" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors">
            Commencer gratuitement
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
          ✨ Propulsé par Llama 3 — IA de dernière génération
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Ton thérapeute IA,<br/>
          <span className="text-violet-600">disponible 24h/24</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          MindFlow analyse ton journal, comprend tes émotions et t'aide à aller mieux — chaque jour, à ton rythme, sans jugement.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/app" className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-semibold text-lg transition-colors">
            Essayer gratuitement →
          </a>
          <a href="#comment" className="px-8 py-4 border border-gray-200 hover:border-gray-300 text-gray-700 rounded-2xl font-semibold text-lg transition-colors">
            Comment ça marche
          </a>
        </div>
        <p className="text-sm text-gray-400 mt-4">Sans carte bancaire • Gratuit pour commencer</p>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-violet-50 py-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm mb-6">Rejoins des milliers de personnes qui prennent soin de leur santé mentale</p>
          <div className="flex justify-center gap-8 flex-wrap">
            {['😌 Moins de stress', '😴 Meilleur sommeil', '💪 Plus de clarté', '❤️ Mieux se connaître'].map(item => (
              <span key={item} className="text-gray-700 font-medium">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section id="comment" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Comment ça marche</h2>
        <p className="text-center text-gray-500 mb-12">3 étapes pour transformer ta vie intérieure</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Ecris librement', desc: 'Ouvre ton journal. Pas de regles, pas de jugement. MindFlow ecoute.', emoji: '✍️' },
            { step: '02', title: 'IA analyse', desc: 'Notre IA comprend tes emotions et genere des insights personnalises.', emoji: '🧠' },
            { step: '03', title: 'Tu progresses', desc: 'Des exercices pratiques et un suivi de ton bien-etre chaque semaine.', emoji: '📈' }
          ].map(item => (
            <div key={item.step} className="text-center p-6">
              <div className="text-4xl mb-4">{item.emoji}</div>
              <div className="text-violet-600 font-bold text-sm mb-2">{item.step}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Tarifs simples et honnêtes</h2>
          <p className="text-center text-gray-500 mb-12">Commence gratuitement, upgrade quand tu veux</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* FREE */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gratuit</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">0€</div>
              <ul className="space-y-3 mb-8">
                {['Journal IA 3x/semaine', 'Check-in émotionnel quotidien', 'Insights basiques', 'Accès mobile'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-600">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href="/app" className="block text-center py-3 border border-violet-600 text-violet-600 rounded-xl font-medium hover:bg-violet-50 transition-colors">
                Commencer gratuitement
              </a>
            </div>

            {/* PREMIUM */}
            <div className="bg-violet-600 rounded-3xl p-8 text-white relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                POPULAIRE
              </div>
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <div className="text-4xl font-bold mb-1">4.99 AUD</div>
              <p className="text-violet-200 text-sm mb-6">par mois</p>
              <ul className="space-y-3 mb-8">
                {['Journal illimité', 'IA companion 24/7', 'Analyses émotionnelles avancées', 'Rapports hebdomadaires', 'Exercices CBT guidés', 'Support prioritaire'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-violet-100">
                    <span className="text-white">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href="/app" className="block text-center py-3 bg-white text-violet-600 rounded-xl font-bold hover:bg-violet-50 transition-colors">
                Essayer Premium →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Questions fréquentes</h2>
        <div className="space-y-6">
          {[
            { q: 'Est-ce que MindFlow remplace un thérapeute ?', a: 'Non. MindFlow est un outil de bien-être complémentaire. Il ne remplace pas un professionnel de santé mentale, mais t\'aide à mieux te comprendre au quotidien.' },
            { q: 'Mes données sont-elles privées ?', a: 'Oui. Tes entrées de journal sont privées et chiffrées. Nous ne partageons jamais tes données personnelles.' },
            { q: 'Puis-je annuler à tout moment ?', a: 'Oui, sans engagement. Tu peux annuler ton abonnement quand tu veux depuis les paramètres.' },
            { q: 'L\'IA est-elle vraiment intelligente ?', a: 'MindFlow utilise Llama 3, un des modèles IA les plus avancés du marché, pour comprendre et répondre à tes émotions de façon personnalisée.' }
          ].map(item => (
            <div key={item.q} className="border border-gray-100 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-violet-600 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à mieux te comprendre ?</h2>
          <p className="text-violet-200 mb-8 text-lg">Rejoins MindFlow aujourd'hui. Gratuit pour commencer.</p>
          <a href="/app" className="inline-block px-8 py-4 bg-white text-violet-600 rounded-2xl font-bold text-lg hover:bg-violet-50 transition-colors">
            Commencer gratuitement →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center flex-wrap gap-4">
          <span className="text-gray-400 text-sm">© 2026 MindFlow AI</span>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600">Confidentialité</a>
            <a href="#" className="hover:text-gray-600">CGU</a>
            <a href="#" className="hover:text-gray-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}