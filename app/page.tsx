"use client";

import CreateBounty from "@/components/CreateBounty";
import BountyDashboard from "@/components/BountyDashboard";
import SubmissionHistory from "@/components/SubmissionHistory";
import { useWallet, formatAddress } from "@/lib/genlayer/wallet";
import { Button } from "@/components/ui/button";
import { useSubmitWork } from "@/lib/hooks/useBounty";

export default function Home() {
  const { address, isConnected, isLoading, connectWallet, disconnectWallet } = useWallet();
  const { submissions } = useSubmitWork(); 
  
  // Pull the contract address from your .env file
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-8">
      {/* Increased max-w to 7xl to allow the side-by-side grid to fit nicely */}
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Navigation */}
        <header className="flex justify-between items-center pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              GenLayer Bounty Arena
            </h1>
            <p className="text-sm text-gray-400 mt-1">Trustless AI work evaluation & creation</p>
          </div>
          
          {/* Inline Wallet Connection UI */}
          <div>
            {isLoading ? (
              <Button disabled variant="outline">Loading...</Button>
            ) : !isConnected || !address ? (
              <Button onClick={connectWallet}>Connect Wallet</Button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="bg-white/10 px-3 py-1.5 rounded-md text-sm border border-white/10 font-mono text-gray-300">
                  {formatAddress(address)}
                </div>
                <Button variant="destructive" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </header>
        
        {/* Main Content Area */}
        <section>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Decentralized AI Bounties</h2>
            <p className="text-gray-400 text-sm max-w-2xl">
              Create custom developer tasks or submit your completed work to active bounties below. GenLayer's GenVM AI will automatically evaluate submissions against strict criteria to execute escrow payouts.
            </p>
          </div>
          
          {/* Milestone 2 Layout: Only show if wallet is connected */}
          {isConnected && address ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column: Create Form */}
              <div className="lg:col-span-1 lg:sticky lg:top-8">
                <CreateBounty 
                  contractAddress={contractAddress} 
                  userAddress={address} 
                />
              </div>

              {/* Right Column: Dashboard Feed */}
              <div className="lg:col-span-2">
                <BountyDashboard 
                  contractAddress={contractAddress} 
                  userAddress={address} 
                />
              </div>

            </div>
          ) : (
            // Empty state asking user to connect
            <div className="text-center py-20 bg-gray-900/50 border border-gray-800 rounded-xl">
              <p className="text-xl text-gray-400">Please connect your Web3 wallet to access the Bounty Factory.</p>
            </div>
          )}
          
          {/* Original Submission History Layout retained */}
          {isConnected && address && submissions && submissions.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <h2 className="text-xl font-semibold mb-4">Submission History</h2>
              <SubmissionHistory />
            </div>
          )}

        </section>

      </div>
    </main>
  );
}