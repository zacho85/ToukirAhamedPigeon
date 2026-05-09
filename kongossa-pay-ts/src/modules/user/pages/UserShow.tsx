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
import PageTransition from '@/components/module/admin/layout/PageTransition';

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

export default function UserShow() {
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
    return <p className="text-center py-10 text-muted-foreground">Loading user...</p>;

  if (!user)
    return <p className="text-center py-10 text-muted-foreground">User not found.</p>;

  const createdTontines = user.tontinesCreated ?? [];
  const memberTontines = user.tontineMembers ?? [];

  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users", href: "/admin/users" },
    { label: user.fullName },
  ];

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
        <Breadcrumb items={breadcrumbs} title={user.fullName} />

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16">
                <AvatarImage src={user.profileImage} alt={user.fullName} />
                <AvatarFallback className="text-base sm:text-lg">
                  {user.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="text-lg sm:text-xl font-medium text-foreground">
                  {user.fullName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant={user.userType === "business_merchant" ? "default" : "secondary"}>
                    {user.userType === "business_merchant" ? (
                      <><Building2 className="w-3 h-3 mr-1" /> Business</>
                    ) : (
                      <><UserIcon className="w-3 h-3 mr-1" /> Personal</>
                    )}
                  </Badge>

                  <Badge variant={user.status === "active" ? "default" : "destructive"}>
                    {user.status === "active" ? "Active" : "Suspended"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <UserIcon className="w-4 h-4" /> Full name
                </dt>
                <dd className="mt-1 text-sm text-foreground">{user.fullName}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </dt>
                <dd className="mt-1 text-sm text-foreground break-all">{user.email}</dd>
              </div>

              {user.phoneNumber && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone number
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{String(user.phoneNumber)}</dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                <dd className="mt-1 text-sm text-foreground capitalize">{user.role}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">Member since</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <UserCheck className="w-4 h-4" /> Email Verified
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {user.emailVerifiedAt ? new Date(user.emailVerifiedAt).toLocaleDateString() : "Not Verified"}
                </dd>
              </div>
            </div>

            {/* Business Info */}
            {user.userType === "business_merchant" && (
              <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-medium text-foreground mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Business Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {user.companyName && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-muted-foreground">Company Name</dt>
                      <dd className="mt-1 text-sm text-foreground">{user.companyName}</dd>
                    </div>
                  )}

                  {user.managerName && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Manager Name</dt>
                      <dd className="mt-1 text-sm text-foreground">{user.managerName}</dd>
                    </div>
                  )}

                  {user.companyPhone && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Company Phone
                      </dt>
                      <dd className="mt-1 text-sm text-foreground">{user.companyPhone}</dd>
                    </div>
                  )}

                  {user.legalForm && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Legal Form</dt>
                      <dd className="mt-1 text-sm text-foreground">{user.legalForm}</dd>
                    </div>
                  )}

                  {user.companyAddress && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Company Address
                      </dt>
                      <dd className="mt-1 text-sm text-foreground">{user.companyAddress}</dd>
                    </div>
                  )}

                  {user.businessDescription && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-muted-foreground">Business Description</dt>
                      <dd className="mt-1 text-sm text-foreground">{user.businessDescription}</dd>
                    </div>
                  )}

                  {user.legalFormDocument && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Legal Document
                      </dt>
                      <dd className="mt-1 text-sm">
                        <button
                          onClick={() => downloadUserDocument(user)}
                          className="text-primary underline hover:text-primary/80"
                        >
                          Download
                        </button>
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tontine Sections */}
        <div className="mt-6 sm:mt-8">
          <h3 className="text-lg font-medium mb-4 text-foreground">Tontine Involvement</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Tontines Created ({createdTontines.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {createdTontines.length ? (
                  <ul className="space-y-3 sm:space-y-4">
                    {createdTontines.map((t) => (
                      <li key={t.id} className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Link to={`/tontines/${t.id}`}>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <span className="font-semibold text-sm sm:text-base">{t.name}</span>
                            <Badge>Active</Badge>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {formatCurrency(t.contributionAmount)} / {t.frequency}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No tontines created.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Tontine Memberships ({memberTontines.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {memberTontines.length ? (
                  <ul className="space-y-3 sm:space-y-4">
                    {memberTontines.map((m) => (
                      <li key={m.id} className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Link to={`/tontines/${m.id}`}>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <span className="font-semibold text-sm sm:text-base">{m.tontineName}</span>
                            <Badge variant="secondary">Member</Badge>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Active Member
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No tontine memberships.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}