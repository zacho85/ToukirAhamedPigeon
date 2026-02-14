import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CompleteQRPaymentDialog from "./CompleteQRPaymentDialog";

export default function PendingQRPaymentCard({ qr, onCompleted }: any) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{qr.recipient.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {qr.amount ? `$${qr.amount}` : "Flexible Amount"}
            </p>
          </div>

          <Button onClick={() => setOpen(true)}>
            Pay Now
          </Button>
        </CardContent>
      </Card>

      <CompleteQRPaymentDialog
        open={open}
        onClose={() => setOpen(false)}
        qr={qr}
        onSuccess={onCompleted}
      />
    </>
  );
}
