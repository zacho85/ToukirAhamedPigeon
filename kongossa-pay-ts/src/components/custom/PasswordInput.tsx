import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegister, FieldValues, Path } from "react-hook-form";

export default function PasswordInput<T extends FieldValues>({
  register,
  name,
  placeholder = "••••••••",
  className = "",
  ...props
}: {
  register: UseFormRegister<T>;
  name: Path<T>;
  placeholder?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        className={`w-full border rounded-md px-4 py-2 pr-10
        bg-[#fbfdff] text-gray-900
        placeholder-[#aab4c3]
        focus:ring-2 focus:ring-[#e6eef9]
        focus:border-transparent shadow-sm

        dark:bg-gray-900 dark:text-gray-100
        dark:border-gray-700
        dark:placeholder-gray-500
        dark:focus:ring-gray-700

        ${className}`}
        {...register(name)}
        {...props}
      />

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700
        dark:text-gray-400 dark:hover:text-gray-200"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
