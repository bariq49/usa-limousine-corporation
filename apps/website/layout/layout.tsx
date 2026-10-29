'use client';

import { usePathname } from "next/navigation";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import Footer from "./footer/footer";
import Header from "./header/Header";

export default function DefaultLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isBookRidePage = pathname?.startsWith("/book-ride");

    return (
        <div
            className={cn(
                "flex min-h-screen flex-col",
                !isBookRidePage && "overflow-x-clip"
            )}
        >
            <Header />
            <main
                className={cn(
                    "relative w-full max-w-full",
                    !isBookRidePage && "overflow-x-clip",
                    isBookRidePage && "pt-16 md:pt-20"
                )}
                style={{
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {children}
            </main>
            <Footer />
        </div>
    );
}
