import { useState, type FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addTontineInvite } from "@/modules/tontine/api";
import { showToast } from "@/redux/slices/toastSlice";
import { useDispatch } from "react-redux";

// =========================
// Types
// =========================
interface Tontine {
  id: string | number;
  name: string;
  type: string;
  contributionAmount: number;
  frequency: string;
}

interface TontineInviteFormProps {
  tontine: Tontine;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TontineInviteForm({
  tontine,
  onSuccess,
  onCancel,
}: TontineInviteFormProps) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();

  const handleSubmit = async (e: FormEvent) => {
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
    } catch (err: any) {
      setError("Failed to send invitation.");

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
      setSending(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto rounded-xl border shadow-sm
      bg-white text-gray-800
      dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
    >
      {/* Header */}
      <CardHeader className="pb-3 border-b dark:border-gray-700">
        <CardTitle className="text-xl font-semibold">
          Invite Member to{" "}
          <span className="text-gray-900 dark:text-white">
            "{tontine.name}"
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {/* Tontine Details */}
        <div
          className="rounded-lg border p-4 text-sm space-y-1
          bg-gray-50 border-gray-200
          dark:bg-gray-800 dark:border-gray-700"
        >
          <p className="text-gray-700 dark:text-gray-200">
            <span className="font-semibold">Type:</span> {tontine.type}
          </p>
          <p className="text-gray-700 dark:text-gray-200">
            <span className="font-semibold">Contribution:</span>{" "}
            ${tontine.contributionAmount} ({tontine.frequency})
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Email Address
            </Label>
            <Input
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10
                bg-white text-gray-900
                dark:bg-gray-800 dark:text-gray-100
                dark:border-gray-700 dark:placeholder:text-gray-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Preview */}
          {email && (
            <div
              className="border rounded-lg p-4 text-sm space-y-1
              bg-blue-50 border-blue-200
              dark:bg-blue-950 dark:border-blue-900"
            >
              <p className="font-semibold text-blue-800 dark:text-blue-300">
                Invitation Preview
              </p>
              <p className="text-gray-700 dark:text-gray-200">
                Email: {email}
              </p>
              <p className="text-gray-700 dark:text-gray-200">
                Tontine: {tontine.name}
              </p>
              <p className="text-gray-700 dark:text-gray-200">
                Contribution: ${tontine.contributionAmount} (
                {tontine.frequency})
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3">
            {onCancel && (
              <Button
                variant="outline"
                type="button"
                onClick={onCancel}
                className="
                  px-6
                  dark:border-gray-600
                  dark:text-gray-200
                  dark:hover:bg-gray-800
                "
              >
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              disabled={sending}
              className="
                px-6
                bg-primary text-white
                hover:bg-primary/90
                dark:hover:bg-primary/80
              "
            >
              {sending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
