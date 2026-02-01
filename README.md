# Aether Staking Vault 🛡️💰

**A Decentralized Finance (DeFi) Staking Protocol built on Ethereum.**

Welcome to the **Aether Staking Vault** repository. This is a Fullstack Web3 portfolio project designed to demonstrate a complete, secure, and tested DeFi staking system. The protocol allows users to stake their **Aether Blue ($AEB)** tokens and earn rewards in real-time based on a dynamic emission rate.

## 🎯 Project Goal

The main objective of this project is not just to build a simple DApp, but to master the underlying "engine" of DeFi. I built this to demonstrate competency in:

* **Complex Staking Logic:** Handling time-based mathematical calculations (`rewardPerToken`, `lastTimeRewardApplicable`) to ensure precise reward distribution.
* **Security First:** Implementing the "Checks-Effects-Interactions" pattern to prevent re-entrancy attacks and ensure fund safety.
* **Smart Deployment:** Automating tokenomics setup (minting & funding) using advanced Hardhat scripts.
* **Testing:** Writing comprehensive unit tests to cover edge cases, ensuring the system is robust before deployment.

## ⚙️ How It Works

1.  **The Token ($AEB):** A standard ERC-20 token with a total supply of **1 Billion**.
2.  **The Vault:** A smart contract that holds **30% of the Total Supply** (300 Million AEB) as a reward pool.
3.  **Staking:** Users deposit $AEB into the Vault.
4.  **Rewards:** The Vault distributes rewards at a fixed rate (e.g., 1 Token/second) proportionally to all stakers.

## 🗺️ Project Roadmap & Status

This project follows a strict development phase. Below is the current progress:

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1** | **Smart Contract Logic**<br>Writing solidity contracts for Token and Vault. | ✅ **Completed** |
| **Phase 2** | **Backend Deployment & Testing**<br>16/16 Unit Tests passed. Deployed & Verified on **Sepolia Testnet**. | ✅ **Completed** |
| **Phase 3** | **Frontend Integration**<br>Building the UI using Next.js, RainbowKit, and Wagmi. | ⏳ **In Progress** |
| **Phase 4** | **Mainnet Launch**<br>Final audit and deployment to a main network. | 🔜 **Planned** |

## 📂 Repository Structure

This is a monorepo containing both the smart contract logic and the user interface. **Click the folders below to navigate:**

* 📂 **[backend](./backend)**
    * Contains the **Hardhat project** (Smart Contracts, Unit Tests, Deploy Scripts).
    * See the `README.md` inside this folder for technical documentation.

* 📂 **[frontend](./frontend)**
    * Contains the **Next.js project** (User Interface).
    * *(Coming Soon)*

## 🔗 Live Deployments (Sepolia)

The backend is currently live and verified on the Sepolia Testnet.

* **Aether Blue Token ($AEB):** [Insert Etherscan Link Here](https://sepolia.etherscan.io/token/0x7E51694815a2256B20Ebf6671Fc775edA01b0c66)
* **Staking Vault Contract:** [Insert Etherscan Link Here](https://sepolia.etherscan.io/address/0xefa42Ac3A6893d10daD0ebB7a3c7dfA9b59C4A01)

---

*Project by **Aether Blue**. Open for feedback and contributions.*