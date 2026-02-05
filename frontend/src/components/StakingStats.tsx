"use client"

import { useReadContract } from "wagmi"
import { formatEther } from "viem"
import { motion, Variants } from "framer-motion"
import { useContractData } from "../hooks/useContractData"

export function StakingStats() {
    const { stakingAddress, stakingAbi, isSupported } = useContractData()

    // Read Data from Blockchain (Total Staked)
    const { data: totalStaked, isLoading } = useReadContract({
        address: stakingAddress,
        abi: stakingAbi,
        functionName: "totalSupply", // In Vault, totalSupply = Total Staked Amount
        query: {
            enabled: isSupported, // Only run if network is supported
            refetchInterval: 5000, // Refetch every 5 seconds
        },
    })

    // Formating Number (Wei -> Ether)
    const formattedTotalStaked = totalStaked
        ? parseFloat(formatEther(totalStaked as bigint)).toFixed(2)
        : "0"

    // Animation Variable
    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" },
        },
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView={{opacity: 1, y: 0}}
            viewport={{
                once: true,
                amount: 0.3
            }}
            transition={{duration: 0.8, type: "spring", bounce: 0.4}}
            // GLASSMORPHISM STYLE + AETHER GLOW BORDER
            className="mt-12 grid grid-cols-1 gap-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_-10px_rgba(59,130,246,0.15)] backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_50px_-5px_rgba(59,130,246,0.3)] md:grid-cols-3"
        >
            {/* --- STAT 1: APY (Fixed for now) --- */}
            <StatItem label="APY" value="1,200%" isBlue={true} />

            {/* --- STAT 2: Total Staked --- */}
            <StatItem
                label="Total Value Locked"
                value={`${formattedTotalStaked} AEB`}
                isLoading={isLoading}
            />

            {/* --- STAT 3: Stakers (Dummy Data) */}
            <StatItem label="Active Stakers" value="Early Access" />
        </motion.div>
    )
}

// Sub-Component
function StatItem({ label, value, isBlue = false, isLoading = false }: any) {
    return (
        <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-sm font-medium tracking-wider text-gray-400 uppercase">
                {label}
            </span>

            {isLoading ? (
                // Skeleton Loading (pulse effect)
                <div className="h-8 w-24 animate-pulse rounded bg-white/10" />
            ) : (
                <span
                    className={`text-3xl font-bold ${isBlue ? "text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "text-white"}`}
                >
                    {value}
                </span>
            )}
        </div>
    )
}
