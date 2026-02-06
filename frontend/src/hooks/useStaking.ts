import {
    useWriteContract,
    useWaitForTransactionReceipt,
    useAccount,
    useReadContract,
} from "wagmi"
import { parseEther, maxUint256, formatEther } from "viem"
import { useContractData } from "./useContractData"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

export function useStaking() {
    const { address } = useAccount()
    const { stakingAddress, stakingAbi, tokenAddress, tokenAbi } =
        useContractData()
    const queryClient = useQueryClient()

    const [txType, setTxType] = useState<
        "approve" | "stake" | "withdraw" | "claim" | null
    >(null)

    // --- READ DATA SECTION ---
    // 1. Check Allowance
    const { data: allowance } = useReadContract({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: "allowance",
        args: address && stakingAddress ? [address, stakingAddress] : undefined,
        query: {
            enabled: !!address && !!stakingAddress,
        },
    })

    // 2. Check Wallet Balance
    const { data: balanceData } = useReadContract({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    })

    // 3. Check Staked Balance
    const { data: stakedData } = useReadContract({
        address: stakingAddress,
        abi: stakingAbi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    })

    // 4. Check Reward Balance (Earned)
    const { data: earnedData } = useReadContract({
        address: stakingAddress,
        abi: stakingAbi,
        functionName: "earned",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: 10000,
        },
    })

    // --- HELPER: Formating Number ---
    const formatValue = (value: bigint | undefined) => {
        if (!value) return "0"

        try {
            const rawValue = formatEther(value)
            const numberValue = parseFloat(rawValue)

            if (isNaN(numberValue)) return "0"
            if (numberValue === 0) return "0"

            return new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: numberValue < 1 ? 4 : 2,
            }).format(numberValue)
        } catch (error) {
            console.warn("Format error:", error)
            return "0"
        }
    }

    // 2. Setup Hook Write (For send transaction)
    const {
        data: hash,
        error: writeError,
        isPending: isWritePending,
        writeContract,
    } = useWriteContract()

    // 3. Setup Hook Wait (For wait transaction mined)
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash })

    // --- FUNCTION 1: APPROVE TOKEN (INFINITE APPROVE) ---
    const approve = (amount: string) => {
        if (!address) {
            toast.error("Please connect your wallet first!")
            return
        }

        if (!tokenAddress) {
            toast.warning("Token address not found!")
            return
        }

        // remove commas before processing
        const cleanAmount = (amount || "0").replace(/,/g, "")
        const value = parseEther(cleanAmount)

        const currentBalance = (balanceData as bigint) || BigInt(0)
        if (value > currentBalance) {
            toast.error("Insufficient wallet balance!")
            return
        }

        toast.info("Enabling AEB Token access for staking.")

        setTxType("approve")
        writeContract({
            address: tokenAddress,
            abi: tokenAbi,
            functionName: "approve",
            args: [stakingAddress, maxUint256],
        })
    }

    // --- FUNCTION 2: STAKE (Deposit) ---
    const stake = (amount: string) => {
        if (!address) {
            toast.error("Please connect your wallet first!")
            return
        }
        if (!amount || !stakingAddress) {
            toast.warning("Please enter an amount first!")
            return
        }

        // remove commas before processing
        const cleanAmount = (amount || "0").replace(/,/g, "")
        const value = parseEther(cleanAmount)

        if (value <= BigInt(0)) {
            toast.warning("Amount must be greater than 0!")
            return
        }

        const currentBalance = (balanceData as bigint) || BigInt(0)
        if (value > currentBalance) {
            toast.error("Insufficient wallet balance!")
            return
        }

        toast.info("Please confirm transaction in your wallet.")

        setTxType("stake")
        writeContract({
            address: stakingAddress,
            abi: stakingAbi,
            functionName: "stake",
            args: [parseEther(amount)],
        })
    }

    // --- FUNCTION 3: WITHDRAW ---
    const withdraw = (amount: string) => {
        if (!address) {
            toast.error("Please connect your wallet first!")
            return
        }
        if (!amount || !stakingAddress) {
            toast.warning("Please enter an amount first!")
            return
        }

        // remove commas before processing
        const cleanAmount = (amount || "0").replace(/,/g, "")
        const value = parseEther(cleanAmount)

        if (value <= BigInt(0)) {
            toast.warning("Amount must be greater than 0!")
            return
        }

        const currentStaked = (stakedData as bigint) || BigInt(0)
        if (value > currentStaked) {
            toast.error("Insufficient staked balance!")
            return
        }

        // Check if there are any rewards to be claimed?
        const currentReward = (earnedData as bigint) || BigInt(0)
        if (currentReward > BigInt(0)) {
            toast.info(`Withdrawing ${amount} AEB + Claiming Rewards! 🚀`)
        } else {
            // Standard Message if Reward = 0
            toast.info("Please confirm transaction in your wallet.")
        }

        setTxType("withdraw")
        writeContract({
            address: stakingAddress,
            abi: stakingAbi,
            functionName: "withdraw",
            args: [value],
        })
    }

    // --- FUNCTION 4: CLAIM REWARD (Get Yield) ---
    const claimReward = () => {
        if (!address) {
            toast.error("Please connect your wallet first!")
            return
        }
        if (!stakingAddress) return

        const rewardAmount = (earnedData as bigint) || BigInt(0)
        if (rewardAmount <= BigInt(0)) {
            toast.warning("You have 0 rewards to claim!")
            return
        }

        toast.info("Please confirm transaction in your wallet.")

        setTxType("claim")
        writeContract({
            address: stakingAddress,
            abi: stakingAbi,
            functionName: "claimReward",
        })
    }

    // --- Monitoring Transaction Status ---
    // 1. Wait for mining (Loading)
    useEffect(() => {
        if (isConfirming) {
            toast.loading("Transaction is Processing on Chain.", {
                id: "tx-loading",
            })
        }
    }, [isConfirming])

    // 2. Transaction Failed (error)
    useEffect(() => {
        if (writeError) {
            toast.dismiss("tx-loading")
            console.warn("⚠️ Transaction Failed/Rejected:", writeError)

            const errorMessage =
                (writeError as any).shortMessage || writeError.message

            if (errorMessage.includes("User rejected")) {
                toast.info("Transaction cancelled by user.")
            } else {
                toast.error(`Transaction Failed: ${errorMessage}`)
            }
        }
    }, [writeError])

    // 3. Transaction Success
    useEffect(() => {
        if (isConfirmed) {
            toast.dismiss("tx-loading")
            console.log("✅ Transaction Confirmed!")

            // Logic Message Dynamic based on txType
            if (txType === "approve") {
                toast.success("Approval Successful! ✅", {
                    description: "You can now proceed to Stake.",
                    duration: 5000,
                })
            } else if (txType === "stake") {
                toast.success("Staking Successful! 🚀", {
                    description: "Your funds are now earning rewards.",
                    duration: 5000,
                })
            } else if (txType === "withdraw") {
                toast.success("Withdrawal Successful! 💸", {
                    description: "Funds & Rewards sent to your wallet.",
                    duration: 5000,
                })
            } else if (txType === "claim") {
                toast.success("Rewards Claimed! 💎", {
                    description: "AEB Tokens sent to your wallet.",
                    duration: 5000,
                })
            }

            queryClient.invalidateQueries()

            // Reset Type
            setTxType(null)
        }
    }, [isConfirmed, queryClient, txType])

    return {
        approve,
        stake,
        withdraw,
        claimReward,
        isLoading: isWritePending || isConfirming,
        isConfirmed,
        userAllowance: (allowance as bigint) || BigInt(0),
        realTimeBalance: formatValue(balanceData as bigint),
        realTimeStaked: formatValue(stakedData as bigint),
        realTimeEarned: formatValue(earnedData as bigint),
        rawBalance: (balanceData as bigint) || BigInt(0),
        rawStaked: (stakedData as bigint) || BigInt(0),
        rawEarned: (earnedData as bigint) || BigInt(0),
        hash,
    }
}
