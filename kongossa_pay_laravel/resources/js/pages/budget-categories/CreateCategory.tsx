import { Breadcrumbs, useToast } from "@/components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Budget } from "@/types/forms";
import { Head, useForm } from '@inertiajs/react';


interface Props {
    budgets: Budget[];
}

export default function CreateCategory({ budgets }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        budget_id: '',
        name: '',
        description: '',
        type: 'expense',
        color: '#000000',
        limit_amount: ''
    });

    const { toast } = useToast()
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('budget-categories.store'), {
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Budget category created successfully.',
                });
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to create budget category.',
                });
            }
        });
    };


    const breadcrumbs = [
        { label: 'Home', url: '/' },
        { label: 'Budget Categories', url: '/budget-categories' },
        { label: 'Create', url: '/budget-categories/create' }
    ];

    return (
        <>
            <Head title='Create New Category' />
            {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
            <Card className="max-w-2xl mx-auto mt-10">
                <CardHeader>
                    <CardTitle>Create Budget Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="budget_id">Budget</Label>
                            <Select value={data.budget_id} onValueChange={value => setData('budget_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select budget" />
                                </SelectTrigger>
                                <SelectContent>
                                    {budgets.map((budget) => (
                                        <SelectItem key={budget.id} value={String(budget.id)}>
                                            {budget.name}
                                            <span>{budget.total_amount}$</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.budget_id && <p className="text-sm text-destructive">{errors.budget_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter category name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                className="w-full border border-gray-300 rounded-md p-2 outline-0"
                                id="description"
                                placeholder="Enter category description"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                            ></textarea>
                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color">Color</Label>
                            <Input
                                id="color"
                                type="color"
                                value={data.color}
                                onChange={e => setData('color', e.target.value)}
                                className="h-10"
                            />
                            {errors.color && <p className="text-sm text-destructive">{errors.color}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="limit_amount">Limit Amount</Label>
                            <Input
                                id="limit_amount"
                                type="number"
                                step="0.01"
                                placeholder="Enter limit amount"
                                value={data.limit_amount}
                                onChange={e => setData('limit_amount', e.target.value)}
                            />
                            {errors.limit_amount && <p className="text-sm text-destructive">{errors.limit_amount}</p>}
                        </div>

                        <Button type="submit" disabled={processing}>
                            Create Category
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}
