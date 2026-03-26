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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-all ${
                isActive
                  ? 'text-[var(--color-primary)] scale-110'
                  : 'text-[var(--color-text-light)] hover:text-[var(--color-text)]'
              }`
            }
          >
            <span className="text-xl">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
