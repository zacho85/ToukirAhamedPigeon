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
    if (!stripe || !elements) {
      dispatchShowToast({
        type: "danger",
        message: "Stripe not initialized. Please refresh the page.",
      });
      return;
    }

    setLoading(true);
    try {
      const { clientSecret } = await createSetupIntent();
      
      if (!clientSecret) {
        throw new Error("Failed to create setup intent");
      }

      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: meta.accountName || undefined,
          },
        },
      });

      if (result.error) {
        console.error("Setup confirmation error:", result.error);
        dispatchShowToast({
          type: "danger",
          message: result.error.message || "Failed to save card",
        });
        return;
      }

      if (!result.setupIntent?.payment_method) {
        throw new Error("Payment method not created");
      }

      const paymentMethodId = result.setupIntent.payment_method as string;

      await attachPaymentMethod(paymentMethodId, {
        accountName: meta.accountName,
        bankName: meta.bankName,
      });

      dispatchShowToast({
        type: "success",
        message: "Card saved successfully!",
      });
      
      onSuccess?.();
    } catch (err: any) {
      console.error("Save card error:", err);
      dispatchShowToast({
        type: "danger",
        message: err.message || "Failed to save card. Please try again.",
      });
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
                color: "#32325d",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
            },
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 order-2 sm:order-1"
        >
          Cancel
        </Button>

        <Button
          onClick={saveCard}
          disabled={!stripe || loading}
          className="flex-1 bg-linear-to-r from-blue-600 to-purple-600 order-1 sm:order-2"
        >
          {loading ? "Saving..." : "Save Card"}
        </Button>
      </div>
    </div>
  );
}