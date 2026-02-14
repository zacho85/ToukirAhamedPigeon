import { Form, Head } from '@inertiajs/react';
import { Building2, Eye, EyeOff, LoaderCircle, Lock, Mail, Phone, User } from 'lucide-react';
import { useState } from 'react';

import BusinessFields from '@/components/BusinessFields';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const [userType, setUserType] = useState('personal');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <AuthLayout title="Create an account" description="Join Kongossa Pay and start managing your finances">
            <Head title="Register" />
            <div className="w-full mx-auto">
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div className="text-center space-y-2">
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                    Create your account
                                </CardTitle>
                                <CardDescription className="text-base text-muted-foreground max-w-md">
                                    Choose your account type and fill in your details to get started with Kongossa Pay
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="post"
                            action={route('register')}
                            resetOnSuccess={['password', 'password_confirmation']}
                            disableWhileProcessing
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Hidden input to ensure userType is submitted */}
                                    <input type="hidden" name="user_type" value={userType} />

                                    {/* Account Type Selection */}
                                    <div className="space-y-4 mt-5">
                                        <div className="text-center">
                                            <Label className="text-lg font-semibold text-foreground">Choose Account Type</Label>
                                            <p className="text-sm text-muted-foreground mt-1">Select the type of account that best fits your needs</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setUserType('personal')}
                                                className={`group relative flex items-center justify-center p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${userType === 'personal'
                                                    ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 text-primary shadow-lg shadow-primary/20'
                                                    : 'border-border hover:border-primary/50 bg-card hover:bg-muted/50'
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center space-y-3">
                                                    <div className={`p-3 rounded-full transition-colors duration-300 ${userType === 'personal'
                                                        ? 'bg-primary/20'
                                                        : 'bg-muted group-hover:bg-primary/10'}`}>
                                                        <User className="h-6 w-6" />
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="font-semibold text-base">Personal</span>
                                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                            For individual use and personal finance management
                                                        </p>
                                                    </div>
                                                </div>
                                                {userType === 'personal' && (
                                                    <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUserType('business_merchant')}
                                                className={`group relative flex items-center justify-center p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${userType === 'business_merchant'
                                                    ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 text-primary shadow-lg shadow-primary/20'
                                                    : 'border-border hover:border-primary/50 bg-card hover:bg-muted/50'
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center space-y-3">
                                                    <div className={`p-3 rounded-full transition-colors duration-300 ${userType === 'business_merchant'
                                                        ? 'bg-primary/20'
                                                        : 'bg-muted group-hover:bg-primary/10'}`}>
                                                        <Building2 className="h-6 w-6" />
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="font-semibold text-base">Business</span>
                                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                            For companies, merchants & business operations
                                                        </p>
                                                    </div>
                                                </div>
                                                {userType === 'business_merchant' && (
                                                    <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.user_type} />
                                    </div>

                                    <Separator className="my-8" />

                                    {/* Personal Information */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-foreground">Personal Information</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3 group">
                                                <Label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        required
                                                        autoFocus
                                                        autoComplete="name"
                                                        name="name"
                                                        placeholder="Enter your full name"
                                                        className="pl-12 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
                                                    />
                                                </div>
                                                <InputError message={errors.name} />
                                            </div>

                                            <div className="space-y-3 group">
                                                <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email Address</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        required
                                                        autoComplete="email"
                                                        name="email"
                                                        placeholder="Enter your email address"
                                                        className="pl-12 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
                                                    />
                                                </div>
                                                <InputError message={errors.email} />
                                            </div>

                                            <div className="space-y-3 group md:col-span-2">
                                                <Label htmlFor="phone" className="text-sm font-semibold text-foreground">Phone Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        required
                                                        autoComplete="tel"
                                                        name="phone"
                                                        placeholder="Enter your phone number"
                                                        className="pl-12 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
                                                    />
                                                </div>
                                                <InputError message={errors.phone} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business/Merchant Fields (conditionally rendered) */}
                                    <BusinessFields userType={userType} errors={errors} />

                                    <Separator className="my-8" />

                                    {/* Security */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <Lock className="h-5 w-5 text-primary" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-foreground">Security</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3 group">
                                                <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? "text" : "password"}
                                                        required
                                                        autoComplete="new-password"
                                                        name="password"
                                                        placeholder="Create a strong password"
                                                        className="pl-12 pr-12 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                <InputError message={errors.password} />
                                            </div>

                                            <div className="space-y-3 group">
                                                <Label htmlFor="password_confirmation" className="text-sm font-semibold text-foreground">Confirm Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="password_confirmation"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        required
                                                        autoComplete="new-password"
                                                        name="password_confirmation"
                                                        placeholder="Confirm your password"
                                                        className="pl-12 pr-12 h-12 border-2 focus:border-primary transition-all duration-200 rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                <InputError message={errors.password_confirmation} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <Button
                                            type="submit"
                                            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <>
                                                    <LoaderCircle className="h-5 w-5 animate-spin mr-3" />
                                                    Creating your account...
                                                </>
                                            ) : (
                                                <>
                                                    <User className="h-5 w-5 mr-2" />
                                                    Create Account
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>

                        <div className="mt-8 text-center p-6 bg-muted/30 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <TextLink href={route('login')} className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                    Sign in here
                                </TextLink>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
