import type { ReactNode } from 'react'

interface CardProps {
  title: string
  image?: string
  onClick?: () => void
  children?: ReactNode
  className?: string
}

export default function Card({ title, image, onClick, children, className }: CardProps) {
  const base = `glass rounded border border-[var(--primary)] shadow-md hover:shadow-[0_0_8px_var(--primary-glow)] overflow-hidden w-full text-left ${
    onClick ? 'cursor-pointer transform transition-transform hover:scale-105' : ''
  } ${className ?? ''}`

  const content = (
    <>
      {image && <img src={image} alt={title} className="w-full h-40 object-cover" />}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {children}
      </div>
    </>
  )

  return onClick ? (
    <button type="button" className={base} onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className={base}>{content}</div>
  )
}
