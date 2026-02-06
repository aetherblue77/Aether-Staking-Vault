# Frontend - Aether Staking Vault 🎨

Welcome to the **Frontend** directory. This is the User Interface (UI) of the Aether Staking Vault. It is the website that allows users to interact with the Smart Contract easily and securely.

I built this frontend using **React** and **Next.js** to ensure it is modern, fast, and user-friendly.

---

## 🛠️ Tech Stack (Tools Used)

I used the latest Web3 technologies to build this application:

* **React & Next.js:** The main library and framework for building the website structure.
* **RainbowKit:** A beautiful tool to handle Wallet Connections (like MetaMask).
* **Wagmi & Viem:** The "engine" that lets the website talk to the Ethereum Blockchain.
* **Apollo Client:** Connects to **The Graph** to fetch data instantly.
* **Framer Motion:** Adds smooth animations (sliding tabs, loading effects).
* **Tailwind CSS:** Used for styling the website with a "Glassmorphism" look.

---

## 🧩 Key Components

The codebase is organized into modular components. Here are the two most important ones:

### 1. `StakingCard.tsx` (The Control Panel)
This is the main component where users interact with the vault. It handles three main logic flows using sliding tabs:
* **Stake:** Users approve and deposit $AEB tokens.
* **Withdraw:** Users can take out their initial deposit.
* **Claim:** Users can collect their earned rewards separately.

*It also includes the logic for the **Faucet**, allowing users with 0 balance to mint free tokens for testing.*

### 2. `StakingStats.tsx` (The Dashboard)
This component fetches and displays global data from The Graph and Smart Contract. It shows:
* **APY:** The Annual Percentage Yield, formatted cleanly (e.g., `315,360.00%`).
* **TVL (Total Value Locked):** The total amount of tokens in the vault, shortened for readability (e.g., `10M` or `1B`).
* **Active Stakers:** The number of unique users currently participating.

---

## ✨ Main Features

* **🔗 Wallet Connection:** Easy login with RainbowKit.
* **⚡ Real-Time Faucet:** A hidden "Stealth" button appears if you need funds.
* **🔄 Live Updates:** Balances and rewards update automatically without refreshing the page.
* **🔔 Toast Notifications:** Beautiful popups (Success/Error) using **Sonner** to give users feedback on their transactions.

---

## 🎨 User Experience (UX)

I focused heavily on making the app look and feel premium:
* **Glassmorphism Design:** Dark theme with transparent glass effects.
* **Smooth Transitions:** Elements slide and fade in using Framer Motion.
* **Mobile Responsive:** Works perfectly on both desktop and mobile screens.

---

*This frontend connects to the Aether Staking Vault Smart Contract deployed on the Sepolia Testnet.*