"use client"

import { formatEther } from "viem"
import { motion, Variants } from "framer-motion"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import { useReadContract } from "wagmi"
import { useContractData } from "@/src/hooks/useContractData"

// --- QUERY GRAPHQL ---
const GET_GLOBAL_STATS = gql`
    query GetStats {
        stakingStats(first: 1) {
            totalValueLocked
            totalActiveStakers
        }
    }
`

interface StakingStat {
    totalValueLocked: string
    totalActiveStakers: number
}

interface StakingStatsData {
    stakingStats: StakingStat[]
}

export function StakingStats() {
    // --- TAKE DATA FROM CONTRACT (Reward Rate) ---
    const { stakingAddress, stakingAbi } = useContractData()

    // Read Reward Rate from Smart Contract (Token per Second)
    const { data: rewardRate } = useReadContract({
        address: stakingAddress,
        abi: stakingAbi,
        functionName: "s_rewardRate",
        query: {
            refetchInterval: 10000,
        },
    })

    // --- TAKE DATA FROM GRAPHQL (TVL & Active Stakers) ---
    const { loading, error, data } = useQuery<StakingStatsData>(
        GET_GLOBAL_STATS,
        {
            pollInterval: 5000,
            fetchPolicy: "cache-and-network", // Always check new data
        },
    )
    const isLoadingInitial = loading && !data
    // DATA PROCESSING
    const stats = data?.stakingStats?.[0]

    // --- MATEMATIC LOGIC FOR APY ---
    // 1. Take TVL (Wei/BigInt)
    const tvlWei = stats?.totalValueLocked
        ? BigInt(stats.totalValueLocked)
        : BigInt(0)
    // 2. Take Reward Rate (Wei/BigInt)
    const rateWei = rewardRate ? BigInt(rewardRate as bigint) : BigInt(0)
    // 3. Calculate Reward Per Year (Rate * Second at Year)
    // 365 Days * 24 Hours * 60 Minutes * 60 Seconds = 31,536,000 Seconds
    const SECONDS_IN_YEAR = 31536000
    const annualRewardWei = rateWei * BigInt(SECONDS_IN_YEAR)
    // 4. Calculate APY
    let apyDisplay = "0.00" // Default Value
    if (tvlWei > BigInt(0)) {
        // Formula: (Reward Yearly * 10000) / TVL
        const apyBigInt = (annualRewardWei * BigInt(10000)) / tvlWei
        const apyNum = Number(apyBigInt) / 100

        // FORMAT 1: COMMAS FOR THOUSAND
        apyDisplay = apyNum.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    // FORMAT 2: FORMAT TVL (Million, Billion, Trillion)
    const tvlNum = parseFloat(formatEther(tvlWei))
    let tvlDisplay = "0.00"

    if (tvlNum >= 1_000_000_000_000) {
        tvlDisplay = (tvlNum / 1_000_000_000_000).toFixed(2) + "T" // Trillion
    } else if (tvlNum >= 1_000_000_000) {
        tvlDisplay = (tvlNum / 1_000_000_000).toFixed(2) + "B" // Billion
    } else if (tvlNum >= 1_000_000) {
        tvlDisplay = (tvlNum / 1_000_000).toFixed(2) + "M" // Million
    } else {
        tvlDisplay = tvlNum.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    // Parsing Active Stakers
    const activeStakers = stats?.totalActiveStakers ?? 0

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
            whileInView="visible"
            viewport={{
                once: true,
                amount: 0.3,
            }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            // GLASSMORPHISM STYLE + AETHER GLOW BORDER
            className="mt-12 grid grid-cols-1 gap-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_-10px_rgba(59,130,246,0.15)] backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_50px_-5px_rgba(59,130,246,0.3)] md:grid-cols-3"
        >
            {/* --- STAT 1: APY (Fixed for now) --- */}
            <StatItem
                label="APY"
                value={`${apyDisplay}%`}
                isBlue={true}
                isLoading={isLoadingInitial}
            />

            {/* --- STAT 2: Total Staked --- */}
            <StatItem
                label="Total Value Locked"
                value={`${tvlDisplay} AEB`}
                isLoading={isLoadingInitial}
            />

            {/* --- STAT 3: Stakers */}
            <StatItem
                label="Active Stakers"
                value={`${activeStakers} Users`}
                isLoading={isLoadingInitial}
            />
        </motion.div>
    )
}

// Sub-Component
function StatItem({
    label,
    value,
    isBlue = false,
    isLoading = false,
}: {
    label: string
    value: string
    isBlue?: boolean
    isLoading?: boolean
}) {
    return (
        <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-sm font-medium tracking-wider text-gray-400 uppercase">
                {label}
            </span>

            {isLoading ? (
                // Skeleton Loading (pulse effect)
                <div className="h-8 w-24 animate-pulse rounded bg-white/10" />
            ) : (
                <motion.span
                    key={value}
                    initial={{ opacity: 0.5, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`text-3xl font-bold ${
                        isBlue
                            ? "text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            : "text-white"
                    }`}
                >
                    {value}
                </motion.span>
            )}
        </div>
    )
}
