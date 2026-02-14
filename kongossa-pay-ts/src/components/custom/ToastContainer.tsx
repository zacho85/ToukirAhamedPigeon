// src/components/ToastContainer.tsx
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/redux/store"
import { removeToast } from "@/redux/slices/toastSlice"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"
import type { Toast } from "@/redux/slices/toastSlice"

const typeStyles: Record<
  NonNullable<Toast["type"]>,
  { bg: string; icon: React.ReactElement | null }
> = {
  success: {
    bg: `
      bg-green-50 text-green-700 border-green-500
      dark:bg-green-900/30 dark:text-green-200 dark:border-green-400
    `,
    icon: <CheckCircle2 className="text-green-500 dark:text-green-400" />,
  },
  danger: {
    bg: `
      bg-red-50 text-red-700 border-red-500
      dark:bg-red-900/30 dark:text-red-200 dark:border-red-400
    `,
    icon: <XCircle className="text-red-500 dark:text-red-400" />,
  },
  warning: {
    bg: `
      bg-yellow-50 text-yellow-700 border-yellow-500
      dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-400
    `,
    icon: <AlertTriangle className="text-yellow-500 dark:text-yellow-400" />,
  },
  info: {
    bg: `
      bg-blue-50 text-blue-700 border-blue-500
      dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-400
    `,
    icon: <Info className="text-blue-500 dark:text-blue-400" />,
  },
  custom: {
    bg: `
      bg-gray-100 text-gray-700 border-gray-500
      dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600
    `,
    icon: null,
  },
}

const positionClasses: Partial<Record<NonNullable<Toast["position"]>, string>> = {
  "top-left": "top-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-4 right-4",
}

const animationVariants = {
  "slide-right-in": {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 50, opacity: 0 },
  },
  "slide-left-in": {
    initial: { x: -50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  },
  "slide-up-in": {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 50, opacity: 0 },
  },
  "slide-down-in": {
    initial: { y: -50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 },
  },
  "fade-in": {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
}

export default function ToastContainer() {
  const toasts = useSelector((state: RootState) => state.toast.toasts)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const timers = toasts
      .filter((t) => typeof t.duration === "number" && t.duration > 0)
      .map((t) => setTimeout(() => dispatch(removeToast(t.id!)), t.duration))

    return () => timers.forEach(clearTimeout)
  }, [toasts, dispatch])

  return (
    <>
      {Object.keys(positionClasses).map((pos) => (
        <div
          key={pos}
          className={`fixed z-[999] ${positionClasses[pos as keyof typeof positionClasses]} space-y-2`}
        >
          <AnimatePresence>
            {toasts
              .filter((t) => t.position === pos)
              .map((toast) => {
                const style =
                  (toast.type && typeStyles[toast.type]) || typeStyles.info

                const anim =
                  (toast.animation &&
                    animationVariants[toast.animation]) ||
                  animationVariants["slide-right-in"]

                return (
                  <motion.div
                    key={toast.id}
                    initial={anim.initial}
                    animate={anim.animate}
                    exit={anim.exit}
                    transition={{ duration: 0.3 }}
                    className={`
                      flex items-center gap-3
                      border-l-4 rounded-xl shadow-lg p-4 w-80
                      bg-white dark:bg-gray-900
                      ${style.bg}
                    `}
                  >
                    {style.icon && <div>{style.icon}</div>}

                    <div className="flex-1 text-sm font-medium">
                      {toast.message}
                    </div>

                    {toast.showClose && (
                      <button
                        onClick={() =>
                          toast.id && dispatch(removeToast(toast.id))
                        }
                        className="
                          text-gray-500 hover:text-gray-700
                          dark:text-gray-400 dark:hover:text-gray-200
                          cursor-pointer
                        "
                      >
                        ✕
                      </button>
                    )}
                  </motion.div>
                )
              })}
          </AnimatePresence>
        </div>
      ))}
    </>
  )
}
