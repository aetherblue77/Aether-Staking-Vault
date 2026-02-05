"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { motion } from "framer-motion"
import { StakingStats } from "@/src/components/StakingStats"
import { StakingCard } from "@/src/components/StakingCard"

export default function Home() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-950 text-white selection:bg-blue-500 selection:text-white">
            {/* --- 1. Background Effects (Aether Glow) --- */}
            <div className="absolute top-0 left-0 z-0 h-full w-full overflow-hidden">
                {/* Blue Circle in the Top Left Corner */}
                <div className="absolute -top-[20%] -left-[10%] h-[70vw] w-[70vw] animate-pulse rounded-full bg-blue-600/20 blur-[120px]" />
                {/* Purple Circle in the Bottom Right Corner (to give it dimension) */}
                <div className="absolute -right-[10%] -bottom-[20%] h-[60vw] w-[60vw] rounded-full bg-indigo-600/10 blur-[100px]" />
            </div>

            {/* --- 2. Content Wrapper (Z-Index to be above the background) --- */}
            <div className="z-10 flex w-full max-w-5xl flex-col items-center gap-10 px-4 py-24 text-center">
                {/* Header Section */}
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-4"
                    >
                        <h1 className="text-6xl font-bold tracking-tight md:text-7xl">
                            Aether{" "}
                            <span className="text-blue-500 drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]">
                                Staking
                            </span>{" "}
                            Vault
                        </h1>
                    </motion.div>

                    {/* Subtitle with litle bit delay */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="mx-auto max-w-2xl text-xl text-gray-400"
                    >
                        Secure your assets in the ether. Stake{" "}
                        <span className="font-semibold text-blue-400">
                            $AEB
                        </span>{" "}
                        tokens and watch your rewards grow in real-time.
                    </motion.p>
                </div>

                {/* Connect button with bounce effect */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    >
                    <ConnectButton showBalance={false} />
                </motion.div>

                {/* STAKING CARD */}
                <div className="z-20 w-full">
                    <StakingCard />
                </div>

                {/* DYNAMIC STATS SECTION */}
                <div className="w-full max-w-4xl">
                    <StakingStats />
                </div>
            </div>
        </main>
    )
}
