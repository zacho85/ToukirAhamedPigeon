import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import SettingsLayout from "./SettingsLayout";
import HeadingSmall from "@/modules/settings/components/HeadingSmall";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToast } from "@/redux/slices/toastSlice";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  uploadFile,
} from "@/modules/settings/api";
import { UploadIcon } from "lucide-react";
import { setUser } from "@/redux/slices/authSlice";

interface ProfileData {
  fullName: string;
  email: string;
  profileImage?: string;
}

interface Errors {
  fullName?: string[];
  email?: string[];
}

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [profile, setProfile] = useState<ProfileData>({
    fullName: "",
    email: "",
    profileImage: "",
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  /* ==============================
     Fetch Profile
  ============================== */
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();

      setProfile({
        fullName: data.fullName,
        email: data.email,
        profileImage: data.profileImage || "",
      });

      setPreview(data.profileImage || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ==============================
     Cleanup blob preview
  ============================== */
  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /* ==============================
     Handlers
  ============================== */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", "profile");

      const res = await uploadFile(formData);
      return res.path;
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          type: "danger",
          message: "Profile image upload failed",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    try {
      let uploadedImagePath = profile.profileImage || "";

      if (selectedFile) {
        const path = await handleUpload();
        if (path) uploadedImagePath = path;
      }

      await updateProfile({
        ...profile,
        profileImage: uploadedImagePath,
      });

      setProfile((prev) => ({
        ...prev,
        profileImage: uploadedImagePath,
      }));

      setPreview(uploadedImagePath);

      // ✅ Update Redux user (header/avatar updates instantly)
      dispatch(
        setUser({
          fullName: profile.fullName,
          email: profile.email,
          profileImage: uploadedImagePath,
        })
      );

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
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }

      dispatch(
        showToast({
          type: "danger",
          message: "Profile update failed. Please check your inputs.",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;

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
      navigate("/");
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          type: "danger",
          message: "Account deletion failed. Please try again.",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  if (loading) {
    return (
      <p className="text-center py-10 text-muted-foreground">Loading...</p>
    );
  }

  return (
    <SettingsLayout>
      <div className="space-y-6 mt-10">
        <HeadingSmall
          title="Profile information"
          description="Update your name, email, and profile picture"
        />

        {/* ================= Profile Image ================= */}
        <div className="relative w-24 h-24">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
            {preview ? (
              <img
                src={
                  preview.startsWith("blob:")
                    ? preview
                    : `${import.meta.env.VITE_APP_API_URL}${preview}`
                }
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                No Image
              </div>
            )}
          </div>

          <label
            htmlFor="profileImage"
            className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition"
          >
            <UploadIcon className="w-4 h-4" />
          </label>

          <input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* ================= Form ================= */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              required
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm">
                {errors.fullName.join(", ")}
              </p>
            )}
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
            />
            {errors.email && (
              <p className="text-red-500 text-sm">
                {errors.email.join(", ")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit">Save</Button>
            {success && <p className="text-sm text-green-600">Saved</p>}
          </div>
        </form>

        <hr />

        <Button variant="destructive" onClick={handleDelete}>
          Delete Account
        </Button>
      </div>
    </SettingsLayout>
  );
}
