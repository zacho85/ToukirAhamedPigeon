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
      <Card className="rounded-xl sm:rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
            Recent Transactions
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/history" className="text-sm">
              View All
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
            No transactions yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl sm:rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
          Recent Transactions
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/history" className="text-sm">
            View All
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          {transactions.slice(0, 5).map((transaction) => {
            const isSend = transaction.type === "send";
            const recipientName = transaction.description?.split(" ")[2] ?? "User";

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSend ? "bg-red-100 dark:bg-red-900/30" : "bg-green-100 dark:bg-green-900/30"
                    }`}
                  >
                    <img
                      src={`https://avatar.vercel.sh/${transaction.recipient_id ?? "user"}.png`}
                      alt="Recipient"
                      className="w-full h-full rounded-full"
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-foreground text-sm sm:text-base">
                      {recipientName}
                    </p>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      {isSend ? "Money Transfer" : "Money Received"}
                    </p>
                  </div>
                </div>

                <p
                  className={`font-semibold text-sm sm:text-base ${
                    isSend ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
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