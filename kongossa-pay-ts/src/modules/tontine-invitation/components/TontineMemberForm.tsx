import { useState, type ChangeEvent, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";

interface User {
  id: number | string;
  name: string;
  email: string;
}

interface MemberUser {
  id: number;
  user_id: number | string;
  priority_order: number;
  is_admin: boolean;
  user: {
    name: string;
    email: string;
  };
}

interface Tontine {
  id: number | string;
  name: string;
}

interface ErrorsType {
  user_id?: string;
  priority_order?: string;
  form?: string;
  [key: string]: any;
}

interface TontineMemberFormProps {
  tontine: Tontine;
  availableUsers: User[];
  member?: MemberUser | null;
  maxPriorityOrder?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TontineMemberForm({
  tontine,
  availableUsers,
  member,
  maxPriorityOrder = 1,
  onSuccess,
  onCancel,
}: TontineMemberFormProps) {
  const isEditing = !!member;
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    user_id: member?.user_id || "",
    priority_order: member?.priority_order || maxPriorityOrder + 1,
    is_admin: member?.is_admin || false,
  });

  const [errors, setErrors] = useState<ErrorsType>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const url = isEditing
        ? `/tontine-members/${member?.id}`
        : `/tontines/${tontine.id}/members`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || { form: "Something went wrong" });

        dispatch(
          showToast({
            type: "danger",
            message:
              data.errors?.form?.[0] ||
              data.message ||
              "Something went wrong",
            position: "top-right",
            animation: "slide-right-in",
            duration: 4000,
          })
        );
      } else {
        onSuccess?.();
        dispatch(
          showToast({
            type: "success",
            message: isEditing
              ? "Member updated successfully!"
              : "Member added successfully!",
            position: "top-right",
            animation: "slide-right-in",
            duration: 4000,
          })
        );
      }
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 rounded-xl
                 bg-white dark:bg-gray-900
                 border border-gray-200 dark:border-gray-700
                 text-gray-900 dark:text-gray-100"
    >
      <h2 className="text-xl font-semibold mb-5">
        {isEditing
          ? "Edit Member"
          : `Add Member to "${tontine.name}"`}
      </h2>

      {/* User Select */}
      {!isEditing && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            User
          </label>
          <select
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md
                       bg-white dark:bg-gray-800
                       border border-gray-300 dark:border-gray-600
                       text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a user</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {errors.user_id && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.user_id}
            </p>
          )}
        </div>
      )}

      {/* Current Member */}
      {isEditing && member && (
        <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
          <strong>Current Member:</strong>{" "}
          {member.user.name} ({member.user.email})
        </div>
      )}

      {/* Priority Order */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Priority Order
        </label>
        <input
          type="number"
          name="priority_order"
          value={formData.priority_order}
          onChange={handleChange}
          min={1}
          className="w-full px-3 py-2 rounded-md
                     bg-white dark:bg-gray-800
                     border border-gray-300 dark:border-gray-600
                     text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.priority_order && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.priority_order}
          </p>
        )}
      </div>

      {/* Admin Checkbox */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_admin"
            checked={formData.is_admin}
            onChange={handleChange}
            className="rounded border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800
                       text-blue-600 focus:ring-blue-500"
          />
          Admin
        </label>
      </div>

      {/* Form Error */}
      {errors.form && (
        <div className="mb-4 text-sm text-red-600 dark:text-red-400">
          {errors.form}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-md text-white
                     bg-blue-600 hover:bg-blue-700
                     disabled:opacity-60"
        >
          {loading
            ? isEditing
              ? "Updating..."
              : "Adding..."
            : isEditing
            ? "Update Member"
            : "Add Member"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-md
                       bg-gray-200 dark:bg-gray-700
                       text-gray-900 dark:text-gray-100
                       hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
