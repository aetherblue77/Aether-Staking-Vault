"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { useStaking } from "../hooks/useStaking"
import { parseEther, formatEther } from "viem"
import Image from "next/image"

export function StakingCard() {
    const [activeTab, setActiveTab] = useState("stake") // "stake" | "withdraw" | "claim"
    const [amount, setAmount] = useState("")

    const {
        approve,
        stake,
        withdraw,
        claimReward,
        isLoading,
        isConfirmed,
        userAllowance,
        realTimeBalance,
        realTimeStaked,
        realTimeEarned,
        rawBalance,
        rawStaked,
        rawEarned,
    } = useStaking()

    // Auto Reset When Transaction Success
    useEffect(() => {
        if (isConfirmed) {
            setAmount("")
        }

        if (activeTab === "withdraw") setActiveTab("stake")
    }, [isConfirmed])

    const needsApproval =
        activeTab === "stake" && amount
            ? parseEther(amount || "0") > userAllowance
            : false

    const handleMax = () => {
        if (isLoading) return // Block button when loading
        if (activeTab === "stake") {
            setAmount(formatEther(rawBalance))
        } else if (activeTab === "withdraw") {
            setAmount(formatEther(rawStaked))
        }
    }

    const handleAction = () => {
        if (activeTab === "stake") {
            if (needsApproval) {
                approve(amount)
            } else {
                stake(amount)
            }
        } else if (activeTab === "withdraw") {
            withdraw(amount)
        } else if (activeTab === "claim") {
            claimReward()
        }
    }

    const contentVariants: Variants = {
        hidden: { opacity: 0, y: 10, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3, ease: "easeOut" },
            scale: 0.98,
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: { duration: 0.2 },
            scale: 0.98,
        },
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
            className="relative z-20 mx-auto mt-8 w-full max-w-md overflow-hidden rounded-4xl border border-white/10 bg-gray-900/60 p-6 shadow-2xl backdrop-blur-2xl"
        >
            {/* --- 0. Ambient Glow (Background Effect) --- */}
            <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-2/3 w-3/4 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[90px]" />

            {/* --- 1. SLIDING TABS NAVIGATION --- */}
            <div className={`relative flex rounded-2xl border border-white/5 bg-black/40 p-1.5 mb-8`}>
                {["stake", "withdraw", "claim"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            if (isLoading) return // Block switch tab when loading
                            setActiveTab(tab)
                            setAmount("") // Reset Input when switch tab
                        }}
                        className={`relative z-10 flex-1 rounded-xl py-3 text-sm font-semibold capitalize transition-colors duration-300 ${
                            activeTab === tab
                                ? "text-white"
                                : "text-gray-400 hover:text-gray-200"
                        } ${isLoading ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                    >
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTabBg"
                                className="absolute inset-0 rounded-xl bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                }}
                            />
                        )}
                        <span className="relative z-10 tracking-wide">
                            {tab}
                        </span>
                    </button>
                ))}
            </div>

            {/* --- 2. DYNAMIC CONTENT AREA--- */}
            {/* AnimatePresence mode = "wait" make sure out animation finish before in animation */}
            <div className={`flex min-h-[260px] flex-col justify-center`}>
                <AnimatePresence mode="wait">
                    {/* MODE A: INPUT FORM (STAKE & WITHDRAW) */}
                    {activeTab !== "claim" ? (
                        <motion.div
                            key="input-section"
                            variants={contentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-4"
                        >
                            {/* HEADER INPUT: LEFT LABEL & RIGHT BALANCE */}
                            <div className="flex items-center justify-between px-1">
                                {/* LEFT LABEL */}
                                <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                                    Amount to {activeTab}
                                </span>
                                {/* RIGHT BALANCE */}
                                <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 shadow-[0_0_10px_rgba(59,130,246,0.1)] transition-all hover:bg-blue-500/20">
                                    {/* Wallet Icon */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-3.5 w-3.5 text-blue-400"
                                    >
                                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                                    </svg>

                                    {/* Balance Text */}
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <span className="font-medium text-gray-400">
                                            {activeTab === "stake"
                                                ? "Balance:"
                                                : "Staked:"}
                                        </span>
                                        <span className="font-bold text-white">
                                            {activeTab === "stake"
                                                ? realTimeBalance
                                                : realTimeStaked}
                                        </span>
                                        <span className="font-bold text-blue-400">
                                            AEB
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative">
                                <motion.input
                                    type="text"
                                    inputMode="decimal"
                                    value={amount}
                                    disabled={isLoading} // Disable input when loading
                                    onChange={(e) => {
                                        const value = e.target.value
                                        if (
                                            value === "" ||
                                            /^[0-9]+\.?[0-9]*$/.test(value)
                                        ) {
                                            setAmount(value)
                                        }
                                    }}
                                    placeholder="0.00"
                                    whileFocus={{
                                        scale: 1.02,
                                        borderColor: "rgba(59,130,246,0.5)",
                                    }}
                                    className={`w-full rounded-2xl border border-white/10 bg-black/30 py-5 pr-24 pl-5 text-3xl font-bold text-white transition-all placeholder:text-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:outline-none ${isLoading ? "cursor-not-allowed text-gray-500" : ""}`}
                                />
                                <motion.button
                                    whileHover={{
                                        scale: 1.1,
                                        textShadow:
                                            "0 0 8px rgba(59,130,246,0.8)", // Efek tulisan bersinar saat hover
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleMax}
                                    disabled={isLoading}
                                    className={`absolute top-1/2 right-6 -translate-y-1/2 text-xs font-bold tracking-widest text-blue-500 uppercase transition-colors hover:text-blue-400 ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                                >
                                    MAX
                                </motion.button>
                            </div>

                            {/* ESTIMATION AREA: Fund + Rewards */}
                            {activeTab === "withdraw" && amount && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-2 text-center text-xs text-green-400"
                                >
                                    <span>You will receive: </span>
                                    <span className="font-bold">
                                        {/* Counting: Funds + Rewards */}
                                        {new Intl.NumberFormat("en-US", {
                                            maximumFractionDigits: 6,
                                        }).format(
                                            parseFloat(amount || "0") +
                                                parseFloat(
                                                    formatEther(rawEarned),
                                                ),
                                        )}{" "}
                                        AEB
                                    </span>
                                    <span className="text-gray-500">
                                        {" "}
                                        (Funds + Rewards)
                                    </span>
                                </motion.div>
                            )}

                            {/* Info Fee & Approve Helper */}
                            <div className="text-center">
                                <p className="text-[10px] text-gray-500">
                                    {activeTab === "stake"
                                        ? "Staking locks your funds for 7 days"
                                        : "Withdrawals are processed instanly."}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        /* MODE B: REWARD DISPLAY (CLAIM) */
                        <motion.div
                            key="reward-section"
                            variants={contentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={`flex flex-col items-center justify-center gap-3 text-center transition-opacity duration-300 ${isLoading ? "opacity-60 pointer-events-none" : ""}`}
                        >
                                <div className="relative h-36 w-36">
                                    <Image
                                        src="/aeb-logo.png"
                                        alt="AEB Token Logo"
                                        fill
                                        className="object-contain drop-shadow-2xl relative h-36 w-36"
                                    />
                                </div>

                                <p className="text-sm font-medium tracking-widest text-gray-400 uppercase -mt-4 mb-2">
                                    Unclaimed Rewards
                                </p>

                                <motion.p
                                    initial={{
                                        scale: 0.5,
                                        filter: "blur(10px)",
                                    }}
                                    animate={{ scale: 1, filter: "blur(0px)" }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="text-5xl font-bold text-white drop-shadow-[0_0_25px_rgba(59,130,246,0.4)]"
                                >
                                    {realTimeEarned}{" "}
                                    <span className="text-2xl text-blue-400">
                                        AEB
                                    </span>
                                </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- 3. DYNAMIC ACTION BUTTON --- */}
            <motion.button
                whileHover={{
                    scale: 1.02,
                    boxShadow: "0 0 30px -5px rgba(37, 99, 235, 0.5)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAction}
                disabled={isLoading}
                className={`mt-6 w-full rounded-xl py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 ${
                    isLoading
                        ? "cursor-not-allowed bg-gray-700 opacity-70"
                        : activeTab === "withdraw"
                          ? "bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500"
                          : needsApproval
                            ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:shadow-orange-500/20"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/20"
                }`}
            >
                <AnimatePresence mode="wait">
                    <motion.span
                        key={isLoading ? "loading" : activeTab + needsApproval} // Animation button text key
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    width="24"
                                    height="24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Processing...
                            </>
                        ) : activeTab === "stake" ? (
                            needsApproval ? (
                                "Approve Token Access"
                            ) : (
                                "Stake Funds"
                            )
                        ) : activeTab === "withdraw" ? (
                            rawEarned > BigInt(0) ? (
                                "Withdraw & Claim Rewards"
                            ) : (
                                "Withdraw Funds"
                            )
                        ) : (
                            "Claim All Rewards"
                        )}
                    </motion.span>
                </AnimatePresence>
            </motion.button>
        </motion.div>
    )
}
