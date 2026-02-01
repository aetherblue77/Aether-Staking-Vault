import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { ethers, network } from "hardhat"
import { developmentChains } from "../helper-hardhat-config"
import { verify } from "../utils/verify"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("---------------------------------------------------")
    log("🚀 Deploying to network:", network.name.toUpperCase())
    log("---------------------------------------------------")

    const waitBlockConfirmations = developmentChains.includes(network.name) ? 1 : 6

    // ======================================================
    // PHASE 1: DEPLOY TOKEN (Aether Blue)
    // ======================================================
    const tokenName = "Aether Blue"
    const tokenSymbol = "AEB"
    const tokenArgs = [tokenName, tokenSymbol]

    const aetherToken = await deploy("MockERC20", {
        from: deployer,
        args: tokenArgs,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying Token...")
        await verify(aetherToken.address, tokenArgs)
    }

    // Setup Contract Instance for Minting (additional logic)
    const tokenContract = await ethers.getContractAt("MockERC20", aetherToken.address)
    const deployerBalance = await tokenContract.balanceOf(deployer)
    const targetSupply = ethers.parseEther("1000000000") // 1 Billion
    if (deployerBalance < targetSupply) {
        const amountToMint = targetSupply - deployerBalance
        log(
            `⚠️ Balance is ${ethers.formatEther(deployerBalance)} $AEB. Minting ${ethers.formatEther(amountToMint)} to reach 1B...`,
        )
        await (await tokenContract.mint(deployer, amountToMint)).wait(1)
    } else {
        log("✅ Deployer already has 1B+ Tokens.")
    }

    log("---------------------------------------------------")

    // ======================================================
    // PHASE 2: DEPLOY STAKING VAULT
    // ======================================================
    const vaultArgs = [aetherToken.address, aetherToken.address, deployer]
    const stakingVault = await deploy("StakingVault", {
        from: deployer,
        args: vaultArgs,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying Vault...")
        await verify(stakingVault.address, vaultArgs)
    }

    // ======================================================
    // PHASE 3: SETUP FUNDING (30% Supply)
    // ======================================================
    const vaultContract = await ethers.getContractAt("StakingVault", stakingVault.address)
    const vaultBalance = await tokenContract.balanceOf(stakingVault.address)

    // Funding Target: 300 million Token (30% from 1 Billion)
    const FUNDING_AMOUNT = ethers.parseEther("300000000")

    if (vaultBalance < FUNDING_AMOUNT) {
        const amountNeeded = FUNDING_AMOUNT - vaultBalance
        log(
            `💰 Vault has ${ethers.formatEther(vaultBalance)} $AEB. Funding gap: ${ethers.formatEther(amountNeeded)} $AEB...`,
        )
        const tx = await tokenContract.transfer(stakingVault.address, amountNeeded)
        await tx.wait(1)
        log("✅ Vault Funded Successfully!")
    } else {
        log("✅ Vault already funded with 300M tokens.")
    }

    // ======================================================
    // PHASE 4: SET REWARD RATE (1 Token/second)
    // ======================================================
    const REWARD_RATE = ethers.parseEther("1")
    const currentRewardRate = await vaultContract.s_rewardRate()

    if (currentRewardRate.toString() !== REWARD_RATE.toString()) {
        log("⚙️  Setting Reward Rate to 1 $AEB/second...")
        const txRate = await vaultContract.setRewardRate(REWARD_RATE)
        await txRate.wait(1)
        log("✅ Reward Rate Set!")
    } else {
        log("✅ Reward Rate is already set.")
    }
    log("---------------------------------------------------")
}

export default func
func.tags = ["all", "stakingVault"]
