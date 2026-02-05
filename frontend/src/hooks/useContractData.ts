import { useChainId } from "wagmi"
import addresses from "../constants/contractAddresses.json"
import abis from "../constants/abis.json"

export function useContractData() {
    const chainId = useChainId()
    const chainIdString = chainId ? chainId.toString() : "11155111"

    const addressList = (addresses as any)[chainIdString]

    return {
        stakingAddress: addressList?.StakingVault,
        tokenAddress: addressList?.AetherToken,
        stakingAbi: abis.StakingVault,
        tokenAbi: abis.AetherToken,
        isSupported: !!addressList, // True if network is supported
    }
}
