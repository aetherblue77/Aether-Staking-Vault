"use client"

import * as React from "react"
import {
    RainbowKitProvider,
    darkTheme,
    getDefaultWallets,
    getDefaultConfig,
} from "@rainbow-me/rainbowkit"
import { trustWallet, ledgerWallet } from "@rainbow-me/rainbowkit/wallets"
import { sepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import "@rainbow-me/rainbowkit/styles.css"

const { wallets } = getDefaultWallets()

const config = getDefaultConfig({
    appName: "Aether Staking Vault",
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
    wallets: [
        ...wallets,
        {
            groupName: "Other",
            wallets: [trustWallet, ledgerWallet],
        },
    ],
    chains: [sepolia],
    ssr: true,
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
    const aetherTheme = darkTheme({
        accentColor: "#2563eb",
        accentColorForeground: "white",
        borderRadius: "medium",
        overlayBlur: "small",
    })

    aetherTheme.colors.modalBackground = "#0f172a" // Slate-900 (Dark Navy)
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={aetherTheme}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
