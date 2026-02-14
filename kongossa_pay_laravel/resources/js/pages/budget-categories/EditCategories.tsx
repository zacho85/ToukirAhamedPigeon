import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BudgetCategory } from '@/types/forms';
import { useForm } from '@inertiajs/react';
import React from 'react';

const EditCategories = ({ category }: { category: BudgetCategory }) => {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        description: category.description,
        color: category.color,
        limit_amount: category.limit_amount,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        put(route('budget-categories.update', category.id));
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Budget Category</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter category name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            required
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
                            rows={4}
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
                        />
                        {errors.color && <p className="text-sm text-destructive">{errors.color}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="limit_amount">Limit Amount</Label>
                        <Input
                            id="limit_amount"
                            type="number"
                            placeholder="Enter limit amount"
                            value={data.limit_amount}
                            onChange={e => setData('limit_amount', e.target.value as any)}
                        />
                        {errors.limit_amount && <p className="text-sm text-destructive">{errors.limit_amount}</p>}
                    </div>
                    <Button type="submit" disabled={processing}>
                        Update Category
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default EditCategories;
