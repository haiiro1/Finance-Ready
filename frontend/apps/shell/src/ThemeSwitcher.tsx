import { useTheme } from './useTheme';

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="relative inline-grid h-9 w-18 grid-cols-2 items-center rounded-full border bg-muted p-1 text-muted-foreground transition-colors duration-300 ease-out hover:bg-accent"
    >
      {/* Sliding indicator */}
      <span
        aria-hidden="true"
        className={[
          'absolute left-1 top-1 h-7 w-7 rounded-full bg-card shadow ring-1 ring-border/50 transition-transform duration-300 ease-out',
          isDark ? 'translate-x-9' : 'translate-x-0',
        ].join(' ')}
      />

      {/* Sun icon */}
      <span
        aria-hidden="true"
        className={[
          'z-10 grid place-items-center transition-colors duration-300',
          !isDark ? 'text-card-foreground' : 'text-muted-foreground',
        ].join(' ')}
      >
        <SunIcon className="h-4 w-4" />
      </span>

      {/* Moon icon */}
      <span
        aria-hidden="true"
        className={[
          'z-10 grid place-items-center transition-colors duration-300',
          isDark ? 'text-card-foreground' : 'text-muted-foreground',
        ].join(' ')}
      >
        <MoonIcon className="h-4 w-4" />
      </span>
    </button>
  );
}

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  );
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
    </svg>
  );
}
