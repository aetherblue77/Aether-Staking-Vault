import { expect } from "chai"
import { ethers } from "hardhat"
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers"

describe("Staking Vault Unit Tests", function () {
    const REWARD_RATE = ethers.parseEther("100") // 100 Token / second
    const STAKE_AMOUNT = ethers.parseEther("100")
    const INITIAL_MINT = ethers.parseEther("1000000")

    // --- FIXTURE SETUP ---
    async function deployStakingFixture() {
        // 1. Take Account
        const [deployer, user1, user2, user3] = await ethers.getSigners()

        // 2. Deploy Mock Tokens
        const mockERC20Factory = await ethers.getContractFactory("MockERC20")
        const stakingToken = await mockERC20Factory.deploy("Staking Token", "STK")
        const rewardToken = await mockERC20Factory.deploy("Reward Token", "RWD")

        // 3. Deploy Staking Vault
        const stakingVaultFactory = await ethers.getContractFactory("StakingVault")
        const stakingVault = await stakingVaultFactory.deploy(
            await stakingToken.getAddress(),
            await rewardToken.getAddress(),
            deployer.address,
        )

        // 4. Setup Initial Condition (Initial State)
        // - Top up your Reward Pool balance in the Vault (500,000 Tokens)
        await rewardToken.mint(await stakingVault.getAddress(), ethers.parseEther("500000"))

        // - Give Capital for User 1 & User 2
        await stakingToken.mint(user1.address, INITIAL_MINT)
        await stakingToken.mint(user2.address, INITIAL_MINT)

        // Set Reward Rate
        await stakingVault.connect(deployer).setRewardRate(REWARD_RATE)

        // Approve
        await stakingToken
            .connect(user1)
            .approve(await stakingVault.getAddress(), ethers.MaxInt256)
        await stakingToken
            .connect(user2)
            .approve(await stakingVault.getAddress(), ethers.MaxInt256)

        return {
            stakingVault,
            stakingToken,
            rewardToken,
            deployer,
            user1,
            user2,
            user3,
        }
    }

    // ================================================
    // 1. DEPLOYMENT TESTS
    // ================================================
    describe("Deployment & Config", function () {
        it("Revert if staking token address is 0", async function () {
            const { rewardToken, deployer } = await loadFixture(deployStakingFixture)
            const stakingVaultFactory = await ethers.getContractFactory("StakingVault")
            await expect(
                stakingVaultFactory.deploy(
                    ethers.ZeroAddress,
                    await rewardToken.getAddress(),
                    deployer.address,
                ),
            ).to.be.revertedWithCustomError(stakingVaultFactory, "StakingVault__ZeroAddress")
        })

        it("Should set the correct token addresses and owner", async function () {
            const { stakingVault, stakingToken, rewardToken, deployer } =
                await loadFixture(deployStakingFixture)
            expect(await stakingVault.i_stakingToken()).to.equal(await stakingToken.getAddress())
            expect(await stakingVault.i_rewardToken()).to.equal(await rewardToken.getAddress())
            expect(await stakingVault.owner()).to.equal(deployer.address)
        })

        it("Should set the correct reward rate", async function () {
            const { stakingVault } = await loadFixture(deployStakingFixture)
            expect(await stakingVault.s_rewardRate()).to.equal(REWARD_RATE)
        })
    })

    // ================================================
    // 2. STAKING LOGIC
    // ================================================
    describe("Staking Logic", function () {
        it("Should revert if amount is 0", async function () {
            const { stakingVault, user1 } = await loadFixture(deployStakingFixture)
            await expect(stakingVault.connect(user1).stake(0)).to.be.revertedWithCustomError(
                stakingVault,
                "StakingVault__ZeroAmount",
            )
        })

        it("Should stake successfully and update balances", async function () {
            const { stakingVault, user1 } = await loadFixture(deployStakingFixture)

            // User 1 stake 100 Token
            await expect(stakingVault.connect(user1).stake(STAKE_AMOUNT))
                .to.emit(stakingVault, "Staked")
                .withArgs(user1.address, STAKE_AMOUNT)

            // Check State in Vault
            expect(await stakingVault.balanceOf(user1.address)).to.equal(STAKE_AMOUNT)
            expect(await stakingVault.totalSupply()).to.equal(STAKE_AMOUNT)
        })
    })

    // ================================================
    // 3. REWARD CALCULATION (THE MATH)
    // ================================================
    describe("Reward Calculation", function () {
        it("Should calculate rewards correctly for 1 user", async function () {
            const { stakingVault, user1 } = await loadFixture(deployStakingFixture)

            // User1 Stake
            await stakingVault.connect(user1).stake(STAKE_AMOUNT)

            // Time skip 10 seconds
            await time.increase(10)

            // check user1 get 10 seconds * 100 Token = 1000 Token
            const earned = await stakingVault.earned(user1.address)
            expect(earned).to.be.closeTo(ethers.parseEther("1000"), ethers.parseEther("1"))
        })

        it("Should split rewards correctly between 2 users", async function () {
            const { stakingVault, user1, user2 } = await loadFixture(deployStakingFixture)

            // User 1 stake 100 Token
            await stakingVault.connect(user1).stake(STAKE_AMOUNT)

            // Time skip 10 seconds
            await time.increase(10)
            const earned1 = await stakingVault.earned(user1.address)

            // User 2 stake 100 Token
            await stakingVault.connect(user2).stake(STAKE_AMOUNT)

            // Time skip 10 seconds again
            await time.increase(10)
            const earned2 = await stakingVault.earned(user2.address)

            // Check User 2 (Phase 2): 10 seconds * 50 = 500 Token
            expect(earned2).to.be.closeTo(ethers.parseEther("500"), ethers.parseEther("1"))

            // Check User 1 (Phase 1 + User2 Stake in (1 seconds) + Phase 2):
            // 1000 + 100 + 500 = 1600 Token
            const earned1_total = await stakingVault.earned(user1.address)
            expect(earned1_total).to.be.closeTo(ethers.parseEther("1600"), ethers.parseEther("1"))
        })
    })

    // ================================================
    // 4. WITHDRAW & CLAIM REWARD
    // ================================================
    describe("Withdraw & Claim Reward", function () {
        it("Revert if withdraw amount is 0", async function () {
            const { stakingVault, user1 } = await loadFixture(deployStakingFixture)
            await expect(stakingVault.connect(user1).withdraw(0)).to.be.revertedWithCustomError(
                stakingVault,
                "StakingVault__ZeroAmount",
            )
        })

        it("Revert if withdraw amount exceeds balance", async function () {
            const { stakingVault, user1 } = await loadFixture(deployStakingFixture)
            // User Stake 100 Token
            await stakingVault.connect(user1).stake(STAKE_AMOUNT)
            // User try to withdraw 101 Token
            await expect(
                stakingVault.connect(user1).withdraw(ethers.parseEther("101")),
            ).to.be.revertedWithCustomError(stakingVault, "StakingVault__InsufficientBalance")
        })

        it("Should withdraw principal and claim reward automatically", async function () {
            const { stakingVault, stakingToken, user1, rewardToken } =
                await loadFixture(deployStakingFixture)

            // Setup Stake and wait
            await stakingVault.connect(user1).stake(STAKE_AMOUNT)
            await time.increase(10)

            const balancePrincipalBefore = await stakingToken.balanceOf(user1.address)
            const balanceRewardBefore = await rewardToken.balanceOf(user1.address)

            // Action: Withdraw
            await stakingVault.connect(user1).withdraw(STAKE_AMOUNT)

            // Check Principal (balance +100)
            const balancePrincipalAfter = await stakingToken.balanceOf(user1.address)
            expect(balancePrincipalAfter).to.equal(balancePrincipalBefore + STAKE_AMOUNT)

            // Check Reward (Balance + ~1000)
            const balanceRewardAfter = await rewardToken.balanceOf(user1.address)
            expect(balanceRewardAfter - balanceRewardBefore).to.be.closeTo(
                ethers.parseEther("1100"),
                ethers.parseEther("1"),
            )
        })
    })

    // ================================================
    // 5. SECURITY (PAUSE & EMERGENCY WITHDRAW)
    // ================================================
    describe("Security Features", function () {
        it("Revert emergency withdraw if balance is 0", async function () {
            const { stakingVault, deployer, user1 } = await loadFixture(deployStakingFixture)
            // Pause first
            await stakingVault.connect(deployer).pause()
            await expect(
                stakingVault.connect(user1).emergencyWithdraw(),
            ).to.be.revertedWithCustomError(stakingVault, "StakingVault__ZeroAmount")
        })

        it("Should enforce pause on stake/withdraw", async function () {
            const { stakingVault, deployer, user1 } = await loadFixture(deployStakingFixture)
            await stakingVault.connect(deployer).pause()

            await expect(stakingVault.connect(user1).stake(100)).to.be.revertedWithCustomError(
                stakingVault,
                "EnforcedPause",
            )
            await expect(stakingVault.connect(user1).withdraw(100)).to.be.revertedWithCustomError(
                stakingVault,
                "EnforcedPause",
            )
        })

        it("Should allow emergency withdraw (Principal only) when paused", async function () {
            const { stakingVault, rewardToken, deployer, user1 } =
                await loadFixture(deployStakingFixture)

            // Setup Stake and wait long time
            await stakingVault.connect(user1).stake(STAKE_AMOUNT)
            await time.increase(100)

            // Pause Contract
            await stakingVault.connect(deployer).pause()

            const rewardBefore = await rewardToken.balanceOf(user1.address)

            // Action: Emergency Withdraw
            await stakingVault.connect(user1).emergencyWithdraw()

            // Check: Reward should not increase
            const rewardAfter = await rewardToken.balanceOf(user1.address)
            expect(rewardAfter).to.equal(rewardBefore)

            // Check: Principal user in Vault become 0
            expect(await stakingVault.balanceOf(user1.address)).to.equal(0)
        })

        it("Should allow owner to unpause and resume staking", async function () {
            const { stakingVault, deployer, user1 } = await loadFixture(deployStakingFixture)
            // 1. Pause
            await stakingVault.connect(deployer).pause()
            // Make sure stake fail when paused
            await expect(
                stakingVault.connect(user1).stake(STAKE_AMOUNT),
            ).to.be.revertedWithCustomError(stakingVault, "EnforcedPause")
            // 2. Unpause
            await stakingVault.connect(deployer).unpause()
            // 3. Try to State again --> Success
            await expect(stakingVault.connect(user1).stake(STAKE_AMOUNT)).to.not.be.reverted
            expect(await stakingVault.balanceOf(user1.address)).to.equal(STAKE_AMOUNT)
        })
    })

    // ================================================
    // 6. MANUAL CLAIM REWARD
    // ================================================
    describe("Manual Claim Reward", function () {
        it("Should allow user to claim reward without withdrawing principal", async function () {
            const { stakingVault, rewardToken, user1 } = await loadFixture(deployStakingFixture)

            // 1. Stake
            await stakingVault.connect(user1).stake(STAKE_AMOUNT)
            // 2. Wait For 10 Seconds
            await time.increase(10)
            const balanceRewardBefore = await rewardToken.balanceOf(user1.address)
            // 3. ACTION: Manual Claim Reward
            await expect(stakingVault.connect(user1).claimReward()).to.emit(
                stakingVault,
                "RewardPaid",
            )
            // 4. Verification Reward
            const balanceRewardAfter = await rewardToken.balanceOf(user1.address)
            expect(balanceRewardAfter).to.be.gt(balanceRewardBefore)
            // 5. Verification Principal
            expect(await stakingVault.balanceOf(user1.address)).to.equal(STAKE_AMOUNT)
        })
    })

    // ================================================
    // 7. ADMIN RECOVERY
    // ================================================
    describe("Admin Functions", function () {
        it("Should recover random tokens but NOT staking tokens", async function () {
            const { stakingVault, stakingToken, deployer } =
                await loadFixture(deployStakingFixture)

            // 1. Admin try to get Staking Token -> Must fail
            await expect(
                stakingVault
                    .connect(deployer)
                    .recoverERC20(await stakingToken.getAddress(), ethers.parseEther("100")),
            ).to.be.revertedWithCustomError(stakingVault, "StakingVault__CannotTakeStakingToken")

            // 2. Admin try to get Random Token -> Must success
            // Deploy Random Token
            const MockERC20Factory = await ethers.getContractFactory("MockERC20")
            const randomToken = await MockERC20Factory.deploy("Random", "RND")
            // Send to Staking Vault
            await randomToken.mint(stakingVault.getAddress(), ethers.parseEther("1000"))
            // Recover
            await expect(
                stakingVault
                    .connect(deployer)
                    .recoverERC20(await randomToken.getAddress(), ethers.parseEther("1000")),
            ).to.emit(stakingVault, "Recovered")
        })
    })
})
