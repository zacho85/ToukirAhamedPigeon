import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export type TransactionType = "send" | "receive";

export interface Transaction {
  id: string | number;
  type: TransactionType;
  amount: number;
  description?: string;
  recipient_id?: string | number;
  created_at?: string;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions = [],
}) => {

  if (transactions.length === 0) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Recent Transactions
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/history">
              View All
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          <div className="text-center py-8 text-slate-500">
            No transactions yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          Recent Transactions
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/history">
            View All
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {transactions.slice(0, 3).map((transaction) => {
            const isSend = transaction.type === "send";
            const recipientName =
              transaction.description?.split(" ")[2] ?? "Zayn Malik";

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSend ? "bg-red-100" : "bg-green-100"
                    }`}
                  >
                    <img
                      src={`https://avatar.vercel.sh/${transaction.recipient_id ?? "user"}.png`}
                      alt="Recipient"
                      className="w-full h-full rounded-full"
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      {recipientName}
                    </p>
                    <p className="text-slate-500 text-sm">
                      {isSend
                        ? "Money Transfer"
                        : "Money Received"}
                    </p>
                  </div>
                </div>

                <p
                  className={`font-semibold ${
                    isSend ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {isSend ? "-" : "+"}${transaction.amount.toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
