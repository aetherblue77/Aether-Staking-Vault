import { network } from "hardhat"
import * as fs from "fs"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

// Constanta for Path Frontend
const FRONTEND_ADDRESSES_FILE = "../frontend/src/constants/contractAddresses.json"
const FRONTEND_ABI_FILE = "../frontend/src/constants/abis.json"

const updateFrontend: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    if (process.env.UPDATE_FRONTEND) {
        console.log("📦 Updating frontend...")
        await updateContractData(hre)
    }
}

async function updateContractData(hre: HardhatRuntimeEnvironment) {
    const { deployments } = hre
    const chainId = network.config.chainId?.toString()

    // 1. Take the newly deployed Contract
    // Use deployments.get() to get the contract
    const stakingVaultDeploy = await deployments.get("StakingVault")
    const tokenDeploy = await deployments.get("MockERC20")

    // 2. Read the old file address (if exist)
    let currentAddresses: any = {}
    if (fs.existsSync(FRONTEND_ADDRESSES_FILE)) {
        currentAddresses = JSON.parse(fs.readFileSync(FRONTEND_ADDRESSES_FILE, "utf8"))
    }

    // 3. Update Address
    if (chainId) {
        if (!currentAddresses[chainId]) {
            currentAddresses[chainId] = {}
        }
        currentAddresses[chainId] = {
            StakingVault: stakingVaultDeploy.address,
            AetherToken: tokenDeploy.address,
        }
    }

    // 4. Make sure constants folder exist
    const dir = "../frontend/src/constants"
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    // 5. Save the address to JSON
    fs.writeFileSync(FRONTEND_ADDRESSES_FILE, JSON.stringify(currentAddresses, null, 2))

    // 6. Save the ABI to JSON (Merged Approach - Efficient!)
    const abis = {
        StakingVault: stakingVaultDeploy.abi,
        AetherToken: tokenDeploy.abi,
    }

    fs.writeFileSync(FRONTEND_ABI_FILE, JSON.stringify(abis, null, 2))

    console.log("✅ Frontend updated!")
}

export default updateFrontend
updateFrontend.tags = ["all", "frontend"]
