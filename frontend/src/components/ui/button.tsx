import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export function Button({
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70'

  const variantClasses =
    variant === 'primary'
      ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
      : 'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10'

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      type={type}
      {...props}
    />
  )
}
