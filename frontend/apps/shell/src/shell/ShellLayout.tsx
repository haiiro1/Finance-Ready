import { useEffect, useState } from 'react';
import type { SVGProps } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '@finance-ready/ui-kit';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { useAuth } from '../auth/useAuth';
import { LogoChip } from '../auth/AuthLayout';

type NavItem = { label: string; path: string };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: 'General',
    items: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Finanzas', path: '/finanzas' },
    ],
  },
  {
    label: 'Cuentas',
    items: [{ label: 'Bancos y tarjetas', path: '/bancos-tarjetas' }],
  },
  {
    label: 'Compromisos',
    items: [
      { label: 'Prestamos y deudas', path: '/prestamos-deudas' },
      { label: 'Suscripciones', path: '/suscripciones' },
    ],
  },
  {
    label: 'Analisis',
    items: [
      { label: 'Reportes', path: '/reportes' },
      { label: 'Configuracion', path: '/configuracion' },
    ],
  },
];

function SidebarContent({
  onClose,
  onNavClick,
}: {
  onClose?: () => void;
  onNavClick?: () => void;
}) {
  const { user, logout } = useAuth();
  const userInitial = user?.email?.[0]?.toUpperCase() ?? '?';
  const userAlias = user?.full_name ?? user?.email?.split('@')[0] ?? '';

  return (
    <>
      {/* Brand */}
      <div className="flex h-16 flex-none items-center justify-between gap-3 border-b px-4">
        <div className="flex items-center gap-3">
          <LogoChip />
          <div className="leading-tight">
            <strong className="block text-sm font-bold text-card-foreground">Finance Ready</strong>
            <span className="block text-xs text-muted-foreground">Finanzas personales</span>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Cerrar menu"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegacion principal">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="mb-1 px-3 text-[11px] font-extrabold uppercase tracking-[.08em] text-muted-foreground/60">
              {group.label}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavClick}
                className={({ isActive }) =>
                  [
                    'flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold no-underline transition-colors',
                    isActive
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex-none border-t p-4">
        <div className="mb-2 flex items-center gap-2.5 px-1">
          <span
            className="grid h-7 w-7 flex-none place-items-center rounded-full bg-muted text-xs font-bold text-foreground"
            aria-hidden="true"
          >
            {userInitial}
          </span>
          <div className="min-w-0">
            {userAlias && (
              <p className="truncate text-xs font-semibold text-foreground/80">{userAlias}</p>
            )}
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={logout}
          className="h-9 w-full justify-start text-sm text-muted-foreground hover:text-foreground"
        >
          Cerrar sesion
        </Button>
      </div>
    </>
  );
}

export function ShellLayout() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userInitial = user?.email?.[0]?.toUpperCase() ?? '?';
  const userAlias = user?.full_name ?? user?.email?.split('@')[0] ?? '';

  const closeMobile = () => setMobileOpen(false);

  // Escape key + scroll lock
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ── Desktop sidebar — sticky flex item ── */}
      <aside className="sticky top-0 hidden h-screen w-67 flex-none flex-col overflow-y-auto border-r bg-card lg:flex">
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay + drawer ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            aria-hidden="true"
            onClick={closeMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-67 flex-col border-r bg-card lg:hidden">
            <SidebarContent onClose={closeMobile} onNavClick={closeMobile} />
          </aside>
        </>
      )}

      {/* ── Main ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 flex-none items-center gap-3 border-b bg-card/90 px-4 backdrop-blur-sm lg:px-6">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 flex-none place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Abrir menu de navegacion"
            aria-expanded={mobileOpen}
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          {/* Search */}
          <label className="relative max-w-135 flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              <SearchIcon className="h-4 w-4" />
            </span>
            <input
              type="search"
              disabled
              title="Busqueda no disponible aun"
              aria-label="Buscar movimientos, bancos, deudas (no disponible aun)"
              placeholder="Buscar movimientos, bancos, deudas..."
              className="h-9 w-full rounded-lg border bg-transparent pl-9 pr-3 text-sm text-muted-foreground placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none"
            />
          </label>

          <div className="ml-auto flex items-center gap-2">
            {/* Notifications */}
            <button
              type="button"
              disabled
              title="Notificaciones no disponibles aun"
              aria-label="Notificaciones (no disponible aun)"
              className="grid h-9 w-9 place-items-center rounded-md border text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BellIcon className="h-4 w-4" />
            </button>

            {/* Theme switcher */}
            <ThemeSwitcher compact />

            {/* Profile chip */}
            <div
              className="flex items-center gap-2 rounded-full border bg-card px-2.5 py-1.5"
              title={user?.email}
            >
              <span
                className="grid h-6 w-6 flex-none place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                aria-hidden="true"
              >
                {userInitial}
              </span>
              <span className="hidden max-w-27.5 truncate text-xs font-medium text-card-foreground sm:block">
                {userAlias}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="min-w-0 flex-1 p-5 lg:p-8">
          <div className="mx-auto max-w-310">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Icons ──

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
