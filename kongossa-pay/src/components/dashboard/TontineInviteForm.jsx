"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addTontineInvite } from "../../api/tontines";
import { showToast } from "@/store/toastSlice";
import { useDispatch } from "react-redux";

export default function TontineInviteForm({ tontine, onSuccess, onCancel }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      await addTontineInvite(tontine.id, { email });
      setEmail("");
      onSuccess?.();
      dispatch(
        showToast({
          type: "success",
          message: "Invitation sent successfully!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err) {
      console.error(err);
      setError("Failed to send invitation.");
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
      setSending(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto border rounded-xl shadow-sm bg-white">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Invite Member to "{tontine.name}"
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {/* Tontine Details */}
        <div className="rounded-lg border p-4 bg-gray-50 text-sm space-y-1">
          <p>
            <span className="font-semibold">Type:</span> {tontine.type}
          </p>
          <p>
            <span className="font-semibold">Contribution:</span> $
            {tontine.contributionAmount} ({tontine.frequency})
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Email Address</Label>
            <Input
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Preview */}
          {email && (
            <div className="border rounded-lg p-4 bg-blue-50 text-sm space-y-1">
              <p className="font-semibold">Invitation Preview:</p>
              <p>Email: {email}</p>
              <p>Tontine: {tontine.name}</p>
              <p>
                Contribution: ${tontine.contributionAmount} (
                {tontine.frequency})
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            {onCancel && (
              <Button
                variant="outline"
                type="button"
                className="px-6"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}

            <Button type="submit" disabled={sending} className="px-6">
              {sending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
