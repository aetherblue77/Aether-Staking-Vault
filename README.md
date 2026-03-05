# Aether Staking Vault 🛡️💰

**A Full-Stack Decentralized Finance (DeFi) Staking Protocol.**

Welcome to the **Aether Staking Vault**. This is a complete Web3 portfolio project that demonstrates how a DeFi system works from start to finish. It connects a secure **Smart Contract** (Backend) with a modern **User Interface** (Frontend) and uses **The Graph** (Data Indexing) for high-performance data fetching.

Users can stake their **Aether Blue ($AEB)** tokens to earn rewards in real-time.

---

> 🚀 **[Try the Live Demo Here!](https://aether-staking-vault.vercel.app/)**
> *(Connect to Sepolia Testnet to interact)*

---

## 📽️ Video Demo
https://github.com/aetherblue77/aether-staking-vault/raw/main/assets/demo.mp4

---

## 🎯 Why This Project?

I built this project to master the "full circle" of Web3 development. It demonstrates competency in:

* **Smart Contract Engineering:** Writing secure Solidity code with complex math for reward calculations.
* **Full-Stack Integration:** Connecting a blockchain backend to a Next.js frontend using Wagmi and Viem.
* **Data Indexing:** Using **The Graph** to read blockchain data instantly without slowing down the website.
* **User Experience (UX):** Creating a smooth UI with real-time updates, loading states, and error handling.

---

## ⚙️ How It Works

1.  **The Token:** We use **$AEB**, a standard ERC-20 token.
2.  **The Vault:** Users deposit (stake) their $AEB into the Smart Contract.
3.  **The Rewards:** The Vault calculates rewards every second. The more you stake and the longer you stay, the more you earn.
4.  **The Faucet:** For testing purposes, the UI includes a "Faucet" button so anyone can get free $AEB tokens to try the system.

---

## 🗺️ Project Status

All major phases of development are now **Completed**.

| Phase | Component | Description | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Backend** | Smart Contracts (Solidity), Unit Testing, and Hardhat Scripts. | ✅ **Completed** |
| **Phase 2** | **Deployment** | Deployed and verified contracts on **Sepolia Testnet**. | ✅ **Completed** |
| **Phase 3** | **Data Layer** | Built and deployed a **Subgraph** to index staking data efficiently. | ✅ **Completed** |
| **Phase 4** | **Frontend** | Built the UI with Next.js, integrated Faucet, APY Math, and Animations. | ✅ **Completed** |

---

## 📂 Repository Structure

This is a **monorepo** (one repository with multiple parts). Click the folders below to explore the code for each section:

* 📂 **[backend](./backend)**
    * Contains the **Hardhat** project.
    * Here you will find the Solidity Smart Contracts, deploy scripts, and security tests.

* 📂 **[subgraph](./subgraph)**
    * Contains **The Graph** project.
    * This defines how we listen to blockchain events (like `Staked` or `Withdrawn`) and organize the data for the website.

* 📂 **[frontend](./frontend)**
    * Contains the **Next.js** project.
    * This is the website where users interact with the protocol. It handles wallet connection, formatting numbers (like `1.2M`), and animations.

---

## 🔗 Live Deployments (Sepolia Testnet)

The system is live on the Sepolia test network. You can view the contracts on Etherscan:

* **Aether Blue Token ($AEB):** [View on Etherscan](https://sepolia.etherscan.io/address/0x735DD828cAfF16701dabd4d46E345012C89463c9)
* **Staking Vault Contract:** [View on Etherscan](https://sepolia.etherscan.io/address/0x496CA82e57E3356d46CBB0209Dc68d23CC26D7B0)

---

*Project by **Aether Blue**. Built to demonstrate Web3 mastery.*