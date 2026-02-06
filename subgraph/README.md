# Subgraph - Aether Staking Vault 🕸️

Welcome to the **Subgraph** directory. This part of the project acts as the "Data Layer" for the Aether Staking Vault. It is built using **The Graph** protocol.

In simple terms, the Subgraph listens to everything happening on the Blockchain and organizes that messy data into a clean list that our website (Frontend) can read instantly.

---

## 🎯 Why Do We Need This?

Reading data directly from a Smart Contract can be slow and limited. For example, asking the Blockchain *"Who are all the users that ever staked?"* is very difficult and expensive.

The Subgraph solves this by:
1.  **Indexing:** Watching every transaction as it happens.
2.  **Organizing:** Saving important details (like who staked, how much, and when) into a database.
3.  **Serving:** Letting the Frontend ask complex questions like *"Give me the top 5 stakers"* instantly using GraphQL.

---

## 📝 What Data Do We Track?

I designed the `schema.graphql` to track three main things:

### 1. `StakingStat` (Global Data)
This entity keeps track of the "Big Picture" numbers for the entire protocol:
* **Total Value Locked (TVL):** The sum of all tokens currently in the vault.
* **Total Active Stakers:** The count of unique users who have money in the vault.

### 2. `User` (Individual Data)
This tracks information about each specific person using the app:
* **Address:** The wallet address of the user.
* **Balance:** How many tokens they currently have staked.
* **Earned:** How many rewards they have claimed so far.

### 3. `Action` (History)
This records a history of every single move a user makes, useful for showing a "Transaction History":
* **Type:** Was it a `Stake`, `Withdraw`, or `Claim`?
* **Amount:** How many tokens were involved?
* **Timestamp:** When did it happen?

---

## 🛠️ Tech Stack

* **The Graph Protocol:** The core technology for indexing.
* **GraphQL:** The query language used to fetch the data.
* **AssemblyScript:** The language used to write the logic (mappings) that transforms raw blockchain events into useful data.

---

*This Subgraph is deployed and hosted on The Graph Studio, listening to the Aether Staking Vault contract on Sepolia.*