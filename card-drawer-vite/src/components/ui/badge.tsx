import React from 'react'

export function Badge({ children, variant='default', className='' }: { children: React.ReactNode, variant?: 'default' | 'secondary' | 'outline', className?: string }) {
  const v = variant === 'secondary'
    ? 'bg-neutral-100 text-neutral-900 border'
    : variant === 'outline'
    ? 'bg-transparent border'
    : 'bg-neutral-900 text-white'
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${v} ${className}`}>{children}</span>
}
