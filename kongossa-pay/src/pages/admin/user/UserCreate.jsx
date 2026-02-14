import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Building2, FileText, LoaderCircle } from "lucide-react";

import Breadcrumbs from "@/components/dashboard/Breadcumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { createUser } from "@/api/users";
import { useDispatch } from "react-redux";
import { showToast } from "@/store/toastSlice";


export default function UserCreate() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [data, setData] = useState({
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

  const [roles, setRoles] = useState(["user", "business_merchant"]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const isBusinessUser = data.userType === "business_merchant";

  const breadcrumbs = [
    { label: "Users", href: "/admin/users" },
    { label: "Create" },
  ];

  const handleChange = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setData((prev) => ({ ...prev, legalFormDocument: file }));
  };

  const handleSubmit = async (e) => {
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
        // If file selected
        if (key === "legalFormDocument" && value instanceof File) {
          formData.append("legalFormDocument", value);
        } else {
          formData.append(key, value);
        }
      }
    });

      await createUser(formData);
      dispatch(showToast({ type: "success", message: "User created successfully" }));
      navigate("/admin/users");
    } catch (err) {
      console.error(err);
      dispatch(showToast({ type: "danger", message: err?.response?.data?.message || "Failed to create user" }));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 mt-10">
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>Add a new user to the system</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <UserIcon className="w-5 h-5" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={data.fullName} onChange={(e) => handleChange("fullName", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={data.email} onChange={(e) => handleChange("email", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={data.phoneNumber} onChange={(e) => handleChange("phoneNumber", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>User Type</Label>
                    <Select value={data.userType} onValueChange={(v) => handleChange("userType", v)}>
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
                    <Label>Status</Label>
                    <Select value={data.status} onValueChange={(v) => handleChange("status", v)}>
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

              {/* Password */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" value={data.password} onChange={(e) => handleChange("password", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      value={data.password_confirmation}
                      onChange={(e) => handleChange("password_confirmation", e.target.value)}
                    />
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
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input value={data.companyName} onChange={(e) => handleChange("companyName", e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label>Legal Form</Label>
                      <Input value={data.legalForm} onChange={(e) => handleChange("legalForm", e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label>Manager Name</Label>
                      <Input value={data.managerName} onChange={(e) => handleChange("managerName", e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label>Company Phone</Label>
                      <Input value={data.companyPhone} onChange={(e) => handleChange("companyPhone", e.target.value)} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Company Address</Label>
                      <Textarea value={data.companyAddress} onChange={(e) => handleChange("companyAddress", e.target.value)} rows={3} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Business Description</Label>
                      <Textarea value={data.businessDescription} onChange={(e) => handleChange("businessDescription", e.target.value)} rows={3} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Legal Form Document
                      </Label>
                      <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                      {selectedFile && <p className="text-sm text-green-600">Selected: {selectedFile.name}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing && <LoaderCircle className="w-4 h-4 animate-spin mr-2" />}
                  Create User
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
