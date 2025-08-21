import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

export function Button({ variant='default', size='md', className='', ...props }: Props) {
  const base = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none gap-1.5'
  const v = variant === 'secondary'
    ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border'
    : variant === 'ghost'
    ? 'bg-transparent hover:bg-neutral-100 text-neutral-900'
    : 'bg-neutral-900 text-white hover:bg-neutral-800'
  const s = size === 'sm' ? 'h-8 px-3 text-sm' : size === 'lg' ? 'h-11 px-5 text-base' : size === 'icon' ? 'h-9 w-9' : 'h-9 px-4 text-sm'
  return <button className={`${base} ${v} ${s} ${className}`} {...props} />
}
