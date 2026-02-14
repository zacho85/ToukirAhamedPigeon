import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Building2,
  FileText,
  LoaderCircle,
  User as UserIcon,
} from "lucide-react";

import Breadcrumb from "@/components/module/admin/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { getUserById, updateUser } from "../api";
import { getAllRoles } from "../api/roles";
import { showToast } from "@/redux/slices/toastSlice";
import { useDispatch } from "react-redux";
import PageTransition from '@/components/module/admin/layout/PageTransition';
/* ------------------------- Type Definitions ------------------------- */

interface UserRole {
  id: number;
  name: string;
}

interface UserData {
  fullName: string;
  email: string;
  phoneNumber: string;
  userType: string;
  password: string;
  password_confirmation: string;
  status: string;
  role: string;
  companyName: string;
  legalForm: string;
  managerName: string;
  companyPhone: string;
  companyAddress: string;
  businessDescription: string;
  legalFormDocument: File | string | null;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      errors?: Record<string, string>;
      message?: string;
    };
  };
}

/* --------------------------- Component --------------------------- */

export default function UserEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [data, setData] = useState<UserData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    userType: "personal",
    password: "",
    password_confirmation: "",
    status: "active",
    role: "",
    companyName: "",
    legalForm: "",
    managerName: "",
    companyPhone: "",
    companyAddress: "",
    businessDescription: "",
    legalFormDocument: null,
  });

  const isBusinessUser = data.userType === "business_merchant";

  const breadcrumbs = [
    { label: "Users", href: "/admin/users" },
    { label: "Edit" },
  ];

  /* ----------------------------- Fetch Data ----------------------------- */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          getUserById(id!),
          getAllRoles?.() ?? [],
        ]);

        const user = userRes.data || userRes;

        setData((prev) => ({
          ...prev,
          fullName: user.fullName || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          userType: user.userType || "personal",
          status: user.status || "active",
          role: user.role?.name || user.role || "",
          companyName: user.companyName || "",
          legalForm: user.legalForm || "",
          managerName: user.managerName || "",
          companyPhone: user.companyPhone || "",
          companyAddress: user.companyAddress || "",
          businessDescription: user.businessDescription || "",
          legalFormDocument: user.legalFormDocument || null,
        }));

        if (rolesRes?.data) setRoles(rolesRes.data);
        else if (Array.isArray(rolesRes)) setRoles(rolesRes);
      } catch (err) {
        console.error("Failed to load user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ---------------------------- Handlers ---------------------------- */

  const handleChange = (key: keyof UserData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setData((prev) => ({ ...prev, legalFormDocument: file }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    if (data.password !== data.password_confirmation) {
      setErrors({ password_confirmation: "Passwords do not match" });
      setProcessing(false);
      return;
    }

    try {
      await updateUser(id!, data);

      dispatch(
        showToast({
          type: "success",
          message: "User updated successfully",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );

      navigate(`/admin/users/${id}`);
    } catch (err: ApiErrorResponse | any) {
      console.error("Update failed:", err);

      dispatch(
        showToast({
          type: "danger",
          message: "Failed to update user. Please try again.",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );

      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setProcessing(false);
    }
  };

  /* ---------------------------- Loading ---------------------------- */

  if (loading) {
    return <p className="text-center py-10">Loading user...</p>;
  }

  /* ---------------------------- UI Render ---------------------------- */

  return (
        <PageTransition>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbs} title="Edit User" />

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit User</CardTitle>
              <CardDescription>Update user information and settings</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={data.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        className={errors.fullName ? "border-red-500" : ""}
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={data.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={data.phoneNumber}
                        onChange={(e) => handleChange("phoneNumber", e.target.value)}
                        className={errors.phoneNumber ? "border-red-500" : ""}
                      />
                    </div>

                    {/* User Type */}
                    <div className="space-y-2">
                      <Label>User Type</Label>
                      <Select
                        value={data.userType}
                        onValueChange={(v) => handleChange("userType", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4" /> Personal
                            </div>
                          </SelectItem>

                          <SelectItem value="business_merchant">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" /> Business
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={data.status}
                        onValueChange={(v) => handleChange("status", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={data.role} onValueChange={(v) => handleChange("role", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={r.name}>
                              {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password (Optional)</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        value={data.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) =>
                          handleChange("password_confirmation", e.target.value)
                        }
                        className={errors.password_confirmation ? "border-red-500" : ""}
                      />
                      {errors.password_confirmation && (
                        <p className="text-sm text-red-500">
                          {errors.password_confirmation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                {isBusinessUser && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Building2 className="w-5 h-5" /> Business Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Company Name */}
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input
                          value={data.companyName}
                          onChange={(e) =>
                            handleChange("companyName", e.target.value)
                          }
                        />
                      </div>

                      {/* Legal Form */}
                      <div className="space-y-2">
                        <Label>Legal Form</Label>
                        <Input
                          value={data.legalForm}
                          onChange={(e) => handleChange("legalForm", e.target.value)}
                        />
                      </div>

                      {/* Manager Name */}
                      <div className="space-y-2">
                        <Label>Manager Name</Label>
                        <Input
                          value={data.managerName}
                          onChange={(e) =>
                            handleChange("managerName", e.target.value)
                          }
                        />
                      </div>

                      {/* Company Phone */}
                      <div className="space-y-2">
                        <Label>Company Phone</Label>
                        <Input
                          value={data.companyPhone}
                          onChange={(e) =>
                            handleChange("companyPhone", e.target.value)
                          }
                        />
                      </div>

                      {/* Address */}
                      <div className="space-y-2 md:col-span-2">
                        <Label>Company Address</Label>
                        <Textarea
                          value={data.companyAddress}
                          onChange={(e) =>
                            handleChange("companyAddress", e.target.value)
                          }
                          rows={3}
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2 md:col-span-2">
                        <Label>Business Description</Label>
                        <Textarea
                          value={data.businessDescription}
                          onChange={(e) =>
                            handleChange("businessDescription", e.target.value)
                          }
                          rows={3}
                        />
                      </div>

                      {/* Legal Document */}
                      <div className="space-y-2 md:col-span-2">
                        <Label className="flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Legal Form Document
                        </Label>
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                        />

                        {selectedFile && (
                          <p className="text-sm text-green-600">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>

                  <Button type="submit" disabled={processing}>
                    {processing && (
                      <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                    )}
                    Update User
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      </PageTransition>
  );
}
