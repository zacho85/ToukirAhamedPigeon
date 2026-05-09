import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Building2,
  FileText,
  LoaderCircle,
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

import { createUser } from "../api";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import PageTransition from '@/components/module/admin/layout/PageTransition';

interface UserFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  userType: "personal" | "business_merchant";
  role: string;
  password: string;
  password_confirmation: string;
  status: "active" | "inactive";
  companyName: string;
  legalForm: string;
  managerName: string;
  companyPhone: string;
  companyAddress: string;
  businessDescription: string;
  legalFormDocument: File | null;
}

export default function UserCreate() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [data, setData] = useState<UserFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    userType: "personal",
    role: "",
    password: "",
    password_confirmation: "",
    status: "active",
    companyName: "",
    legalForm: "",
    managerName: "",
    companyPhone: "",
    companyAddress: "",
    businessDescription: "",
    legalFormDocument: null,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const isBusinessUser = data.userType === "business_merchant";

  const breadcrumbs = [
    { label: "Users", href: "/admin/users" },
    { label: "Create" },
  ];

  const handleChange = (key: keyof UserFormData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setData((prev) => ({ ...prev, legalFormDocument: file }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (data.password !== data.password_confirmation) {
      dispatch(showToast({ type: "danger", message: "Passwords do not match" }));
      return;
    }

    setProcessing(true);

    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === "legalFormDocument" && value instanceof File) {
            formData.append("legalFormDocument", value);
          } else {
            formData.append(key, value as string);
          }
        }
      });

      await createUser(formData);

      dispatch(showToast({ type: "success", message: "User created successfully" }));
      navigate("/admin/users");
    } catch (err: any) {
      console.error(err);
      dispatch(
        showToast({
          type: "danger",
          message: err?.response?.data?.message || "Failed to create user",
        })
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 px-4 sm:px-0">
        <Breadcrumb items={breadcrumbs} title="Create New User" />

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Create New User</CardTitle>
              <CardDescription>Add a new user to the system</CardDescription>
            </CardHeader>

            <CardContent className="px-4 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2 text-foreground">
                    <UserIcon className="w-5 h-5" /> Personal Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Full Name</Label>
                      <Input
                        value={data.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Email</Label>
                      <Input
                        type="email"
                        value={data.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Phone Number</Label>
                      <Input
                        value={data.phoneNumber}
                        onChange={(e) => handleChange("phoneNumber", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">User Type</Label>
                      <Select
                        value={data.userType}
                        onValueChange={(v) =>
                          handleChange("userType", v as "personal" | "business_merchant")
                        }
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

                    <div className="space-y-2">
                      <Label className="text-foreground">Status</Label>
                      <Select
                        value={data.status}
                        onValueChange={(v) => handleChange("status", v as "active" | "inactive")}
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
                  </div>
                </div>

                {/* Security */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">Security</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Password</Label>
                      <Input
                        type="password"
                        value={data.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Confirm Password</Label>
                      <Input
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => handleChange("password_confirmation", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                {isBusinessUser && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2 text-foreground">
                      <Building2 className="w-5 h-5" /> Business Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Company Name</Label>
                        <Input
                          value={data.companyName}
                          onChange={(e) => handleChange("companyName", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground">Legal Form</Label>
                        <Input
                          value={data.legalForm}
                          onChange={(e) => handleChange("legalForm", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground">Manager Name</Label>
                        <Input
                          value={data.managerName}
                          onChange={(e) => handleChange("managerName", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground">Company Phone</Label>
                        <Input
                          value={data.companyPhone}
                          onChange={(e) => handleChange("companyPhone", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-foreground">Company Address</Label>
                        <Textarea
                          rows={3}
                          value={data.companyAddress}
                          onChange={(e) => handleChange("companyAddress", e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-foreground">Business Description</Label>
                        <Textarea
                          rows={3}
                          value={data.businessDescription}
                          onChange={(e) => handleChange("businessDescription", e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label className="flex items-center gap-2 text-foreground">
                          <FileText className="w-4 h-4" /> Legal Form Document
                        </Label>
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="w-full"
                        />
                        {selectedFile && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                  <Button variant="outline" type="button" onClick={() => navigate(-1)} className="w-full sm:w-auto order-2 sm:order-1">
                    Cancel
                  </Button>

                  <Button type="submit" disabled={processing} className="w-full sm:w-auto order-1 sm:order-2">
                    {processing && <LoaderCircle className="w-4 h-4 animate-spin mr-2" />}
                    Create User
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