import React, { useState } from "react";
import {
  contributeToTontine,
  // add other API methods if needed
} from "../../api/tontines";
import { showToast } from "@/store/toastSlice";
import { useDispatch } from "react-redux";

export default function TontineContributionForm({
  tontineMember,
  contribution,
  onSuccess,
  onCancel,
}) {
  const dispatch = useDispatch();
  const isEditing = !!contribution;
  const today = new Date().toISOString().split("T")[0];

  const [amount, setAmount] = useState(
    contribution?.amount || tontineMember.tontine.contributionAmount
  );
  const [date, setDate] = useState(contribution?.contribution_date || today);
  const [status, setStatus] = useState(contribution?.status || "pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = { amount, contribution_date: date, status };

    try {
      if (isEditing) {
        // UPDATE contribution
        await contributeToTontine(contribution.id, payload, tontineMember.user.id);
      } else {
        // CREATE contribution for member
        await contributeToTontine(tontineMember.tontine.id, payload, tontineMember.user.id);
      }

      onSuccess?.();
      dispatch(
        showToast({
          type: "success",
          message: isEditing ? "Contribution updated successfully" : "Contribution recorded successfully",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err) {
      console.error("Contribution error:", err);
      setError("Failed to submit the contribution.");
      dispatch(
        showToast({
          type: "error",
          message: err.response?.data?.message || err.message || "Something went wrong",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 450,
        margin: "20px auto",
        background: "#f9f9f9",
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <h2 style={{ marginBottom: 10, fontSize: "20px", fontWeight: 600 }}>
        {isEditing ? "Edit Contribution" : "Record Contribution"}
      </h2>

      <div
        style={{
          background: "#fff",
          padding: "12px 16px",
          borderRadius: "10px",
          border: "1px solid #eee",
          marginBottom: 18,
          fontSize: "14px",
        }}
      >
        <p>
          <strong>Member:</strong> {tontineMember.user.fullName}
        </p>
        <p>
          <strong>Tontine:</strong> {tontineMember.tontine.name}
        </p>
        <p>
          <strong>Expected Amount:</strong> $
          {tontineMember.tontine.contributionAmount}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontWeight: 500 }}>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "#fff",
            }}
          />
        </div>

        {/* Date */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontWeight: 500 }}>Contribution Date</label>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "#fff",
            }}
          />
        </div>

        {/* Status */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontWeight: 500 }}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "#fff",
            }}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="late">Late</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: "red", fontSize: "14px", marginTop: 4 }}>
            {error}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: 20 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px",
              background: "black",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
              fontWeight: 500,
            }}
          >
            {loading
              ? isEditing
                ? "Updating..."
                : "Recording..."
              : isEditing
              ? "Update"
              : "Record"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: "10px",
                background: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
