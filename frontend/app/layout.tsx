import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "@rainbow-me/rainbowkit/styles.css"
import { Providers } from "../src/components/Providers"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Aether Staking Vault",
    description: "DeFi Staking Protocol",
}

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>{children}
                    <Toaster position="top-right" theme="dark" richColors closeButton />
                </Providers>
            </body>
        </html>
    )
}
