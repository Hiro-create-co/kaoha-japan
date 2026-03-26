import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function BottomNav() {
  const { t } = useTranslation()

  const navItems = [
    { to: '/', icon: '🗾', label: t('nav.map') },
    { to: '/points', icon: '⭐', label: t('nav.points') },
    { to: '/contest', icon: '📸', label: t('nav.contest') },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <div className="flex justify-around items-center h-[68px] max-w-md mx-auto px-2"
           style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 w-20 py-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-[var(--color-primary)] bg-red-50 scale-105'
                  : 'text-gray-400 hover:text-gray-600 active:scale-95'
              }`
            }
          >
            <span className="text-2xl leading-none">{icon}</span>
            <span className="text-[11px] font-bold">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
