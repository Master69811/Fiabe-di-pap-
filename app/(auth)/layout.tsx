export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #f3e8ff 0%, #fce7f3 50%, #fff7ed 100%)' }}
    >
      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['🌙', '⭐', '✨', '🌟', '💫', '👑', '✨'].map((icon, i) => (
          <span
            key={i}
            className="absolute opacity-30 float-animation select-none"
            style={{
              left: `${5 + i * 14}%`,
              top: `${10 + (i % 4) * 22}%`,
              fontSize: i % 2 === 0 ? '2rem' : '1.2rem',
              animationDelay: `${i * 0.7}s`,
            }}
          >
            {icon}
          </span>
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl">📖</span>
          <h1
            className="text-2xl font-black mt-2"
            style={{
              background: 'linear-gradient(90deg, #7c3aed, #c026d3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Fiabe di Papà
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}
