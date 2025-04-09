import * as React from "react"
import { createPortal } from "react-dom"
import { Button } from "./button"
import { Close } from "../icons/Close"
import { cn } from "../utils/cn"


interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const [mounted, setMounted] = React.useState(false)
  const modalRef = React.useRef<HTMLDivElement>(null)
  const previousFocusRef = React.useRef<HTMLElement | null>(null)

  // Handle mounting (client-side only)
  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Store previous focus element and trap focus within modal
  React.useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement

      // Focus the modal when it opens
      if (modalRef.current) {
        modalRef.current.focus()
      }

      // Prevent scrolling on body when modal is open
      document.body.style.overflow = "hidden"
    } else {
      // Restore scrolling when modal is closed
      document.body.style.overflow = ""

      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen])

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  if (!mounted || !isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={cn(
          "relative h-[90vh] w-full overflow-auto rounded-lg bg-white text-black p-6 shadow-lg focus:outline-none",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
      >
        <Button className="absolute rounded-full right-4 top-4 h-8 w-8 p-0 bg-white hover:bg-gray-50 transition-colors" onClick={onClose} aria-label="Close modal">
          <Close className="h-4 w-4" />
        </Button>

        {title && (
          <h2 id="modal-title" className="mb-2 text-xl font-semibold">
            {title}
          </h2>
        )}

        <div>{children}</div>
      </div>
    </div>,
    document.body,
  )
}

