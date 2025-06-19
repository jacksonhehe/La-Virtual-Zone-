import { Dialog } from '@headlessui/react'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="relative glass text-white rounded-lg p-4 max-w-lg w-full">
        <Dialog.Title className="text-xl font-semibold mb-2">{title}</Dialog.Title>
        <div className="mb-4 space-y-2">{children}</div>
        <button className="mt-2 px-4 py-1 bg-blue-600 rounded" onClick={onClose}>Cerrar</button>
      </div>
    </Dialog>
  )
}
