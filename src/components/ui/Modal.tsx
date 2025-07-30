import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import useReducedMotionPreference from '@/hooks/useReducedMotionPreference';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement>;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, className, children, initialFocusRef }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotionPreference();

  // Escape handler
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Focus trap on open
  useEffect(() => {
    if (open) {
      (initialFocusRef?.current || overlayRef.current)?.focus();
    }
  }, [open, initialFocusRef]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? false : { opacity: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
          // Si shouldReduceMotion es true, animación instantánea por accesibilidad
          onClick={onClose}
          tabIndex={-1}
        >
          <motion.div
            className={clsx('bg-gray-800 rounded-2xl border border-gray-700/50 shadow-xl p-6 w-full max-w-lg', className)}
            initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' } }}
            exit={shouldReduceMotion ? false : { scale: 0.9, opacity: 0, transition: { duration: 0.15 } }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal; 