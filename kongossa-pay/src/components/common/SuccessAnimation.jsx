import { motion } from "framer-motion";
import {CheckCircle2 } from "lucide-react";

export const SuccessAnimation = ({ successMessage, nextInstruction }) => {
  return (
    <div className="min-h-screen bg-[#f3f7f9] flex items-center justify-center p-6 relative">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-8"
              >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center text-center py-16"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
              >
                <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
                <motion.span
                  className="absolute inset-0 rounded-full bg-green-400/30 blur-lg"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: 0 }}
                />
              </motion.div>
              <h2 className="text-2xl font-bold text-[#0b1226]">{successMessage}</h2>
              {nextInstruction && (
                <p className="text-[#6b7280] mt-2 text-sm">
                  {nextInstruction}
                </p>
              )}
            </motion.div>
            </motion.div>
          </div>
  )
}

