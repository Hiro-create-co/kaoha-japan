import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function BottomNav() {
  const { t } = useTranslation()
  const location = useLocation()

  const navItems = [
    { to: '/', icon: '🗺️', activeIcon: '🗺️', label: t('nav.map'), color: '#4ECDC4' },
    { to: '/points', icon: '⭐', activeIcon: '🌟', label: t('nav.points'), color: '#FFD93D' },
    { to: '/contest', icon: '📷', activeIcon: '📸', label: t('nav.contest'), color: '#FF6B6B' },
  ]

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname === to
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid #ffe8e0', boxShadow: '0 -4px 20px rgba(255,107,107,0.08)' }}>
      <div className="flex justify-around items-center h-[68px] max-w-lg mx-auto px-4"
           style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {navItems.map(({ to, icon, activeIcon, label, color }) => {
          const active = isActive(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-300 ${
                active ? 'scale-110' : 'opacity-50 hover:opacity-75 active:scale-95'
              }`}
              style={active ? { background: `${color}15` } : {}}
            >
              <span className={`text-xl leading-none ${active ? 'animate-bounce-soft' : ''}`}>
                {active ? activeIcon : icon}
              </span>
              <span className="text-[10px] font-bold" style={active ? { color } : { color: '#9a8585' }}>
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
