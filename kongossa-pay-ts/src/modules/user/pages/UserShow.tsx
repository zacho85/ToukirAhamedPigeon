import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Building2,
  FileText,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  User as UserIcon,
} from "lucide-react";

import Breadcrumb from "@/components/module/admin/layout/Breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { getUserById, downloadUserDocument } from "../api";
import { useDispatch } from "react-redux";
import PageTransition from '@/components/module/admin/layout/PageTransition';

// ----------------------
// TYPES
// ----------------------
interface TontineCreated {
  id: string | number;
  name: string;
  contributionAmount: number;
  frequency: string;
}

interface TontineMember {
  id: string | number;
  tontineName: string;
}

interface UserType {
  id: string | number;
  fullName: string;
  email: string;
  phoneNumber?: string | number;
  profileImage?: string;
  userType: "business_merchant" | "personal";
  status: "active" | "suspended";
  role: string;
  createdAt: string;
  emailVerifiedAt?: string;

  // business fields
  companyName?: string;
  managerName?: string;
  companyPhone?: string;
  legalForm?: string;
  companyAddress?: string;
  businessDescription?: string;
  legalFormDocument?: string;

  tontinesCreated?: TontineCreated[];
  tontineMembers?: TontineMember[];
}


// ----------------------
// COMPONENT
// ----------------------
export default function UserShow() {
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await getUserById(id!);
      setUser(data);
    } catch (err) {
      console.error("❌ Failed to fetch user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  if (loading)
    return (
      <p className="text-center py-10 text-muted-foreground">Loading user...</p>
    );

  if (!user)
    return (
      <p className="text-center py-10 text-muted-foreground">User not found.</p>
    );

  // Fallbacks
  const createdTontines = user.tontinesCreated ?? [];
  const memberTontines = user.tontineMembers ?? [];

  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users", href: "/admin/users" },
    { label: user.fullName },
  ];

  return (
        <PageTransition>
      <div className="space-y-6">
        {breadcrumbs && <Breadcrumb items={breadcrumbs} title={user.fullName} />}

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profileImage} alt={user.fullName} />
                <AvatarFallback className="text-lg">
                  {user.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {user.fullName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      user.userType === "business_merchant"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {user.userType === "business_merchant" ? (
                      <>
                        <Building2 className="w-3 h-3 mr-1" />
                        Business
                      </>
                    ) : (
                      <>
                        <UserIcon className="w-3 h-3 mr-1" />
                        Personal
                      </>
                    )}
                  </Badge>

                  <Badge
                    variant={user.status === "active" ? "default" : "destructive"}
                  >
                    {user.status === "active" ? "Active" : "Suspended"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              {/* Full Name */}
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Full name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {user.fullName}
                </dd>
              </div>

              {/* Email */}
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {user.email}
                </dd>
              </div>

              {/* Phone */}
              {user.phoneNumber && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {String(user.phoneNumber)}
                  </dd>
                </div>
              )}

              {/* Role */}
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Role
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {user.role}
                </dd>
              </div>

              {/* Member Since */}
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Member since
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(user.createdAt).toLocaleDateString()}
                </dd>
              </div>

              {/* Verified */}
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Email Verified
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {user.emailVerifiedAt
                    ? new Date(user.emailVerifiedAt).toLocaleDateString()
                    : "Not Verified"}
                </dd>
              </div>
            </dl>

            {/* Business Info */}
            {user.userType === "business_merchant" && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Business Information
                </h4>

                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {user.companyName && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Company Name
                      </dt>
                      <dd className="mt-1 text-sm">{user.companyName}</dd>
                    </div>
                  )}

                  {user.managerName && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Manager Name
                      </dt>
                      <dd className="mt-1 text-sm">{user.managerName}</dd>
                    </div>
                  )}

                  {user.companyPhone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Company Phone
                      </dt>
                      <dd className="mt-1 text-sm">{user.companyPhone}</dd>
                    </div>
                  )}

                  {user.legalForm && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Legal Form
                      </dt>
                      <dd className="mt-1 text-sm">{user.legalForm}</dd>
                    </div>
                  )}

                  {user.companyAddress && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Company Address
                      </dt>
                      <dd className="mt-1 text-sm">{user.companyAddress}</dd>
                    </div>
                  )}

                  {user.businessDescription && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Business Description
                      </dt>
                      <dd className="mt-1 text-sm">{user.businessDescription}</dd>
                    </div>
                  )}

                  {user.legalFormDocument && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Legal Document
                      </dt>
                      <dd className="mt-1 text-sm">
                        <button
                          onClick={() => downloadUserDocument(user)}
                          className="text-primary underline"
                        >
                          Download
                        </button>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Tontine Sections */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
            Tontine Involvement
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Created Tontines */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Tontines Created ({createdTontines.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {createdTontines.length ? (
                  <ul className="space-y-4">
                    {createdTontines.map((t) => (
                      <li
                        key={t.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Link to={`/tontines/${t.id}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{t.name}</span>
                            <Badge>Active</Badge>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formatCurrency(t.contributionAmount)} /{" "}
                            {t.frequency}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No tontines created.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Memberships */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Tontine Memberships ({memberTontines.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {memberTontines.length ? (
                  <ul className="space-y-4">
                    {memberTontines.map((m) => (
                      <li
                        key={m.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Link to={`/tontines/${m.id}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{m.tontineName}</span>
                            <Badge>Member</Badge>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formatCurrency(1200)} / 1
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No tontine memberships.
                  </p>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
      </PageTransition>
  );
}
