import { useEffect, useState } from "react";
import { getQRPayments } from "@/modules/dashboard/api/qrPayments";
import PendingQRPaymentCard from "../components/PendingQRPaymentCard";

export default function PendingQRPayments() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await getQRPayments({ status: "pending", mine: true });
    setItems(data);
    setLoading(false);
  };

  if (loading) return <p className="p-6">Loading pending QR payments…</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Pending QR Payments</h1>

      {!items.length && (
        <p className="text-muted-foreground">No pending QR payments</p>
      )}

      {items.map((qr) => (
        <PendingQRPaymentCard key={qr.id} qr={qr} onCompleted={load} />
      ))}
    </div>
  );
}
