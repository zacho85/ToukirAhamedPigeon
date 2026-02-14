import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showToast } from "@/store/toastSlice"; 

export default function SetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch(); 

  const handleSetPassword = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.patch(
        "http://localhost:3000/auth/set-password",
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Password set successfully!");
      dispatch(
        showToast({
          type: "success",
          message: "Password set successfully!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          type: "error",
          message: err.response?.data?.message || "Failed to set password",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 shadow-lg rounded-md bg-white">
      <h2 className="text-2xl font-bold mb-4">Set Your Password</h2>
      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 rounded-md mb-4"
      />
      <button
        onClick={handleSetPassword}
        disabled={loading}
        className={`w-full py-3 rounded-md text-white ${
          loading ? "bg-gray-400" : "bg-blue-600"
        }`}
      >
        {loading ? "Setting..." : "Set Password"}
      </button>
    </div>
  );
}
