import { useEffect, useState, useRef, type ChangeEvent, type FormEvent } from "react";
import SettingsLayout from "./SettingsLayout";
import HeadingSmall from "@/modules/settings/components/HeadingSmall";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import { getPassword, updatePassword } from "@/modules/settings/api";

interface PasswordForm {
  current_password: string;
  password: string;
  password_confirmation: string;
}

interface Errors {
  current_password?: string[];
  password?: string[];
  password_confirmation?: string[];
}

export default function Password() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState<PasswordForm>({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState<boolean>(false);

  const currentPasswordInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  const fetchPasswordSettings = async () => {
    try {
      setLoading(true);
      await getPassword();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasswordSettings();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    try {
      await updatePassword(form);
      setForm({ current_password: "", password: "", password_confirmation: "" });
      setSuccess(true);
      dispatch(
        showToast({
          type: "success",
          message: "Password updated successfully",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        dispatch(
          showToast({
            type: "danger",
            message: err.response.data.errors.password?.[0] || "Password update failed",
            position: "top-right",
            animation: "slide-right-in",
            duration: 4000,
          })
        );

        if (err.response.data.errors.password) passwordInput.current?.focus();
        if (err.response.data.errors.current_password) currentPasswordInput.current?.focus();
      }
    }
  };

  if (loading)
    return (
      <p className="text-center py-10 text-muted-foreground">Loading...</p>
    );

  return (
    <SettingsLayout>
      <div className="space-y-6 mt-10">
        {/* {breadcrumbs && <Breadcrumb items={breadcrumbs} title="Password" />} */}

        <HeadingSmall
          title="Update password"
          description="Ensure your account is using a long, random password to stay secure"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="current_password">Current password</Label>
            <Input
              id="current_password"
              ref={currentPasswordInput}
              name="current_password"
              type="password"
              value={form.current_password}
              onChange={handleChange}
              placeholder="Current password"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              ref={passwordInput}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="New password"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password_confirmation">Confirm password</Label>
            <Input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm password"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit">Save password</Button>
            {success && <p className="text-sm text-green-600">Saved</p>}
          </div>
        </form>
      </div>
    </SettingsLayout>
  );
}
