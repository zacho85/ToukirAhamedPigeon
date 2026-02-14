import { motion } from "framer-motion";

export const AuthFormCard = ({ children, icon, title, title2, subTitle, iconClassName, cardWidth="max-w-md" }) => {
  return (
    <div className="min-h-screen bg-[#f3f7f9] flex items-center justify-center p-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`w-full ${cardWidth} bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-8`}
        style={{ boxShadow: "0 14px 30px rgba(3,16,28,0.08)" }}
      >
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full overflow-hidden -mt-12 mb-4 shadow-md flex items-center justify-center ${iconClassName}`}>
            {icon}
          </div>
          <h1 className="text-2xl font-extrabold text-[#0b1226] text-center leading-tight">
            {title}
            {title2 && 
            <>
            <br />
            <span className="inline-block text-lg font-bold">{title2}</span>
            </>
            }
          </h1>
          <p className="text-sm text-[#6b7280] mt-2 text-center">{subTitle}</p>
        </div>
        {children}
      </motion.div>
    </div>
  )
}
