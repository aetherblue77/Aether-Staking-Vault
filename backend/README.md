# Backend - Smart Contracts & Testing ⚙️

This directory contains the core logic of the **Aether Staking Vault**. It includes the Solidity smart contracts, comprehensive unit tests, and automated deployment scripts powered by **Hardhat**.

## 🛠️ Tech Stack

* **Language:** Solidity (Smart Contracts), TypeScript (Scripts & Tests).
* **Framework:** Hardhat.
* **Libraries:** Ethers.js v6, OpenZeppelin Contracts.
* **Plugins:** `hardhat-deploy` (for deployment management), `hardhat-verify` (for Etherscan verification).

---

## 📜 Smart Contracts

We developed two main contracts for this protocol to ensure a secure and standard DeFi ecosystem:

### 1. Aether Blue Token (`MockERC20.sol`)
* **Symbol:** $AEB
* **Type:** Standard ERC-20 Token (built on top of OpenZeppelin).
* **Total Supply:** 1,000,000,000 (1 Billion) Tokens.
* **Purpose:** The native utility and reward token of the ecosystem.

### 2. Staking Vault (`StakingVault.sol`)
* **Purpose:** Handles the entire staking lifecycle: depositing, earning rewards, and withdrawing.
* **Key Features:**
    * **Dynamic Rewards:** Calculates rewards in real-time using the formula: `(rewardPerToken * stakedAmount)`.
    * **Secure Storage:** Holds the Reward Pool (30% of supply) securely.
    * **Security Mechanisms:** Includes `Pausable` for emergency stops and `nonReentrant` to prevent re-entrancy attacks.
    * **Admin Controls:** Allows the owner to recover non-staking tokens if sent by mistake.

---

## 🚀 Advanced Deployment Workflow

We utilize **`hardhat-deploy`** to automate the entire setup process. The deployment script (`01-deploy-staking.ts`) is designed to be **Idempotent** and **Gas-Efficient**. It intelligently checks the state of the blockchain before executing transactions to avoid redundant operations.

**The 4-Phase Deployment Logic:**

1.  **Phase 1: Token Deployment & Smart Minting**
    * Deploys the $AEB Token.
    * **Smart Logic:** Checks the deployer's balance. If it is less than the target (1 Billion), it calculates the difference and mints only the necessary amount.
2.  **Phase 2: Vault Deployment**
    * Deploys the Staking Contract and links it to the Token address.
3.  **Phase 3: Automated Funding (Tokenomics)**
    * **Smart Logic:** Checks the Vault's balance. If it holds less than **300,000,000 $AEB** (30% Allocation), the script automatically transfers the difference to top up the Reward Pool.
4.  **Phase 4: Gas-Optimized Configuration**
    * **Smart Logic:** Checks the current `rewardRate` on-chain. The script only executes the `setRewardRate` transaction if the value is different from the target (1 Token/sec), saving gas fees on re-runs.

---

## 🧪 Testing Strategy

Quality assurance is a priority. We implemented a robust test suite using **Chai** and **Ethers.js**.

**Test Coverage (16 Unit Tests):**
* **✅ Configuration:** Verifies that token addresses and owner permissions are set correctly upon deployment.
* **✅ Staking Logic:** Ensures user balances and total supply update correctly when users stake tokens.
* **✅ Reward Calculation:** Verifies that the mathematical logic (Reward Per Token) is precise for both single and multiple stakers over time.
* **✅ Withdraw & Claim:** Ensures users can withdraw their principal + rewards in a single transaction without calculation errors.
* **✅ Security Features:** Tests the `pause` and `unpause` functionality and ensures that emergency withdrawals cannot touch user funds.