import { Head } from "@inertiajs/react";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Head title="KongossaPay - Complete Digital Payment Solution" />
            <meta name="description" content="Complete KongossaPay solution with digital wallet, merchant payments, remittance, and admin features. Accept payments with QR codes, manage transactions, and grow your business." />
            <body suppressHydrationWarning className="antialiased">
                {children}
            </body>
        </>
    );
}
