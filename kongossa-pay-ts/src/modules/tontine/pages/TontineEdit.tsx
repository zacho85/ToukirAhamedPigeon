import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from '@/components/module/admin/layout/Breadcrumb'
import { TontineForm } from "@/modules/tontine/components/TontineForm";
// import { useToast } from "@/hooks/use-toast";
import {
  getTontineById,
  updateTontine,
  getTontineTypes,
} from "../api"; // adjust your API imports
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import PageTransition from '@/components/module/admin/layout/PageTransition';
// --------------------------
// Types
// --------------------------
interface Tontine {
  id: string;
  name: string;
  description?: string;
  type?: string;
  [key: string]: any; // allow other dynamic properties
}

interface TontineType {
  value: string;
  label: string;
  description?: string;
}

// --------------------------
// Component
// --------------------------
export default function EditTontinePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  // const { toast } = useToast();

  const [tontine, setTontine] = useState<Tontine | null>(null);
  const [tontineTypes, setTontineTypes] = useState<TontineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------
  // Breadcrumbs
  // --------------------------
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "E-Tontine" },
    { label: "My Tontines", href: "/tontines" },
    { label: tontine?.name || "Loading..." },
    { label: "Edit" },
  ];

  // --------------------------
  // Fetch Tontine & Types
  // --------------------------
  const fetchTontineData = async () => {
    setLoading(true);
    setError("");
    try {
      const [tontineRes, typesRes] = await Promise.all([
        getTontineById(id || ""),
        getTontineTypes(),
      ]);
      setTontine(tontineRes);
      setTontineTypes(typesRes.tontineTypes || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load tontine data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTontineData();
  }, [id]);

  // --------------------------
  // Handlers
  // --------------------------
  const handleCancel = () => {
    navigate(`/tontines/${id}`);
  };

  const handleSubmit = async (values: any) => {
    try {
      await updateTontine(id!, values);
      // toast({
      //   title: "Tontine Updated",
      //   description: "Your tontine has been updated successfully.",
      // });
      dispatch(
        showToast({
          type: "success",
          message: "Tontine Updated",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
      navigate(`/tontines/${id}`);
    } catch (err: any) {
      console.error(err);
      dispatch(
        showToast({
          type: "danger",
          message: "Update Failed",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  // --------------------------
  // Render
  // --------------------------
  if (loading) return <div className="py-16 text-center">Loading...</div>;
  if (error)
    return (
      <PageTransition>
        <div className="py-16 text-center text-red-600 space-y-2">
          <div>{error}</div>
          <button
            onClick={fetchTontineData}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </PageTransition>
    );

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto mt-10 space-y-6">
        <Breadcrumb items={breadcrumbs} title="Edit Tontine" />
        <h1 className="text-3xl font-bold tracking-tight">
          Edit {tontine?.name}
        </h1>
        <TontineForm
          tontineTypes={tontineTypes.map((type) => ({
            value: type.value,
            label: type.label,
            description: type.description,
          }))}
          defaultValues={tontine!}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing={true}
        />
      </div>
      </PageTransition>
  );
}
