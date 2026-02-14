// components/common/GlobalLoader.jsx
import React from "react";
import { useSelector } from "react-redux";

export default function GlobalLoader() {
  const { visible, message, spinnerColor, messageColor } = useSelector(
    (state) => state.loader
  );

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 border-4 border-t-transparent border-solid rounded-full animate-spin"
          style={{ borderColor: `${spinnerColor} transparent ${spinnerColor} ${spinnerColor}` }}
        ></div>
        {message && (
          <p className="text-lg font-medium" style={{ color: messageColor }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
