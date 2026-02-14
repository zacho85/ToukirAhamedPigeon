import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { attachPaymentMethod, createSetupIntent } from "../api";
import { dispatchShowToast } from "@/lib/dispatch";
import { Input } from "@/components/ui/input";

export default function AddPaymentMethodForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({
    accountName: "",
    bankName: "",
    });

  const saveCard = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      // 1️⃣ Create SetupIntent
      const { clientSecret } = await createSetupIntent();
      const result = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );

      if (result.error) {
        alert(result.error.message);
        return;
      }

      // 3️⃣ Attach payment method
    const pm = result.setupIntent?.payment_method;

    if (!pm) {
    throw new Error("Payment method not created");
    }

    const paymentMethodId =
    typeof pm === "string" ? pm : pm.id;

    await attachPaymentMethod(paymentMethodId, {
        accountName: meta.accountName,
        bankName: meta.bankName,
    });

      dispatchShowToast({
        type: "success",
        message: "Card saved successfully!",
        position: "top-right",
        animation: "slide-right-in",
        duration: 4000,
      });
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
        <Input
            placeholder="Card Holder Name"
            value={meta.accountName}
            onChange={(e) => setMeta({ ...meta, accountName: e.target.value })}
            required
            />

        <Input
            placeholder="Bank Name (optional)"
            value={meta.bankName}
            onChange={(e) => setMeta({ ...meta, bankName: e.target.value })}
        />
      <div className="border rounded-md p-3 bg-background">
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: {
                fontSize: "16px",
              },
            },
          }}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>

        <Button
          onClick={saveCard}
          disabled={!stripe || loading}
          className="flex-1 bg-linear-to-r from-blue-600 to-purple-600"
        >
          {loading ? "Saving..." : "Save Card"}
        </Button>
      </div>
    </div>
  );
}
