# GenLayer Bounty Review

Next.js frontend for GenLayer Bounty Review - AI-powered developer tasks and trustless work evaluation on the GenLayer blockchain.

## Setup

1. Install dependencies:

**Using bun:**
```bash
bun install
```

**Using npm:**
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` - GenLayer Football Betting contract address
   - `NEXT_PUBLIC_STUDIO_URL` - GenLayer Studio URL (default: https://studio.genlayer.com/api)

## Development

**Using bun:**
```bash
bun dev
```

**Using npm:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

**Using bun:**
```bash
bun run build
bun start
```

**Using npm:**
```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with custom glass-morphism theme
- **genlayer-js** - GenLayer blockchain SDK
- **TanStack Query (React Query)** - Data fetching and caching
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Pre-built UI components

## Wallet Management

The app uses GenLayer's account system:
- **Create Account**: Generate a new private key
- **Import Account**: Import existing private key
- **Export Account**: Export your private key (secured)
- **Disconnect**: Clear stored account data

Accounts are stored in browser's localStorage for development convenience.

## Features

- **Post Bounties**: Create developer tasks by specifying a title, strict AI evaluation criteria, and a locked token reward.
- **Trustless AI Verification**: Developers submit work URLs (e.g., GitHub repos, live sites) for autonomous, decentralized evaluation via GenLayer's GenVM.
- **Submission History Panel**: Track your past submissions, AI evaluation statuses (Evaluated & Paid / AI Rejected), and payout records in a dynamic, color-coded dashboard.
- **Real-Time Data Syncing**: Automatic blockchain polling via TanStack Query ensures the dashboard updates instantly without manual page refreshes.
- **Premium UI/UX**: Dark mode aesthetic featuring glass-morphism backdrop blur effects, smooth state transitions, and custom **Switzer** typography for a high-end Web3 experience.

## Smart Contract & Consensus Logic

The complete Intelligent Contract source code can be found in `/contracts/bounty_contract_update.py`.

- **Evaluation & Validator Logic**: Utilizes GenVM's `gl.nondet.web.render` to read the submitted URL, and `gl.nondet.exec_prompt` to achieve AI consensus on whether the submission strictly meets the creator's criteria.
- **State Transitions & Payout**: Upon a successful AI consensus vote, the contract autonomously closes the bounty (`is_open = False`), logs the `winner_address`, and immediately executes `gl.contract.transfer` to release the escrowed funds to the developer.

## Escrow & AI Evaluation System

This platform utilizes a zero-trust, automated escrow system powered by the GenLayer Virtual Machine (GenVM).

* **Secure Escrow:** Bounty funds are cryptographically locked in a per-bounty state upon minting.
* **Incorruptible AI Judge:** Submissions are evaluated by GenVM against the creator's strict criteria.
* **Automated Payouts:** If the AI returns an `ACCEPTED` verdict, the smart contract zeroes out the escrow and instantly transfers the funds to the developer. If rejected, funds remain protected.

### Running Local Tests
The smart contract logic, including AI environment mocking and escrow protection, is mathematically verified using `pytest`.

```bash
pip install genlayer pytest
pytest gen_contracts/test_contract.py