import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Map, Star, Camera } from 'lucide-react'

export default function BottomNav() {
  const { t } = useTranslation()
  const location = useLocation()

  const navItems = [
    { to: '/', icon: Map, label: t('nav.map') },
    { to: '/points', icon: Star, label: t('nav.points') },
    { to: '/contest', icon: Camera, label: t('nav.contest') },
  ]

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname === to
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-[var(--color-border)]">
      <div className="flex justify-around items-center h-[64px] max-w-lg mx-auto px-6"
           style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = isActive(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
