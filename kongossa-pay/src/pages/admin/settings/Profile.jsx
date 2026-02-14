import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Breadcrumbs from "@/components/dashboard/Breadcumbs";
import HeadingSmall from "@/components/dashboard/HeadingSmall";
import InputError from "@/components/dashboard/InputError";
import SettingsLayout from "./SettingsLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getProfile, updateProfile, deleteProfile } from "@/api/settings";
import { useDispatch } from "react-redux";
import { showToast } from "@/store/toastSlice"; 

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  const [profile, setProfile] = useState({ fullName: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile({ fullName: data.fullName, email: data.email });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    try {
      await updateProfile(profile);
      setSuccess(true);
      dispatch(
        showToast({
          type: "success",
          message: "Profile updated successfully!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        dispatch(
          showToast({
            type: "error",
            message: "Profile update failed. Please check your inputs.",
            position: "top-right",
            animation: "slide-right-in",
            duration: 4000,
          })
        );
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await deleteProfile();
        dispatch(
          showToast({
            type: "success",
            message: "Account deleted successfully!",
            position: "top-right",
            animation: "slide-right-in",
            duration: 4000,
          })
        );
        navigate("/"); // Redirect after deletion
      } catch (err) {
        console.error(err);
        dispatch(
          showToast({
            type: "error",
            message: "Account deletion failed. Please try again.",
            position: "top-right",
            animation: "slide-right-in",
            duration: 4000,
          })
        );
      }
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings" },
    { label: "Profile" },
  ];

  if (loading) return <p className="text-center py-10 text-muted-foreground">Loading...</p>;

  return (
    <SettingsLayout>
      <div className="space-y-6 mt-10">
        {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}

        <HeadingSmall title="Profile information" description="Update your name and email address" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              required
              placeholder="Full name"
            />
            <InputError message={errors.name} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              required
              placeholder="Email address"
            />
            <InputError message={errors.email} />
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit">Save</Button>
            {success && <p className="text-sm text-green-600">Saved</p>}
          </div>
        </form>

        <hr />

        <div>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Account
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
}
