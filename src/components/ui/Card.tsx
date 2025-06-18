import type { ReactNode } from 'react'

interface CardProps {
  title: string
  image?: string
  onClick?: () => void
  children?: ReactNode
  className?: string
}

export default function Card({ title, image, onClick, children, className }: CardProps) {
  return (
    <div
      className={`bg-gray-800 rounded shadow hover:shadow-lg overflow-hidden cursor-pointer ${className ?? ''}`}
      onClick={onClick}
    >
      {image && <img src={image} alt={title} className="w-full h-40 object-cover" />}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {children}
      </div>
    </div>
  )
}
