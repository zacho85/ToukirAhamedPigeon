import React from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "@/components/module/admin/layout/Breadcrumb";
import { TontineForm } from "@/modules/tontine/components/TontineForm";
import { getTontineTypes, createTontine } from "../api";
import { useSelector, useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import PageTransition from '@/components/module/admin/layout/PageTransition';
interface TontineTypeOption {
  value: string | number;
  label: string;
}

interface RootState {
  auth: {
    user: {
      id: string | number;
      [key: string]: any;
    } | null;
  };
}

export default function CreateTontine() {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [tontineTypes, setTontineTypes] = React.useState<TontineTypeOption[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>("");

  // 🟢 Fetch available tontine types
 React.useEffect(() => {
  const fetchTypes = async () => {
    try {
      const res = await getTontineTypes(); // returns TontineType[]
      const options = (res.tontineTypes || []).map((t: any) => ({
        value: t.value,
        label: t.label,
        description: t.description,
      }));
      setTontineTypes(options); // now it's TontineTypeOption[]
    } catch (err) {
      console.error(err);
      setError("Failed to load tontine types. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  fetchTypes();
}, []);

  // 🟢 Handle form success
  const handleSuccess = () => {
    dispatch(
      showToast({
        type: "success",
        message: "Tontine created successfully!",
        position: "top-right",
        animation: "slide-right-in",
        duration: 4000,
      })
    );
    navigate("/tontines");
  };

  // 🟢 Handle cancel
  const handleCancel = () => {
    navigate("/tontines");
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "E-Tontine" },
    { label: "My Tontines", href: "/tontines" },
    { label: "Create Tontine" },
  ];

  if (loading)
    return (
      <PageTransition>
        <div className="flex justify-center items-center h-64 text-muted-foreground">
          Loading tontine types...
        </div>
      </PageTransition>
    );

  if (error)
    return (
      <PageTransition>
        <div className="text-center py-16 text-red-600">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-2 underline text-sm"
          >
            Retry
          </button>
        </div>
      </PageTransition>
    );

  return (
    <PageTransition>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} title="Create Tontine" />
        <div className="max-w-3xl mx-auto mt-10">
          <TontineForm
            tontineTypes={tontineTypes}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            onSubmit={async (data: any) => {
              try {
                const payload = {
                  name: data.name,
                  type: data.tontine_type_id, // map frontend value
                  contributionAmount: Number(data.amount),
                  contributionFrequency: data.cycle,
                  durationMonths: Number(data.duration_months),
                  // creatorId: user?.id, // backend assigns creatorId
                };

                await createTontine(payload);
                handleSuccess();
              } catch (err) {
                console.error("Failed to create tontine:", err);
              }
            }}
          />
        </div>
      </div>
    </PageTransition>
  );
}
