export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Decorative floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['🌙', '⭐', '✨', '🌟', '💫', '⭐', '✨'].map((icon, i) => (
          <span
            key={i}
            className="absolute text-2xl opacity-10 float-animation"
            style={{
              left: `${5 + i * 14}%`,
              top: `${10 + (i % 4) * 22}%`,
              animationDelay: `${i * 0.7}s`,
              fontSize: i % 2 === 0 ? '2rem' : '1.2rem',
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
          <h1 className="text-2xl font-bold mt-2" style={{ color: 'var(--primary)' }}>
            Fiabe di Papà
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}
