import React from 'react'

type Props = {
  id?: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}

export function Switch({ id, checked, onCheckedChange }: Props) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`h-6 w-11 rounded-full p-0.5 transition-colors ${checked ? 'bg-neutral-900' : 'bg-neutral-300'}`}
    >
      <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}
