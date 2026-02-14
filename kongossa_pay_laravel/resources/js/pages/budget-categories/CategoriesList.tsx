import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { BudgetCategory } from "@/types/forms";
import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function CategoryList({ categories }: { categories: BudgetCategory[] }) {
    const breadcrumbs = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Budget Management' },
        { label: 'Budgets' },
    ];

    return (
        <div>
            <>
                <Head title='Category List' />
                {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
                <div className="space-y-6 mt-10">
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Budget Categories</h1>
                            <p className="text-muted-foreground">
                                Manage your spending limits and track your financial goals.
                            </p>
                        </div>
                        <Button asChild>
                            <Link href={route('budget-categories.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Category
                            </Link>
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead>Budget Limit</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="w-[70px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>{category.name}</TableCell>
                                        <TableCell>
                                            <span style={{ color: category.color }}>{category.color}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge>
                                                ${category.limit_amount}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {category.description}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button onClick={() => router.visit(route('budget-categories.edit', { budgetCategory: category.id }))
                                                }>Edit</Button>
                                                <Button onClick={() => router.delete(route('budget-categories.destroy', { budgetCategory: category.id }))} variant="ghost" className="text-red-600">
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </>
        </div>
    )
}