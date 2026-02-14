// src/components/ToastContainer.jsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeToast } from "../../store/toastSlice";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

const typeStyles = {
  success: {
    bg: "bg-green-50 border-green-500 text-green-700",
    icon: <CheckCircle2 className="text-green-500" />,
  },
  danger: {
    bg: "bg-red-50 border-red-500 text-red-700",
    icon: <XCircle className="text-red-500" />,
  },
  warning: {
    bg: "bg-yellow-50 border-yellow-500 text-yellow-700",
    icon: <AlertTriangle className="text-yellow-500" />,
  },
  info: {
    bg: "bg-blue-50 border-blue-500 text-blue-700",
    icon: <Info className="text-blue-500" />,
  },
  custom: {
    bg: "bg-gray-100 border-gray-500 text-gray-700",
    icon: null,
  },
};

const positionClasses = {
  "top-left": "top-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-4 right-4",
};

const animationVariants = {
  "slide-right-in": { initial: { x: 50, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 50, opacity: 0 } },
  "slide-left-in": { initial: { x: -50, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -50, opacity: 0 } },
  "slide-up-in": { initial: { y: 50, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 50, opacity: 0 } },
  "slide-down-in": { initial: { y: -50, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -50, opacity: 0 } },
};

export default function ToastContainer() {
  const toasts = useSelector((state) => state.toast.toasts);
  const dispatch = useDispatch();

  useEffect(() => {
    const timers = toasts
      .filter((t) => t.duration > 0)
      .map((t) => setTimeout(() => dispatch(removeToast(t.id)), t.duration));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  return (
    <>
      {Object.keys(positionClasses).map((pos) => (
        <div key={pos} className={`fixed z-[9999] ${positionClasses[pos]} space-y-2`}>
          <AnimatePresence>
            {toasts
              .filter((t) => t.position === pos)
              .map((toast) => {
                const style = typeStyles[toast.type] || typeStyles.info;
                const anim = animationVariants[toast.animation] || animationVariants["slide-right-in"];

                return (
                  <motion.div
                    key={toast.id}
                    initial={anim.initial}
                    animate={anim.animate}
                    exit={anim.exit}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-3 border-l-4 rounded-xl shadow-lg p-4 w-80 ${style.bg}`}
                  >
                    {style.icon && <div>{style.icon}</div>}
                    <div className="flex-1 text-sm font-medium">{toast.message}</div>
                    {toast.showClose && (
                      <button
                        onClick={() => dispatch(removeToast(toast.id))}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    )}
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      ))}
    </>
  );
}
