import React, { useState } from "react";
import { contributeToTontine } from "@/modules/tontine/api";
import { showToast } from "@/redux/slices/toastSlice";
import { useDispatch } from "react-redux";

// ----------------------------
// Types
// ----------------------------

interface User {
  id: number | string;
  fullName: string;
}

interface Tontine {
  id: number | string;
  name: string;
  contributionAmount: number;
}

interface TontineMember {
  user: User;
  tontine: Tontine;
}

interface Contribution {
  id: number | string;
  amount: number;
  contribution_date: string;
  status: "pending" | "paid" | "late";
}

interface Props {
  tontineMember: TontineMember;
  contribution?: Contribution | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TontineContributionForm: React.FC<Props> = ({
  tontineMember,
  contribution,
  onSuccess,
  onCancel,
}) => {
  const dispatch = useDispatch();
  const isEditing = !!contribution;
  const today = new Date().toISOString().split("T")[0];

  const [amount, setAmount] = useState<number>(
    contribution?.amount ?? tontineMember.tontine.contributionAmount
  );
  const [date, setDate] = useState<string>(
    contribution?.contribution_date ?? today
  );
  const [status, setStatus] = useState<"pending" | "paid" | "late">(
    contribution?.status ?? "pending"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = { amount, contribution_date: date, status };

    try {
      if (isEditing) {
        await contributeToTontine(
          contribution!.id,
          payload,
          tontineMember.user.id
        );
      } else {
        await contributeToTontine(
          tontineMember.tontine.id,
          payload,
          tontineMember.user.id
        );
      }

      onSuccess?.();

      dispatch(
        showToast({
          type: "success",
          message: isEditing
            ? "Contribution updated successfully"
            : "Contribution recorded successfully",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err: any) {
      console.error("Contribution error:", err);
      setError("Failed to submit the contribution.");

      dispatch(
        showToast({
          type: "danger",
          message:
            err?.response?.data?.message ||
            err?.message ||
            "Something went wrong",
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
    <div className="max-w-md mx-auto mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
        {isEditing ? "Edit Contribution" : "Record Contribution"}
      </h2>

      {/* Info Card */}
      <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
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
        <div>
          <label className="mb-1 block font-medium text-gray-700 dark:text-gray-200">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            min="0"
            step="0.01"
            required
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-white dark:focus:ring-white"
          />
        </div>

        {/* Date */}
        <div>
          <label className="mb-1 block font-medium text-gray-700 dark:text-gray-200">
            Contribution Date
          </label>
          <input
            type="date"
            value={date}
            max={today}
            required
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-white dark:focus:ring-white"
          />
        </div>

        {/* Status */}
        <div>
          <label className="mb-1 block font-medium text-gray-700 dark:text-gray-200">
            Status
          </label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "pending" | "paid" | "late")
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-white dark:focus:ring-white"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="late">Late</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {/* Buttons */}
        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-black px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
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
              className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-800 transition hover:bg-gray-300 disabled:opacity-60 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TontineContributionForm;
