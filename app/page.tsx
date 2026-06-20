'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { ChevronRight, Star, Heart } from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  }),
}

const FLOATING_ITEMS = [
  { emoji: '✨', x: '6%',  y: '18%', delay: 0,   size: 'text-3xl' },
  { emoji: '👑', x: '88%', y: '12%', delay: 0.5, size: 'text-4xl' },
  { emoji: '🌙', x: '4%',  y: '62%', delay: 1,   size: 'text-3xl' },
  { emoji: '⭐', x: '93%', y: '55%', delay: 0.3, size: 'text-2xl' },
  { emoji: '🌟', x: '80%', y: '78%', delay: 0.8, size: 'text-3xl' },
  { emoji: '🦄', x: '14%', y: '83%', delay: 0.6, size: 'text-3xl' },
  { emoji: '💫', x: '48%', y: '8%',  delay: 0.2, size: 'text-2xl' },
  { emoji: '🌸', x: '62%', y: '88%', delay: 1.1, size: 'text-2xl' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fdf4ff' }}>

      {/* ── Header ───────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b"
        style={{ borderColor: '#e9d5ff', backgroundColor: 'rgba(253,244,255,0.93)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-3xl">📖</span>
          <span
            className="text-xl font-black"
            style={{
              background: 'linear-gradient(90deg, #7c3aed, #c026d3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Fiabe di Papà
          </span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-full text-sm font-semibold transition-colors hover:bg-purple-50"
            style={{ color: '#7c3aed' }}
          >
            Accedi
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 rounded-full text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}
          >
            Inizia gratis ✨
          </Link>
        </nav>
      </header>

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden px-6 py-28 text-center"
          style={{ background: 'linear-gradient(180deg, #f3e8ff 0%, #fce7f3 50%, #fff7ed 100%)' }}
        >
          {/* Floating decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {FLOATING_ITEMS.map((item, i) => (
              <motion.span
                key={i}
                className={`absolute ${item.size} select-none`}
                style={{ left: item.x, top: item.y }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.65, scale: 1, y: [0, -14, 0] }}
                transition={{
                  opacity:  { delay: item.delay, duration: 0.5 },
                  scale:    { delay: item.delay, duration: 0.5 },
                  y:        { delay: item.delay, duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                {item.emoji}
              </motion.span>
            ))}
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)', color: 'white' }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span>👸</span> La voce di papà, per sempre
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-5xl md:text-7xl font-black leading-[1.1] mb-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <span style={{ color: '#3e2723' }}>Fiabe che</span>
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #f59e0b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                arrivano al cuore
              </span>{' '}
              <span>✨</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed font-semibold"
              style={{ color: '#6d28d9' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              Registra la tua voce una volta sola. Le fiabe della buonanotte
              verranno narrate da{' '}
              <em className="not-italic font-black" style={{ color: '#c026d3' }}>te</em>
              {' '}— ogni sera, per sempre.
            </motion.p>

            {/* Floating characters */}
            <motion.div
              className="flex justify-center gap-6 mb-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {['👸', '📖', '🦄'].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="text-7xl md:text-8xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg shadow-xl hover:shadow-2xl active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)' }}
              >
                ✨ Inizia la magia <ChevronRight size={20} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg border-2 transition-all hover:bg-purple-50 active:scale-95"
                style={{ borderColor: '#7c3aed', color: '#7c3aed' }}
              >
                Ho già un account
              </Link>
            </motion.div>

            <motion.p
              className="mt-6 text-sm font-semibold"
              style={{ color: '#a855f7' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              🎁 Gratis per sempre • Nessuna carta di credito
            </motion.p>
          </div>
        </section>

        {/* ── Stats strip ─────────────────────────────────── */}
        <section
          className="py-6 px-6"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}
        >
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-10 text-white text-center">
            {[
              { num: '19+', label: 'Storie magiche' },
              { num: '8',   label: 'Categorie' },
              { num: '👑',  label: 'Voce clonata' },
              { num: '∞',   label: 'Momenti speciali' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-black">{stat.num}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────── */}
        <section className="px-6 py-20" style={{ background: '#fff9ff' }}>
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl md:text-4xl font-black text-center mb-3"
              style={{ color: '#3e2723' }}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              custom={0}
              viewport={{ once: true }}
            >
              Come funziona la magia ✨
            </motion.h2>
            <motion.p
              className="text-center mb-14 text-lg font-semibold"
              style={{ color: '#7c3aed' }}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              custom={0.5}
              viewport={{ once: true }}
            >
              Tre passi e la storia prende vita con la tua voce
            </motion.p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  emoji: '🎙️',
                  title: 'Registra la tua voce',
                  desc: "Bastano pochi minuti di registrazione. L'AI crea un clone fedele — timbro, calore e accento inclusi.",
                  gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                },
                {
                  emoji: '👸',
                  title: 'Scegli la storia',
                  desc: "Principesse, draghi, avventure e magia. Catalogo di storie per ogni età, o crea la tua storia con l'AI.",
                  gradient: 'linear-gradient(135deg, #c026d3, #be185d)',
                },
                {
                  emoji: '🌙',
                  title: 'Dolci sogni',
                  desc: 'La fiaba viene narrata con la tua voce. Modalità notte con schermo scuro per addormentarsi in pace.',
                  gradient: 'linear-gradient(135deg, #1e3a8a, #1e1b4b)',
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="rounded-3xl overflow-hidden shadow-xl"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  custom={i + 1}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <div className="p-8 text-white text-center" style={{ background: feature.gradient }}>
                    <div className="text-6xl mb-3">{feature.emoji}</div>
                    <h3 className="text-xl font-black">{feature.title}</h3>
                  </div>
                  <div className="p-6 bg-white">
                    <p className="leading-relaxed text-center font-medium" style={{ color: '#6d28d9' }}>
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Story categories ──────────────────────────────── */}
        <section
          className="px-6 py-20"
          style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%)' }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl md:text-4xl font-black text-center mb-3"
              style={{ color: '#3e2723' }}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              custom={0}
              viewport={{ once: true }}
            >
              🏰 Il catalogo delle fiabe
            </motion.h2>
            <motion.p
              className="text-center mb-12 text-lg font-semibold"
              style={{ color: '#7c3aed' }}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              custom={0.5}
              viewport={{ once: true }}
            >
              Principesse, draghi, avventure e sogni
            </motion.p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { emoji: '🧚', label: 'Magia',    gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
                { emoji: '🦁', label: 'Animali',  gradient: 'linear-gradient(135deg, #ea580c, #f97316)' },
                { emoji: '⚔️', label: 'Avventura',gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' },
                { emoji: '🌙', label: 'Sogni',    gradient: 'linear-gradient(135deg, #0f172a, #1e3a5f)' },
                { emoji: '❤️', label: 'Emozioni', gradient: 'linear-gradient(135deg, #be185d, #ec4899)' },
                { emoji: '🔬', label: 'Educare',  gradient: 'linear-gradient(135deg, #0f766e, #10b981)' },
                { emoji: '🦸', label: 'Eroi',     gradient: 'linear-gradient(135deg, #b45309, #f59e0b)' },
                { emoji: '👨‍👩‍👧',label: 'Famiglia', gradient: 'linear-gradient(135deg, #c026d3, #f0abfc)' },
              ].map((cat, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl p-6 text-white text-center shadow-lg cursor-pointer"
                  style={{ background: cat.gradient }}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  custom={i * 0.1 + 1}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.06, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="text-4xl mb-2">{cat.emoji}</div>
                  <div className="font-bold text-sm">{cat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────── */}
        <section className="px-6 py-20" style={{ backgroundColor: '#fff9ff' }}>
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl font-black text-center mb-12"
              style={{ color: '#3e2723' }}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              custom={0}
              viewport={{ once: true }}
            >
              💕 Cosa dicono i genitori
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  text: 'Mia figlia mi chiede di ascoltare la fiaba ogni sera. Sentire la mia voce che racconta mi ha commosso la prima volta.',
                  author: 'Marco R.',
                  role: 'Papà di Sofia, 4 anni',
                  emoji: '👨',
                  color: '#7c3aed',
                },
                {
                  text: 'Ho registrato anche la voce dei nonni. Ora i bambini hanno le storie della nonna anche quando non può venire. È un regalo immenso.',
                  author: 'Giulia M.',
                  role: 'Mamma di Luca e Matteo',
                  emoji: '👩',
                  color: '#c026d3',
                },
                {
                  text: "La qualità della voce è impressionante. Pensavo fosse fredda e distaccata. Invece è calda, vera. È proprio la mia voce.",
                  author: 'Andrea S.',
                  role: 'Papà di Emma, 6 anni',
                  emoji: '👨‍👧',
                  color: '#be185d',
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  className="rounded-3xl p-6 shadow-lg border"
                  style={{ borderColor: '#e9d5ff', backgroundColor: 'white' }}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  custom={i + 1}
                  viewport={{ once: true }}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={16} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <p className="text-base leading-relaxed mb-4 italic" style={{ color: '#4b5563' }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: t.color + '22' }}
                    >
                      {t.emoji}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#3e2723' }}>{t.author}</p>
                      <p className="text-xs font-medium" style={{ color: '#7c3aed' }}>{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────── */}
        <section
          className="relative overflow-hidden px-6 py-24 text-center"
          style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #be185d 100%)' }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {['✨', '⭐', '🌟', '💫', '✨', '⭐'].map((star, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl opacity-30"
                style={{ left: `${8 + i * 16}%`, top: `${20 + (i % 3) * 25}%` }}
                animate={{ opacity: [0.2, 0.5, 0.2], y: [0, -12, 0] }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {star}
              </motion.span>
            ))}
          </div>

          <motion.div
            className="relative max-w-2xl mx-auto"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            custom={0}
            viewport={{ once: true }}
          >
            <div className="text-6xl mb-6">👸</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Inizia stasera stessa
            </h2>
            <p className="text-white opacity-80 text-lg mb-8 leading-relaxed">
              La prossima fiaba della buonanotte può essere narrata
              <br />
              con la <em className="not-italic font-black opacity-100">tua</em> voce.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-full font-black text-xl shadow-2xl active:scale-95 transition-all hover:scale-105"
              style={{ backgroundColor: 'white', color: '#7c3aed' }}
            >
              ✨ Crea il tuo account gratis <ChevronRight size={22} />
            </Link>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-white opacity-60 text-sm font-medium">
              <span>🎁 Gratis per sempre</span>
              <span>•</span>
              <span>🔒 Sicuro e privato</span>
              <span>•</span>
              <span>💕 Per la tua famiglia</span>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer
        className="py-8 px-6 text-center border-t"
        style={{ borderColor: '#e9d5ff', backgroundColor: '#fff9ff' }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl">📖</span>
          <span
            className="font-black text-lg"
            style={{
              background: 'linear-gradient(90deg, #7c3aed, #c026d3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Fiabe di Papà
          </span>
        </div>
        <p className="text-sm font-medium mb-2" style={{ color: '#a855f7' }}>
          Storie per crescere insieme · Con la voce di chi ama
        </p>
        <p className="text-xs mt-1 flex items-center justify-center gap-1" style={{ color: '#c4b5fd' }}>
          Creato con <Heart size={12} fill="#c026d3" color="#c026d3" /> da papà Andrea
          per le sue bambine 👑✨
        </p>
      </footer>
    </div>
  )
}
