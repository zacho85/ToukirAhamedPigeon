import { useState, useEffect, useCallback } from "react";
// import { Transaction, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, ArrowDownLeft, Search, Download, Filter } from "lucide-react";
import { format } from "date-fns";
import { fetchTransactionHistory } from "@/modules/history/api";
import { formatDateTimeDisplay } from "@/lib/formatDate";

interface TransactionType {
  id: number;
  createdAt: string;   // ✅ correct
  type: string;
  amount: number;
  currency?: string;
  status: string;
  description?: string;
  senderId?: number;
  recipientId?: number;
}


export default function History() {
    const [transactions, setTransactions] = useState<TransactionType[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<TransactionType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // useEffect(() => {
    //     loadTransactionHistory();
    // }, []);

    useEffect(() => {
        loadTransactionHistory();
    }, [filterType, filterStatus]);

    const applyFilters = useCallback(() => {
        let filtered = transactions;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.recipientId?.toString().includes(searchTerm.toLowerCase()) ||
                t.senderId?.toString().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by type
        if (filterType !== "all") {
            filtered = filtered.filter(t => t.type === filterType);
        }

        // Filter by status
        if (filterStatus !== "all") {
            filtered = filtered.filter(t => t.status === filterStatus);
        }

        setFilteredTransactions(filtered);
    }, [transactions, searchTerm, filterType, filterStatus]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const normalizeType = (type: string) => {
        if (type === "wallet_topup") return "deposit";
        return type;
    };

    const loadTransactionHistory = async () => {
    try {
        setIsLoading(true);

        const res = await fetchTransactionHistory({
        search: searchTerm || undefined,
        type: filterType !== "all" ? filterType : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        page: 1,
        limit: 50,
        });

        const normalized = res.data.map((t: TransactionType) => ({
        ...t,
        type: normalizeType(t.type),
        }));

        setTransactions(normalized);
        setFilteredTransactions(normalized);
    } catch (err) {
        console.error(err);
    } finally {
        setIsLoading(false);
    }
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'send':
            case 'withdrawal':
                return <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />;
            case 'receive':
            case 'deposit':
                return <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />;
            default:
                return <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
        }
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

    const exportTransactions = () => {
        const csvContent = [
            ['Date', 'Type', 'Amount', 'Currency', 'Status', 'Description'],
            ...filteredTransactions.map(t => [
                formatDateTimeDisplay(t.createdAt),
                t.type,
                t.amount,
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
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full md:w-48 dark:bg-gray-700 dark:text-gray-100">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="send">Send Money</SelectItem>
                                <SelectItem value="receive">Receive Money</SelectItem>
                                <SelectItem value="deposit">Deposits</SelectItem>
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

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">
                        All Transactions
                        <Badge variant="outline" className="ml-2">
                            {filteredTransactions.length} results
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
                                            {getTransactionIcon(transaction.type)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-gray-100">
                                                {transaction.description || `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction`}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-sm text-slate-500 dark:text-gray-400">
                                                    {formatDateTimeDisplay(transaction.createdAt)}
                                                </p>
                                                <Badge className={getStatusColor(transaction.status)}>
                                                    {transaction.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-semibold ${
                                            transaction.type === 'send' || transaction.type === 'withdrawal'
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-green-600 dark:text-green-400'
                                        }`}>
                                            {transaction.type === 'send' || transaction.type === 'withdrawal' ? '-' : '+'}
                                            ${Number(transaction.amount || 0)?.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-gray-400">
                                            {transaction.currency || 'USD'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
