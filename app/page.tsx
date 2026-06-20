'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { Mic, BookOpen, Moon, Star, Heart, ChevronRight } from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  }),
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(253,248,240,0.92)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-3xl">📖</span>
          <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
            Fiabe di Papà
          </span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-[#f5ede0]"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Accedi
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 rounded-full text-sm font-medium text-white shadow transition-all hover:shadow-md active:scale-95"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Inizia gratis
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-24 text-center stars-bg">
          <div className="absolute inset-0 pointer-events-none">
            {['⭐', '🌙', '✨', '⭐', '🌟', '✨'].map((star, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl opacity-20 float-animation"
                style={{
                  left: `${10 + i * 16}%`,
                  top: `${15 + (i % 3) * 20}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ delay: i * 0.3 }}
              >
                {star}
              </motion.span>
            ))}
          </div>

          <div className="relative max-w-4xl mx-auto">
            <motion.div
              className="inline-block mb-6 px-4 py-2 rounded-full text-sm font-medium"
              style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              🎙️ La tua voce. Le sue storie.
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-bold leading-tight mb-6"
              style={{ color: 'var(--foreground)' }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Ogni fiaba{' '}
              <span style={{ color: 'var(--primary)' }}>narrata</span>
              <br />
              con la tua voce
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ color: 'var(--muted-foreground)' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              Crea un clone della tua voce e lascia che racconti storie magiche
              ai tuoi bambini — anche quando non puoi essere lì.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Comincia la magia <ChevronRight size={20} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg border-2 transition-all hover:bg-[#f5ede0] active:scale-95"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Ho già un account
              </Link>
            </motion.div>

            <motion.p
              className="mt-6 text-sm"
              style={{ color: 'var(--muted-foreground)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Gratis per sempre • Nessuna carta di credito
            </motion.p>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-20" style={{ backgroundColor: 'var(--card)' }}>
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center mb-16"
              style={{ color: 'var(--foreground)' }}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              custom={0}
              viewport={{ once: true }}
            >
              Come funziona la magia
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Mic size={32} />,
                  emoji: '🎙️',
                  title: 'Registra la tua voce',
                  desc: 'Bastano 10 minuti di registrazione. La nostra AI crea un clone fedele della tua voce — timbro, calore, accento inclusi.',
                  color: '#e8834a',
                },
                {
                  icon: <BookOpen size={32} />,
                  emoji: '📚',
                  title: 'Scegli una storia',
                  desc: 'Catalogo di storie curate per ogni età, categoria e umore. O lascia che l\'AI crei una storia con il nome del tuo bambino.',
                  color: '#7ec8a4',
                },
                {
                  icon: <Moon size={32} />,
                  emoji: '🌙',
                  title: 'Modalità notte',
                  desc: 'La storia si racconta con la tua voce mentre lo schermo si scurisce lentamente. L\'audio si abbassa da solo verso la fine.',
                  color: '#f4c65a',
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl p-8 border text-center"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  custom={i}
                  viewport={{ once: true }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
                    style={{ backgroundColor: feature.color + '20', color: feature.color }}
                  >
                    {feature.emoji}
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works — Steps */}
        <section className="px-6 py-20 stars-bg">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center mb-16"
              style={{ color: 'var(--foreground)' }}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              custom={0}
              viewport={{ once: true }}
            >
              Tre passi verso la storia perfetta
            </motion.h2>
            <div className="space-y-8">
              {[
                {
                  step: '01',
                  title: 'Registra la tua voce (una volta sola)',
                  desc: 'Leggi ad alta voce per 10–15 minuti seguendo la nostra guida. L\'AI di ElevenLabs crea un modello vocale fedele a te.',
                  emoji: '🎤',
                },
                {
                  step: '02',
                  title: 'Scegli o crea la storia',
                  desc: 'Sfoglia il catalogo di fiabe o chiedi all\'AI di creare una storia personalizzata con il nome e gli interessi del tuo bambino.',
                  emoji: '✨',
                },
                {
                  step: '03',
                  title: 'Ascoltate insieme',
                  desc: 'La storia viene narrata con la tua voce. Attiva la modalità notte e lascia che i sogni arrivino.',
                  emoji: '😴',
                },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  className="flex gap-6 items-start"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  custom={i + 1}
                  viewport={{ once: true }}
                >
                  <div
                    className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg"
                    style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                  >
                    {step.step}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                      {step.emoji} {step.title}
                    </h3>
                    <p className="leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 py-20" style={{ backgroundColor: 'var(--card)' }}>
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl font-bold text-center mb-12"
              style={{ color: 'var(--foreground)' }}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              custom={0}
              viewport={{ once: true }}
            >
              Cosa dicono i genitori
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  text: 'Mia figlia mi chiede di ascoltare la fiaba ogni sera. Sentire la mia voce che racconta mentre sono fuori per lavoro mi ha commosso la prima volta.',
                  author: 'Marco R.',
                  role: 'Papà di Sofia, 4 anni',
                  emoji: '👨',
                },
                {
                  text: 'Ho registrato anche la voce dei nonni. Ora i bambini hanno le storie della nonna anche quando non può venire. È un regalo immenso.',
                  author: 'Giulia M.',
                  role: 'Mamma di Luca e Matteo',
                  emoji: '👩',
                },
                {
                  text: 'La qualità della voce è impressionante. Pensavo fosse una cosa tecnologica e distaccata. Invece è calda, è vera. È proprio la mia voce.',
                  author: 'Andrea S.',
                  role: 'Papà di Emma, 6 anni',
                  emoji: '👨‍👧',
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl p-6 border"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  custom={i + 1}
                  viewport={{ once: true }}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={16} fill="#f4c65a" color="#f4c65a" />
                    ))}
                  </div>
                  <p
                    className="text-base leading-relaxed mb-4 italic"
                    style={{ color: 'var(--foreground)' }}
                  >
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                        {t.author}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {t.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA finale */}
        <section
          className="px-6 py-24 text-center"
          style={{ background: `linear-gradient(135deg, #e8834a 0%, #c96b32 100%)` }}
        >
          <motion.div
            className="max-w-2xl mx-auto"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            custom={0}
            viewport={{ once: true }}
          >
            <Heart size={48} className="mx-auto mb-6 text-white opacity-80" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Inizia stasera stessa
            </h2>
            <p className="text-white opacity-80 text-lg mb-8">
              La prossima fiaba della buonanotte può essere narrata con la tua voce.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-lg shadow-lg active:scale-95 transition-all"
              style={{ backgroundColor: 'white', color: 'var(--primary)' }}
            >
              Crea il tuo account gratis <ChevronRight size={20} />
            </Link>
          </motion.div>
        </section>
      </main>

      <footer
        className="py-8 px-6 text-center border-t"
        style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">📖</span>
          <span className="font-semibold" style={{ color: 'var(--primary)' }}>
            Fiabe di Papà
          </span>
        </div>
        <p className="text-sm">
          Fatto con ❤️ per ogni famiglia · Storie per crescere insieme
        </p>
      </footer>
    </div>
  )
}
