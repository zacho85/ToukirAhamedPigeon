import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '@/store/toastSlice';

export function TontineMemberForm({ tontine, availableUsers, member, maxPriorityOrder = 1, onSuccess, onCancel }) {
  const isEditing = !!member;
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    user_id: member?.user_id || '',
    priority_order: member?.priority_order || (maxPriorityOrder + 1),
    is_admin: member?.is_admin || false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const url = isEditing
        ? `/tontine-members/${member.id}`
        : `/tontines/${tontine.id}/members`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        setErrors(errData.errors || { form: 'Something went wrong' });
        dispatch(
          showToast({
            type: "error",
            message: errData.errors?.form?.[0] || errData.message || "Something went wrong",
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
            message: isEditing ? "Member updated successfully!" : "Member added successfully!",
            position: "top-right",
            animation: "slide-right-in",
            duration: 4000,
          })
        );
      }
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>{isEditing ? 'Edit Member' : `Add Member to "${tontine.name}"`}</h2>

      {!isEditing && (
        <div style={{ marginBottom: 10 }}>
          <label>User:</label>
          <select name="user_id" value={formData.user_id} onChange={handleChange}>
            <option value="">Select a user</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {errors.user_id && <div style={{ color: 'red' }}>{errors.user_id}</div>}
        </div>
      )}

      {isEditing && member && (
        <div style={{ marginBottom: 10 }}>
          <strong>Current Member:</strong> {member.user.name} ({member.user.email})
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        <label>Priority Order:</label>
        <input
          type="number"
          name="priority_order"
          value={formData.priority_order}
          onChange={handleChange}
          min="1"
        />
        {errors.priority_order && <div style={{ color: 'red' }}>{errors.priority_order}</div>}
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          <input
            type="checkbox"
            name="is_admin"
            checked={formData.is_admin}
            onChange={handleChange}
          />
          Admin
        </label>
      </div>

      {errors.form && <div style={{ color: 'red', marginBottom: 10 }}>{errors.form}</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" disabled={loading}>
          {loading ? (isEditing ? 'Updating...' : 'Adding...') : isEditing ? 'Update Member' : 'Add Member'}
        </button>
        {onCancel && <button type="button" onClick={onCancel} disabled={loading}>Cancel</button>}
      </div>
    </form>
  );
}
