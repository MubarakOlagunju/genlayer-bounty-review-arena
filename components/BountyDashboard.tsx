"use client";

import { useState } from "react";
import { useAllBounties, useEvaluateSubmission, useSubmitWork } from "../lib/hooks/useBounty";

interface DashboardProps {
  contractAddress: string;
  userAddress: string;
}

export default function BountyDashboard({ contractAddress, userAddress }: DashboardProps) {
  // Fetch all bounties from the blockchain JSON string
  const { data: bounties, isLoading } = useAllBounties(contractAddress, userAddress);
  const { mutateAsync: evaluate, isPending } = useEvaluateSubmission(contractAddress, userAddress);
  
  // Bring in the history recorder
  const { recordSubmission } = useSubmitWork();
  
  // Keep track of input URLs for each individual bounty ID
  const [submissionUrls, setSubmissionUrls] = useState<Record<string, string>>({});
  const [activeBountyId, setActiveBountyId] = useState<string | null>(null);

  const handleUrlChange = (id: string, url: string) => {
    setSubmissionUrls(prev => ({ ...prev, [id]: url }));
  };

  const handleSubmit = async (bountyId: string) => {
    const url = submissionUrls[bountyId];
    if (!url || !userAddress) return;
    
    setActiveBountyId(bountyId);
    
    // Grab the title of the bounty we are submitting to for the history log
    const bountyTitle = bounties?.[bountyId]?.title || `Bounty #${bountyId}`;

    try {
      // The smart contract expects an integer ID and a string URL
      await evaluate({ bountyId: Number(bountyId), submissionUrl: url });
      
      // If the AI accepts it and the transaction passes, record it as a win!
      recordSubmission(bountyTitle, url, "Evaluated & Paid");
      alert("Submission successful! AI evaluated and accepted your work.");
      
    } catch (error) {
      console.error("Evaluation failed", error);
      
      // If the AI rejects it, record the failure
      recordSubmission(bountyTitle, url, "AI Rejected");
      alert("Transaction failed or AI rejected the submission.");
    }
    
    // Clear the input box and reset the loading state
    setSubmissionUrls(prev => ({ ...prev, [bountyId]: "" }));
    setActiveBountyId(null);
  };

  if (isLoading) {
    return <div className="text-white text-center mt-10">Syncing with GenLayer...</div>;
  }
  
  // Convert the fetched dictionary into an array so we can map over it
  const bountyEntries = bounties ? Object.entries(bounties) : [];

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8 space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">Active Bounties</h2>

      {bountyEntries.length === 0 ? (
        <p className="text-gray-400">No bounties have been minted yet. Be the first!</p>
      ) : (
        bountyEntries.map(([id, bounty]) => (
          <div key={id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg transition hover:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{id} - {bounty.title}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Creator: {bounty.creator.slice(0, 6)}...{bounty.creator.slice(-4)}
                </p>
              </div>
              <div className="bg-blue-900/50 border border-blue-500 text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
                {bounty.is_open ? `Escrow Locked: ${Number(bounty.reward_escrow)} Tokens` : "Escrow Paid Out"}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-1">AI Criteria:</h4>
              <p className="text-gray-400 text-sm bg-gray-800 p-3 rounded-lg border border-gray-800">
                {bounty.criteria}
              </p>
            </div>

            {/* This keeps your original core feature entirely intact! */}
            {bounty.is_open ? (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <label className="block text-sm font-medium text-gray-300 mb-2">Submit Your Work URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={submissionUrls[id] || ""}
                    onChange={(e) => handleUrlChange(id, e.target.value)}
                    placeholder="https://github.com/your-repo..."
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleSubmit(id)}
                    disabled={isPending || !submissionUrls[id] || !userAddress}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                  >
                    {isPending && activeBountyId === id ? "AI is Reviewing..." : "Submit to AI"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <span className="inline-flex items-center text-green-400 font-medium bg-green-900/30 px-3 py-1 rounded-lg border border-green-800">
                  ✓ Paid to: {bounty.winner_address.slice(0, 6)}...{bounty.winner_address.slice(-4)}
                </span>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}