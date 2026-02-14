import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function PageTransition({ children }) {
  const location = useLocation();
  console.log('animated');
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.key}   // 👈 FIX — React Router's unique key is stable
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
