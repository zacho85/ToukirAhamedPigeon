import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface AuthFormCardProps {
  children: ReactNode;
  icon?: ReactNode;
  title: string;
  title2?: string;
  subTitle?: ReactNode | string;
  iconClassName?: string;
  cardWidth?: string;
}

export const AuthFormCard: React.FC<AuthFormCardProps> = ({
  children,
  icon,
  title,
  title2,
  subTitle,
  iconClassName = "",
  cardWidth = "max-w-md",
}) => {
  return (
    <div className="min-h-screen bg-[#f3f7f9] dark:bg-gray-950 flex items-center justify-center p-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`w-full ${cardWidth} bg-white dark:bg-gray-900 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.6)] p-8`}
        style={{ boxShadow: "0 14px 30px rgba(3,16,28,0.08)" }}
      >
        <div className="flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-full overflow-hidden -mt-12 mb-4 shadow-md dark:shadow-black/40 flex items-center justify-center ${iconClassName}`}
          >
            {icon}
          </div>

          <h1 className="text-2xl font-extrabold text-[#0b1226] dark:text-gray-100 text-center leading-tight">
            {title}
            {title2 && (
              <>
                <br />
                <span className="inline-block text-lg font-bold dark:text-gray-200">
                  {title2}
                </span>
              </>
            )}
          </h1>

          {subTitle && (
            <p className="text-sm text-[#6b7280] dark:text-gray-400 mt-2 text-center">
              {subTitle}
            </p>
          )}
        </div>

        {children}
      </motion.div>
    </div>
  );
};
