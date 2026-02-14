
import React, { useState, useEffect, useCallback } from "react";
// import { Transaction, User } from "@/api/entities";
import { getTransactions } from "@/api/transactions";
import { getCurrentUser } from "@/api/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownLeft, Search, Download, Filter } from "lucide-react";
import { format } from "date-fns";

export default function History() {
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        loadTransactionHistory();
    }, []);

    const applyFilters = useCallback(() => {
        let filtered = transactions;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(t => 
                t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.recipient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.sender_id?.toLowerCase().includes(searchTerm.toLowerCase())
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

    const loadTransactionHistory = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            
            const allTransactions = await getTransactions('-created_date', 100);
            setTransactions(allTransactions);
        } catch (error) {
            console.error("Error loading transaction history:", error);
        }
        setIsLoading(false);
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'send':
            case 'withdrawal':
                return <ArrowUpRight className="w-5 h-5 text-red-600" />;
            case 'receive':
            case 'deposit':
                return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
            default:
                return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const exportTransactions = () => {
        const csvContent = [
            ['Date', 'Type', 'Amount', 'Currency', 'Status', 'Description'],
            ...filteredTransactions.map(t => [
                format(new Date(t.created_date), 'yyyy-MM-dd HH:mm'),
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
            <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-64"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Transaction History</h1>
                    <p className="text-slate-600">Complete record of your financial activities</p>
                </div>
                <Button onClick={exportTransactions} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filter & Search</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="send">Send Money</SelectItem>
                                <SelectItem value="receive">Receive Money</SelectItem>
                                <SelectItem value="deposit">Deposits</SelectItem>
                                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
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
                                <Filter className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-500">No transactions found matching your criteria</p>
                            </div>
                        ) : (
                            filteredTransactions.map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                            {getTransactionIcon(transaction.type)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {transaction.description || `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction`}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-sm text-slate-500">
                                                    {format(new Date(transaction.created_date), 'MMM d, yyyy • HH:mm')}
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
                                                ? 'text-red-600' 
                                                : 'text-green-600'
                                        }`}>
                                            {transaction.type === 'send' || transaction.type === 'withdrawal' ? '-' : '+'}
                                            ${transaction.amount?.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-slate-500">
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
