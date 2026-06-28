import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-ring disabled:opacity-50',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:outline-ring disabled:opacity-50',
  ghost:
    'hover:bg-accent hover:text-accent-foreground focus-visible:outline-ring disabled:opacity-50',
};

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none';

  const classes = [baseClasses, variantClasses[variant], className].filter(Boolean).join(' ');

  return <button className={classes} {...props} />;
}
