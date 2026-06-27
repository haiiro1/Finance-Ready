import type { InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  const baseClasses =
    'flex h-11 w-full rounded-[10px] border border-input bg-transparent px-6 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const classes = [baseClasses, className].filter(Boolean).join(' ');

  return <input className={classes} {...props} />;
}
