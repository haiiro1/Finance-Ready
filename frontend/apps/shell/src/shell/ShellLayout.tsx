import { useEffect, useRef, useState } from 'react';
import type { SVGProps } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = user?.full_name ?? user?.email?.split('@')[0] ?? '';
  const initial = displayName[0]?.toUpperCase() ?? '?';

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function goToConfig() {
    navigate('/configuracion');
    setOpen(false);
  }

  function handleLogout() {
    setOpen(false);
    logout();
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Dropdown — opens downward, right-aligned */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border bg-card shadow-lg">
          <div className="p-1">
            <button
              type="button"
              onClick={goToConfig}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <SettingsIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              Configuracion de cuenta
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOutIcon className="h-4 w-4 shrink-0" />
              Cerrar sesion
            </button>
          </div>
        </div>
      )}

      {/* Trigger — chip visual igual al anterior, ahora clickable */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        title={user?.email}
        className="flex items-center gap-2 rounded-full border bg-card px-2.5 py-1.5 transition-colors hover:bg-muted"
      >
        <span
          className="grid h-6 w-6 flex-none place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
          aria-hidden="true"
        >
          {initial}
        </span>
        <span className="hidden max-w-27.5 truncate text-xs font-medium text-card-foreground sm:block">
          {displayName}
        </span>
        <ChevronDownIcon
          className={`hidden h-3 w-3 shrink-0 text-muted-foreground transition-transform sm:block ${open ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );
}

function SidebarContent({
  onClose,
  onNavClick,
}: {
  onClose?: () => void;
  onNavClick?: () => void;
}) {
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
    </>
  );
}

export function ShellLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

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

            {/* User menu */}
            <UserMenu />
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

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LogOutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
