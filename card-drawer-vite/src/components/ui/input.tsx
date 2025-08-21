import React from 'react'
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className='', ...props}, ref) {
  return <input ref={ref} className={`h-10 px-3 py-2 rounded-xl border bg-white ${className}`} {...props} />
})
