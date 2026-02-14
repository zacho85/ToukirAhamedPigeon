import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Lock, Mail, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [emailOrPhone, setEmailOrPhone] = useState('');

    const isEmail = emailOrPhone.includes('@');
    const isPhone = /^\+?[\d\s\-\(\)]+$/.test(emailOrPhone.replace(/\s/g, ''));

    return (
        <AuthLayout title="Welcome back" description="Sign in to your Kongossa Pay account">
            <Head title="Log in" />

            <div className="w-full max-w-md mx-auto">
                <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
                    <CardHeader className="space-y-2 text-center pb-8">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {status && (
                            <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium text-center">
                                {status}
                            </div>
                        )}

                        <Form method="post" action={route('login')} resetOnSuccess={['password']} className="space-y-6">
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            Email or Phone Number
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                                {isEmail ? (
                                                    <Mail className="w-4 h-4" />
                                                ) : isPhone ? (
                                                    <Smartphone className="w-4 h-4" />
                                                ) : (
                                                    <Mail className="w-4 h-4" />
                                                )}
                                            </div>
                                            <Input
                                                id="email"
                                                type="text"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="email@example.com or +1234567890"
                                                className="pl-10 h-12 text-base"
                                                value={emailOrPhone}
                                                onChange={(e) => setEmailOrPhone(e.target.value)}
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-sm font-medium">
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={route('password.request')}
                                                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                                                    tabIndex={5}
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Enter your password"
                                                className="pl-10 pr-10 h-12 text-base"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Remember me for 30 days
                                        </Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                                        tabIndex={4}
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                                                Signing in...
                                            </>
                                        ) : (
                                            'Sign in'
                                        )}
                                    </Button>
                                </>
                            )}
                        </Form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <TextLink
                                href={route('register')}
                                className="text-primary hover:text-primary/80 font-medium transition-colors"
                                tabIndex={5}
                            >
                                Create an account
                            </TextLink>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center text-xs text-muted-foreground">
                    By signing in, you agree to our{' '}
                    <TextLink href="#" className="underline hover:text-foreground">
                        Terms of Service
                    </TextLink>{' '}
                    and{' '}
                    <TextLink href="#" className="underline hover:text-foreground">
                        Privacy Policy
                    </TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
