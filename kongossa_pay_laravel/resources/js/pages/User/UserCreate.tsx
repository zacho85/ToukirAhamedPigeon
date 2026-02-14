import { Breadcrumbs } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Role } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Building2, FileText, LoaderCircle, User as UserIcon } from 'lucide-react';
import { useState } from 'react';

interface UserCreateProps {
    roles: Role[];
}

export default function UserCreate({ roles }: UserCreateProps) {
    const [userType, setUserType] = useState('personal');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        user_type: 'personal',
        password: '',
        password_confirmation: '',
        status: 'active',
        role_id: '2',

        // Business fields
        company_name: '',
        company_legal_form: '',
        manager_name: '',
        company_phone: '',
        company_address: '',
        business_description: '',
        legal_form_document: null as File | null,
    });

    const breadcrumbs = [
        { label: 'Users', href: route('users.index') },
        { label: 'Create User' },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
        setData('legal_form_document', file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    const isBusinessUser = userType === 'business_merchant';

    return (
        <>
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <Head title="Create User" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New User</CardTitle>
                            <CardDescription>
                                Add a new user to the system
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className={errors.name ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={errors.email ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone *</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className={errors.phone ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="user_type">User Type *</Label>
                                            <Select
                                                value={data.user_type}
                                                onValueChange={(value) => {
                                                    setData('user_type', value);
                                                    setUserType(value);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select user type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="personal">
                                                        <div className="flex items-center gap-2">
                                                            <UserIcon className="w-4 h-4" />
                                                            Personal
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="business_merchant">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="w-4 h-4" />
                                                            Business
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.user_type && <p className="text-sm text-red-500">{errors.user_type}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select
                                                value={data.status}
                                                onValueChange={(value) => setData('status', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="role_id">Role</Label>
                                            <Select
                                                value={data.role_id}
                                                onValueChange={(value) => setData('role_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role.id} value={role.id.toString()}>
                                                            {role.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.role_id && <p className="text-sm text-red-500">{errors.role_id}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Password Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Password</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password *</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className={errors.password ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className={errors.password_confirmation ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Business Information */}
                                {isBusinessUser && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium flex items-center gap-2">
                                            <Building2 className="w-5 h-5" />
                                            Business Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="company_name">Company Name *</Label>
                                                <Input
                                                    id="company_name"
                                                    type="text"
                                                    value={data.company_name}
                                                    onChange={(e) => setData('company_name', e.target.value)}
                                                    className={errors.company_name ? 'border-red-500' : ''}
                                                    required={isBusinessUser}
                                                />
                                                {errors.company_name && <p className="text-sm text-red-500">{errors.company_name}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="company_legal_form">Legal Form *</Label>
                                                <Input
                                                    id="company_legal_form"
                                                    type="text"
                                                    value={data.company_legal_form}
                                                    onChange={(e) => setData('company_legal_form', e.target.value)}
                                                    className={errors.company_legal_form ? 'border-red-500' : ''}
                                                    required={isBusinessUser}
                                                />
                                                {errors.company_legal_form && <p className="text-sm text-red-500">{errors.company_legal_form}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="manager_name">Manager Name *</Label>
                                                <Input
                                                    id="manager_name"
                                                    type="text"
                                                    value={data.manager_name}
                                                    onChange={(e) => setData('manager_name', e.target.value)}
                                                    className={errors.manager_name ? 'border-red-500' : ''}
                                                    required={isBusinessUser}
                                                />
                                                {errors.manager_name && <p className="text-sm text-red-500">{errors.manager_name}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="company_phone">Company Phone *</Label>
                                                <Input
                                                    id="company_phone"
                                                    type="tel"
                                                    value={data.company_phone}
                                                    onChange={(e) => setData('company_phone', e.target.value)}
                                                    className={errors.company_phone ? 'border-red-500' : ''}
                                                    required={isBusinessUser}
                                                />
                                                {errors.company_phone && <p className="text-sm text-red-500">{errors.company_phone}</p>}
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="company_address">Company Address *</Label>
                                                <Textarea
                                                    id="company_address"
                                                    value={data.company_address}
                                                    onChange={(e) => setData('company_address', e.target.value)}
                                                    className={errors.company_address ? 'border-red-500' : ''}
                                                    rows={3}
                                                    required={isBusinessUser}
                                                />
                                                {errors.company_address && <p className="text-sm text-red-500">{errors.company_address}</p>}
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="business_description">Business Description *</Label>
                                                <Textarea
                                                    id="business_description"
                                                    value={data.business_description}
                                                    onChange={(e) => setData('business_description', e.target.value)}
                                                    className={errors.business_description ? 'border-red-500' : ''}
                                                    rows={3}
                                                    required={isBusinessUser}
                                                />
                                                {errors.business_description && <p className="text-sm text-red-500">{errors.business_description}</p>}
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="legal_form_document" className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    Legal Form Document *
                                                </Label>
                                                <Input
                                                    id="legal_form_document"
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={handleFileChange}
                                                    className={errors.legal_form_document ? 'border-red-500' : ''}
                                                    required={isBusinessUser}
                                                />
                                                <p className="text-xs text-gray-500">
                                                    Accepted formats: PDF, JPG, JPEG, PNG (max 5MB)
                                                </p>
                                                {selectedFile && (
                                                    <p className="text-sm text-green-600">
                                                        Selected: {selectedFile.name}
                                                    </p>
                                                )}
                                                {errors.legal_form_document && <p className="text-sm text-red-500">{errors.legal_form_document}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-4 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {processing && <LoaderCircle className="w-4 h-4 animate-spin mr-2" />}
                                        Create User
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
