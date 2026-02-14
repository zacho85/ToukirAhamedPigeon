import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  register,
  name,
  placeholder = "••••••••",
  className = "",
  ...props
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        className={`w-full border rounded-md px-4 py-2 pr-10 bg-[#fbfdff] placeholder-[#aab4c3] focus:ring-2 focus:ring-[#e6eef9] focus:border-transparent shadow-sm ${className}`}
        {...register(name)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
