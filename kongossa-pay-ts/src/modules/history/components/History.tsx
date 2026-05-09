import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, ArrowDownLeft, Search, Download, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { fetchTransactionHistory } from "@/modules/history/api";
import { formatDateTimeDisplay } from "@/lib/formatDate";
import { useAppSelector } from "@/hooks/useRedux";

interface TransactionType {
  id: number;
  createdAt: string;
  type: string;
  amount: number;
  currency?: string;
  status: string;
  description?: string;
  senderId?: number;
  recipientId?: number;
  senderName?: string;
  recipientName?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function History() {
    const { user: currentUser } = useAppSelector((state) => state.auth);
    const currentUserId = currentUser?.id;

    const [transactions, setTransactions] = useState<TransactionType[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<TransactionType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [pagination, setPagination] = useState<PaginationMeta>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
    });

    // Load transaction history with pagination
    const loadTransactionHistory = async (page = 1) => {
        try {
            setIsLoading(true);
            const res = await fetchTransactionHistory({
                search: searchTerm || undefined,
                type: filterType !== "all" ? filterType : undefined,
                status: filterStatus !== "all" ? filterStatus : undefined,
                page,
                limit: 20,
            });

            setTransactions(res.data);
            setFilteredTransactions(res.data);
            setPagination({
                total: res.meta.total,
                page: res.meta.page,
                limit: res.meta.limit,
                totalPages: res.meta.totalPages,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTransactionHistory(1);
    }, [filterType, filterStatus]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            loadTransactionHistory(newPage);
        }
    };

    const handleSearch = () => {
        loadTransactionHistory(1);
    };

    const getTransactionDirection = (transaction: TransactionType): 'sent' | 'received' | 'unknown' => {
        // For wallet_topup, always treat as received (positive amount)
        if (transaction.type === 'deposit' || transaction.type === 'wallet_topup') {
            return 'received';
        }
        // For payment_link: if current user is recipient, show as received
        if (transaction.type === 'payment_link') {
            if (transaction.recipientId === currentUserId) {
                return 'received';
            }
            return 'unknown';
        }
        // For wallet_transfer, check sender/recipient
        if (transaction.senderId === currentUserId) {
            return 'sent';
        }
        if (transaction.recipientId === currentUserId) {
            return 'received';
        }
        return 'unknown';
    };

    const getTransactionIcon = (transaction: TransactionType) => {
        const direction = getTransactionDirection(transaction);
        
        if (direction === 'sent') {
            return <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />;
        }
        if (direction === 'received') {
            return <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />;
        }
        if (transaction.type === 'deposit' || transaction.type === 'wallet_topup') {
            return <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />;
        }
        return <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    };

    const getFormattedAmount = (transaction: TransactionType) => {
        const amount = Number(transaction.amount || 0).toFixed(2);
        
        // For top-ups, always show positive
        if (transaction.type === 'deposit' || transaction.type === 'wallet_topup') {
            return `+$${amount}`;
        }
        
        // For payment links where user is recipient
        if (transaction.type === 'payment_link' && transaction.recipientId === currentUserId) {
            return `+$${amount}`;
        }
        
        const direction = getTransactionDirection(transaction);
        if (direction === 'sent') {
            return `-$${amount}`;
        }
        if (direction === 'received') {
            return `+$${amount}`;
        }
        return `$${amount}`;
    };

    const getAmountColorClass = (transaction: TransactionType) => {
        if (transaction.type === 'deposit' || transaction.type === 'wallet_topup') {
            return 'text-green-600 dark:text-green-400';
        }
        if (transaction.type === 'payment_link' && transaction.recipientId === currentUserId) {
            return 'text-green-600 dark:text-green-400';
        }
        const direction = getTransactionDirection(transaction);
        if (direction === 'sent') {
            return 'text-red-600 dark:text-red-400';
        }
        return 'text-green-600 dark:text-green-400';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400';
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getTransactionTitle = (transaction: TransactionType) => {
        // Handle top-ups
        if (transaction.type === 'deposit' || transaction.type === 'wallet_topup') {
            return 'Wallet Top Up';
        }
        
        // Handle payouts/withdrawals
        if (transaction.type === 'withdrawal' || transaction.type === 'wallet_payout') {
            return 'Withdrawal';
        }
        
        // Handle payment links
        if (transaction.type === 'payment_link') {
            const direction = getTransactionDirection(transaction);
            if (direction === 'received') {
                return 'Payment Received via Link';
            }
            return 'Payment Link Transaction';
        }
        
        // Handle transfers
        const direction = getTransactionDirection(transaction);
        if (direction === 'sent') {
            const recipientName = transaction.recipientName || `User ${transaction.recipientId}`;
            return `Sent to ${recipientName}`;
        }
        if (direction === 'received') {
            const senderName = transaction.senderName || `User ${transaction.senderId}`;
            return `Received from ${senderName}`;
        }
        
        return transaction.description || `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction`;
    };

    const exportTransactions = () => {
        const csvContent = [
            ['Date', 'Type', 'Amount', 'Currency', 'Status', 'Description'],
            ...transactions.map(t => [
                formatDateTimeDisplay(t.createdAt),
                t.type,
                getFormattedAmount(t).replace('$', ''),
                t.currency || 'USD',
                t.status,
                t.description || ''
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6 bg-slate-50 dark:bg-gray-900 min-h-screen">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-slate-50 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-gray-100">Transaction History</h1>
                    <p className="text-slate-600 dark:text-gray-300">Complete record of your financial activities</p>
                </div>
                <Button onClick={exportTransactions} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Filter Section */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">Filter & Search</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-400" />
                            <Input
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                            />
                            <Button 
                                onClick={handleSearch}
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
                                size="sm"
                            >
                                Go
                            </Button>
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full md:w-48 dark:bg-gray-700 dark:text-gray-100">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="topup">Top Up / Deposit</SelectItem>
                                <SelectItem value="sent">Send Money</SelectItem>
                                <SelectItem value="received">Received Money</SelectItem>
                                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full md:w-48 dark:bg-gray-700 dark:text-gray-100">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions List */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">
                        All Transactions
                        <Badge variant="outline" className="ml-2">
                            {pagination.total} results
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredTransactions.length === 0 ? (
                            <div className="text-center py-12">
                                <Filter className="w-12 h-12 text-slate-400 dark:text-gray-400 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-gray-300">No transactions found matching your criteria</p>
                            </div>
                        ) : (
                            filteredTransactions.map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                            {getTransactionIcon(transaction)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-gray-100">
                                                {getTransactionTitle(transaction)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-sm text-slate-500 dark:text-gray-400">
                                                    {formatDateTimeDisplay(transaction.createdAt)}
                                                </p>
                                                <Badge className={getStatusColor(transaction.status)}>
                                                    {transaction.status}
                                                </Badge>
                                            </div>
                                            {transaction.description && (
                                                <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                                                    {transaction.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-semibold ${getAmountColorClass(transaction)}`}>
                                            {getFormattedAmount(transaction)}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-gray-400">
                                            {transaction.currency || 'USD'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>
                            <span className="text-sm text-slate-600 dark:text-gray-400">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}