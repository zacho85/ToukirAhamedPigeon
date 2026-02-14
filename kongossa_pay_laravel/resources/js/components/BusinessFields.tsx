import { Building2, FileText, MapPin, Phone, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from './ui/textarea';

interface BusinessFieldsProps {
    userType?: string;
    errors?: Record<string, string>;
}

export default function BusinessFields({ userType, errors }: BusinessFieldsProps) {
    const [showBusinessFields, setShowBusinessFields] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        setShowBusinessFields(userType === 'business_merchant');
    }, [userType]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
    };

    if (!showBusinessFields) {
        return null;
    }

    return (
        <>
            <Separator className="my-8" />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Business Information</h3>
                </div>

                <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3 group">
                            <Label htmlFor="company_name" className="text-sm font-semibold text-foreground">Company Name</Label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="company_name"
                                    type="text"
                                    name="company_name"
                                    placeholder="Enter your company name"
                                    autoComplete="organization"
                                    className="pl-12 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
                                />
                            </div>
                            <InputError message={errors?.company_name} />
                        </div>

                        <div className="space-y-3 group">
                            <Label htmlFor="company_legal_form" className="text-sm font-semibold text-foreground">Legal Form</Label>
                            <Select name="company_legal_form">
                                <SelectTrigger className="h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg">
                                    <SelectValue placeholder="Select your company's legal form" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="llc">LLC (Limited Liability Company)</SelectItem>
                                    <SelectItem value="corporation">Corporation</SelectItem>
                                    <SelectItem value="partnership">Partnership</SelectItem>
                                    <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                                    <SelectItem value="non_profit">Non-Profit</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors?.company_legal_form} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3 group">
                            <Label htmlFor="manager_name" className="text-sm font-semibold text-foreground">Manager/Contact Person</Label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="manager_name"
                                    type="text"
                                    name="manager_name"
                                    placeholder="Enter manager or contact person name"
                                    autoComplete="name"
                                    className="pl-12 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
                                />
                            </div>
                            <InputError message={errors?.manager_name} />
                        </div>

                        <div className="space-y-3 group">
                            <Label htmlFor="company_phone" className="text-sm font-semibold text-foreground">Company Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="company_phone"
                                    type="tel"
                                    name="company_phone"
                                    placeholder="Enter company phone number"
                                    autoComplete="tel"
                                    className="pl-12 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
                                />
                            </div>
                            <InputError message={errors?.company_phone} />
                        </div>
                    </div>

                    <div className="space-y-3 group">
                        <Label htmlFor="company_address" className="text-sm font-semibold text-foreground">Company Address</Label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-4 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Textarea
                                id="company_address"
                                name="company_address"
                                placeholder="Enter complete company address"
                                rows={3}
                                className="pl-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
                            />
                        </div>
                        <InputError message={errors?.company_address} />
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3 group">
                            <Label htmlFor="legal_form_document" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Legal Form Document
                            </Label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <Input
                                        id="legal_form_document"
                                        type="file"
                                        name="legal_form_document"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                        className="h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                    />
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>• Accepted formats: PDF, JPG, JPEG, PNG</p>
                                    <p>• Maximum file size: 5MB</p>
                                    <p>• Upload your company's legal form document (Articles of Incorporation, Partnership Agreement, etc.)</p>
                                </div>
                                {selectedFile && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm text-green-800 font-medium">
                                            Selected: {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-green-600">
                                            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                )}
                            </div>
                            <InputError message={errors?.legal_form_document} />
                        </div>

                        <div className="space-y-3 group">
                            <Label htmlFor="business_description" className="text-sm font-semibold text-foreground">Business Description</Label>
                            <Textarea
                                id="business_description"
                                name="business_description"
                                placeholder="Describe your business activities and services"
                                rows={4}
                                className="border-2 focus:border-primary transition-all duration-200 rounded-lg"
                            />
                            <InputError message={errors?.business_description} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
