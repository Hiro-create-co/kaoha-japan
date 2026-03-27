import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function BottomNav() {
  const { t } = useTranslation()
  const location = useLocation()

  const navItems = [
    { to: '/', icon: '🗾', label: t('nav.map') },
    { to: '/points', icon: '⭐', label: t('nav.points') },
    { to: '/contest', icon: '📸', label: t('nav.contest') },
  ]

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname === to
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <div className="flex justify-around items-center h-[64px] max-w-lg mx-auto px-4"
           style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {navItems.map(({ to, icon, label }) => {
          const active = isActive(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5 w-20 py-2 rounded-2xl transition-all duration-200 ${
                active
                  ? 'text-[var(--color-primary)] bg-red-50 scale-105'
                  : 'text-gray-400 hover:text-gray-600 active:scale-95'
              }`}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-[10px] font-bold">{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
